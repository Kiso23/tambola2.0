#!/bin/bash
# Winter Bumper Tambola - Dev Startup Script

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "❄️  Winter Bumper Tambola - Development Server"
echo "================================================"

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
  echo "⚠️  MongoDB does not appear to be running."
  echo "    Start it with: sudo systemctl start mongod"
  echo "    Or use Docker:  docker run -d -p 27017:27017 mongo:7"
fi

# Backend
echo ""
echo "Starting backend on http://localhost:5000 ..."
cd backend && npm run dev &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Frontend
echo ""
echo "Starting frontend on http://localhost:5173 ..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" INT TERM
wait
