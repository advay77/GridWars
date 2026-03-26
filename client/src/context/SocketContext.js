'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(30);
  const [cooldown, setCooldown] = useState(500);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalCells: 900,
    claimedCells: 0,
    freeCells: 900,
    onlineUsers: 0,
    percentClaimed: '0.0',
  });
  const [notifications, setNotifications] = useState([]);
  const [cooldownActive, setCooldownActive] = useState(false);
  const notifIdRef = useRef(0);

  const addNotification = useCallback((message) => {
    const id = notifIdRef.current++;
    setNotifications((prev) => [...prev.slice(-4), { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('init', (data) => {
      setUser(data.user);
      setGridSize(data.gridSize);
      setCooldown(data.cooldown);
      setGrid(data.grid);
      setLeaderboard(data.leaderboard);
      setStats(data.stats);
    });

    socketInstance.on('block:claimed', (data) => {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        const { row, col, owner, ownerId, color } = data.cell;
        newGrid[row][col] = { ...newGrid[row][col], owner, ownerId, color, justClaimed: true };
        return newGrid;
      });
      setLeaderboard(data.leaderboard);
      setStats(data.stats);

      // Update user's block count if the claim involves this user
      setUser((prev) => {
        if (!prev) return prev;
        if (data.user.id === prev.id) {
          return { ...prev, blocksOwned: data.user.blocksOwned };
        }
        // If someone stole our block, recalculate from leaderboard
        const myEntry = data.leaderboard.find((e) => e.name === prev.name);
        if (myEntry) {
          return { ...prev, blocksOwned: myEntry.blocksOwned };
        }
        return prev;
      });

      // Clear justClaimed after animation
      setTimeout(() => {
        setGrid((prev) => {
          const newGrid = prev.map((row) => [...row]);
          const { row, col } = data.cell;
          if (newGrid[row] && newGrid[row][col]) {
            newGrid[row][col] = { ...newGrid[row][col], justClaimed: false };
          }
          return newGrid;
        });
      }, 600);
    });

    socketInstance.on('claim:failed', (data) => {
      if (data.reason === 'cooldown') {
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), data.remaining || 500);
      }
    });

    socketInstance.on('user:joined', (data) => {
      setStats((prev) => ({ ...prev, onlineUsers: data.onlineCount }));
      addNotification(`<span class="highlight">${data.user.name}</span> joined the battle`);
    });

    socketInstance.on('user:left', (data) => {
      setStats((prev) => ({ ...prev, onlineUsers: data.onlineCount }));
      addNotification(`<span class="highlight">${data.userName}</span> left`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [addNotification]);

  const claimBlock = useCallback(
    (row, col) => {
      if (socket && connected) {
        socket.emit('claim', { row, col });
      }
    },
    [socket, connected]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        user,
        grid,
        gridSize,
        cooldown,
        leaderboard,
        stats,
        notifications,
        cooldownActive,
        claimBlock,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
