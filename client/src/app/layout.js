import './globals.css';

export const metadata = {
  title: 'GridWars — Real-Time Territory Battle',
  description: 'A real-time shared grid where players compete to claim territory. Built with Next.js, Express, and Socket.IO.',
  keywords: ['grid', 'real-time', 'multiplayer', 'territory', 'websocket'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body>{children}</body>
    </html>
  );
}
