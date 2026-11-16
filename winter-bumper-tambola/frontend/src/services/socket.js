import { io } from 'socket.io-client';

let socket = null;

export function connectSocket({ roomCode, playerToken, hostToken }) {
  if (socket?.connected) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: { roomCode, playerToken: playerToken || null, hostToken: hostToken || null },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
