'use client';

import { useSocket } from '@/context/SocketContext';

export default function Notifications() {
  const { notifications } = useSocket();

  return (
    <div className="notification-area" id="notification-area">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="notification"
          dangerouslySetInnerHTML={{ __html: n.message }}
        />
      ))}
    </div>
  );
}
