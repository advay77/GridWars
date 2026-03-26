
const GRID_SIZE = 30;
const COOLDOWN_MS = 500;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
  '#A3E4D7', '#FAD7A0', '#A9CCE3', '#D5F5E3', '#FADBD8',
  '#E8DAEF', '#D4EFDF', '#FCF3CF', '#D6EAF8', '#EBDEF0',
  '#D1F2EB', '#FDEBD0', '#D4E6F1', '#E9F7EF', '#F9EBEA',
  '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
  '#2ECC71', '#E67E22', '#EC7063', '#AF7AC5', '#5DADE2',
];

const ADJECTIVES = [
  'Swift', 'Bold', 'Cosmic', 'Neon', 'Pixel', 'Turbo', 'Hyper',
  'Quantum', 'Stellar', 'Blazing', 'Mystic', 'Shadow', 'Thunder',
  'Crystal', 'Golden', 'Silver', 'Iron', 'Crimson', 'Azure', 'Jade',
  'Frozen', 'Fiery', 'Silent', 'Rapid', 'Lucky', 'Wild', 'Brave',
];

const NOUNS = [
  'Fox', 'Wolf', 'Eagle', 'Tiger', 'Phoenix', 'Dragon', 'Falcon',
  'Panther', 'Hawk', 'Cobra', 'Shark', 'Lion', 'Bear', 'Raven',
  'Viper', 'Lynx', 'Puma', 'Orca', 'Jaguar', 'Mantis', 'Owl',
  'Crane', 'Stag', 'Bison', 'Rhino', 'Gecko', 'Frog',
];

class GameState {
  constructor() {
    this.grid = new Map();
    this.users = new Map();
    this.colorIndex = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.grid.set(`${row}-${col}`, { owner: null, ownerId: null, color: null, claimedAt: null });
      }
    }
  }

  generateUserName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
  }

  addUser(socketId) {
    const color = USER_COLORS[this.colorIndex++ % USER_COLORS.length];
    const user = { id: socketId, name: this.generateUserName(), color, blocksOwned: 0, lastClaimTime: 0 };
    this.users.set(socketId, user);
    return user;
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (!user) return null;
    this.users.delete(socketId);
    return user;
  }

  getUser(socketId) {
    return this.users.get(socketId);
  }

  claimBlock(socketId, row, col) {
    const user = this.users.get(socketId);
    if (!user) return { success: false, reason: 'User not found' };

    const now = Date.now();
    if (now - user.lastClaimTime < COOLDOWN_MS) {
      return { success: false, reason: 'cooldown', remaining: COOLDOWN_MS - (now - user.lastClaimTime) };
    }

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return { success: false, reason: 'Out of bounds' };
    }

    const cell = this.grid.get(`${row}-${col}`);
    if (cell.ownerId === socketId) return { success: false, reason: 'Already yours' };

    if (cell.ownerId && this.users.has(cell.ownerId)) {
      const prevOwner = this.users.get(cell.ownerId);
      prevOwner.blocksOwned = Math.max(0, prevOwner.blocksOwned - 1);
    }

    cell.owner = user.name;
    cell.ownerId = socketId;
    cell.color = user.color;
    cell.claimedAt = now;

    user.blocksOwned++;
    user.lastClaimTime = now;

    return { success: true, cell: { row, col, ...cell }, user };
  }

  getGridState() {
    return Array.from({ length: GRID_SIZE }, (_, row) => 
      Array.from({ length: GRID_SIZE }, (_, col) => {
        const cell = this.grid.get(`${row}-${col}`);
        return { row, col, owner: cell.owner, ownerId: cell.ownerId, color: cell.color };
      })
    );
  }

  getLeaderboard() {
    return Array.from(this.users.values())
      .filter(u => u.blocksOwned > 0)
      .sort((a, b) => b.blocksOwned - a.blocksOwned)
      .slice(0, 10)
      .map((u, i) => ({ rank: i + 1, name: u.name, color: u.color, blocksOwned: u.blocksOwned }));
  }

  getStats() {
    const claimed = Array.from(this.grid.values()).filter(c => c.owner !== null).length;
    return {
      totalCells: TOTAL_CELLS,
      claimedCells: claimed,
      freeCells: TOTAL_CELLS - claimed,
      onlineUsers: this.users.size,
      percentClaimed: ((claimed / TOTAL_CELLS) * 100).toFixed(1),
    };
  }
}

module.exports = { GameState, GRID_SIZE, COOLDOWN_MS };
