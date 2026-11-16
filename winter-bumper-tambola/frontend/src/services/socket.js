import { io } from 'socket.io-client';

let socket = null;

export function connectSocket({ roomCode, playerToken, hostToken }) {
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io('/', {
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
