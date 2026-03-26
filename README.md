# 🎮 GridWars

A real-time multiplayer grid game where players compete to claim territory on a shared 30×30 grid. Built with Next.js, Express, and Socket.IO.

## 🏗 Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│    Next.js Client   │◄──WS──►│  Express + Socket.IO     │
│                     │         │                          │
│  • React Components │         │  • Game State Manager    │
│  • Socket.IO Client │         │  • User Management       │
│  • Zoom/Pan Canvas  │         │  • Conflict Resolution   │
│  • CSS Animations   │         │  • REST API Endpoints    │
└─────────────────────┘         └──────────────────────────┘
```

## ⚡ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 (App Router) | Modern React with SSR, great DX |
| Styling | Vanilla CSS + CSS Variables | Full control over animations & glassmorphism |
| Backend | Node.js + Express | Lightweight, perfect for real-time apps |
| Real-time | Socket.IO | Reliable WebSocket with auto-reconnect & fallbacks |
| State | In-memory (Map) | Sub-millisecond reads/writes for low-latency |

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### 3. Start the frontend

```bash
cd client
npm run dev
# Client runs on http://localhost:3000
```

### 4. Open multiple browser tabs to simulate multiplayer!

## ✨ Features

### Core
- **30×30 Grid** — 900 cells for territory battles
- **Real-time Sync** — All changes broadcast instantly via WebSocket
- **Server-Authoritative** — No cheating; server validates every claim
- **Conflict Resolution** — Last-write-wins with server-side validation

### Bonus
- 🎨 **Random User Colors** — Each player gets a unique color
- 🏷 **Random Usernames** — Fun generated names (e.g., "SwiftFox42")
- ⏱ **Cooldown System** — 500ms between claims to prevent spam
- 🏆 **Live Leaderboard** — Top 10 players, updated in real-time
- 🔍 **Zoom & Pan** — Mouse wheel to zoom, drag to pan
- 💫 **Micro-Animations** — Claim ripples, hover effects, transitions
- 📊 **Grid Stats** — Claimed/free cells, conquest percentage
- 🟢 **Online Indicator** — See connected player count
- 🔔 **Notifications** — Toast alerts for join/leave events
- 🌙 **Dark Mode** — Premium dark theme with glassmorphism

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/stats` | Grid statistics |
| GET | `/api/grid` | Full grid state |
| GET | `/api/leaderboard` | Top 10 players |

## 🔧 Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `claim` | `{ row, col }` | Claim a cell |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `init` | Full state | Initial state on connect |
| `block:claimed` | Cell + user data | A cell was claimed |
| `claim:failed` | Reason | Claim was rejected |
| `user:joined` | User info | New player joined |
| `user:left` | User info | Player disconnected |

## 📁 Project Structure

```
├── server/
│   ├── index.js          # Express + Socket.IO server
│   ├── gameState.js       # Game state management
│   └── package.json
├── client/
│   └── src/
│       ├── app/
│       │   ├── layout.js    # Root layout + SEO
│       │   ├── page.js      # Main page
│       │   └── globals.css  # Design system
│       ├── components/
│       │   ├── Grid.js        # Grid + zoom/pan + tooltips
│       │   ├── Sidebar.js     # User panel + stats + leaderboard
│       │   └── Notifications.js
│       └── context/
│           └── SocketContext.js  # Socket.IO state management
└── README.md
```  


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

