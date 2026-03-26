'use client';

import { useSocket } from '@/context/SocketContext';
import { 
  Swords, 
  UserRound, 
  BarChart2, 
  Trophy, 
  Crown,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const { user, leaderboard, stats } = useSocket();

  if (!user) return null;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Swords size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <h1>GridWars</h1>
            <span>Real-time territory</span>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="glass-card" id="user-panel">
          <div className="card-title">
            <UserRound className="icon" size={14} /> Your Profile
          </div>
          <div className="user-info">
            <div
              className="user-avatar"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>
                <span
                  className="user-color-dot"
                  style={{ backgroundColor: user.color }}
                />
                {user.blocksOwned || 0} blocks owned
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card" id="stats-panel">
          <div className="card-title">
            <BarChart2 className="icon" size={14} /> Grid Stats
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value accent">{stats.claimedCells}</div>
              <div className="stat-label">Claimed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.freeCells}</div>
              <div className="stat-label">Free</div>
            </div>
            <div className="stat-item">
              <div className="stat-value success">{stats.onlineUsers}</div>
              <div className="stat-label">Online</div>
            </div>
            <div className="stat-item">
              <div className="stat-value warning">{stats.percentClaimed}%</div>
              <div className="stat-label">Conquered</div>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-label">
              <span>Grid Control</span>
              <span>{stats.percentClaimed}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${stats.percentClaimed}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card" id="leaderboard-panel">
          <div className="card-title">
            <Trophy className="icon" size={14} /> Leaderboard
          </div>
          {leaderboard.length === 0 ? (
            <div className="leaderboard-empty">
              No claims yet. Be the first!
            </div>
          ) : (
            <ul className="leaderboard-list">
              {leaderboard.map((entry, i) => {
                const isYou = entry.name === user.name;
                const rankClass =
                  i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                return (
                  <li
                    key={entry.name}
                    className={`leaderboard-item ${isYou ? 'is-you' : ''}`}
                  >
                    <span className={`rank ${rankClass}`}>
                      {i === 0 ? <Crown size={14} className="crown-icon" /> : `#${entry.rank}`}
                    </span>
                    <span
                      className="lb-color"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="lb-name">
                      {entry.name}
                      {isYou && ' (you)'}
                    </span>
                    <span className="lb-count">{entry.blocksOwned}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="online-indicator" id="online-indicator">
          <div className="pulse-dot" />
          <span className="online-text">
            <span>{stats.onlineUsers}</span> player{stats.onlineUsers !== 1 ? 's' : ''} online
          </span>
        </div>
      </div>
    </aside>
  );
}
