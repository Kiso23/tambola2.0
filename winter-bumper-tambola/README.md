# ❄️ Winter Bumper Tambola

A production-ready real-time Tambola (Housie/Bingo) game with a winter theme.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO (WebSocket) |
| Security | Helmet, Rate Limiting, Joi Validation, Mongo Sanitize |
| Deployment | Docker + Docker Compose + Nginx |

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
cp .env.example .env   # edit values as needed
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Production (Docker)

```bash
# Copy and edit environment
cp .env.example .env

# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## Gameplay Flow

1. **Host** creates a room → receives a room code (e.g. `WB7261`)
2. **Players** join by entering name + room code → each gets a unique ticket
3. Host starts the game — numbers 1–90 are shuffled
4. Host calls numbers (manual or auto every 5 seconds)
5. Numbers broadcast via Socket.IO → tickets auto-marked
6. Players claim patterns when complete — claims are server-verified
7. Game ends when all 90 numbers are called

## Winning Patterns

| Pattern | Condition |
|---------|-----------|
| Early Five | First 5 numbers marked |
| Top Line | All 5 numbers in row 1 |
| Middle Line | All 5 numbers in row 2 |
| Bottom Line | All 5 numbers in row 3 |
| Full House | All 15 numbers on the ticket |

## Security Features

- Helmet HTTP security headers
- Express rate limiting (global + per-route)
- MongoDB operator injection sanitization
- Joi request body validation
- Input length limits and XSS protection via CSP headers
- CORS whitelist
- Room claim server-side verification (clients cannot fake wins)
- UUID-based player/host tokens (not guessable)
- Non-root Docker user
- 24-hour TTL on rooms (MongoDB index)

## API Reference

```
POST /api/rooms/create      Create a new room
POST /api/rooms/join        Join an existing room
GET  /api/rooms/:code       Get room info
POST /api/rooms/:code/start Start the game (host)
POST /api/rooms/:code/call  Call next number (host)
POST /api/rooms/claim       Claim a winning pattern
GET  /health                Health check
```

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `room:state` | Server→Client | Current room state on connect |
| `number:called` | Server→Client | New number broadcast |
| `game:started` | Server→Client | Game has started |
| `game:over` | Server→Client | All numbers called |
| `winner:announced` | Server→Client | Verified winner |
| `player:joined` | Server→Client | Player count update |
| `host:startGame` | Client→Server | Host starts game |
| `host:callNumber` | Client→Server | Host calls next number |
| `player:claim` | Client→Server | Player claims pattern |
