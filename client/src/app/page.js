'use client';

import { SocketProvider, useSocket } from '@/context/SocketContext';
import Grid from '@/components/Grid';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';

function AppContent() {
  const { connected, user } = useSocket();

  if (!connected || !user) {
    return (
      <div className="connecting-screen">
        <div className="connecting-spinner" />
        <div className="connecting-text">
          Connecting to <span>GridWars</span>...
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Grid />
      </main>
      <Notifications />
    </div>
  );
}

export default function Home() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
