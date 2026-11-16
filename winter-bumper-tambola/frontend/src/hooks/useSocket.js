import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import useGameStore from '../store/gameStore';
import voiceService from '../services/voiceService';
import toast from 'react-hot-toast';

export function useSocket({ roomCode, playerToken, hostToken, enabled = true, voiceEnabled = false }) {
  const socketRef = useRef(null);
  const {
    setRoomState,
    onNumberCalled,
    onGameStarted,
    onGameOver,
    onWinnerAnnounced,
    onPlayersUpdate,
  } = useGameStore();

  // Update voice service when voiceEnabled changes
  useEffect(() => {
    voiceService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  useEffect(() => {
    if (!enabled || !roomCode) return;

    const socket = connectSocket({ roomCode, playerToken, hostToken });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      toast.error('Connection error. Retrying...');
    });

    socket.on('room:state', (data) => {
      setRoomState(data);
    });

    socket.on('number:called', (data) => {
      onNumberCalled(data);
      // Announce number if voice is enabled
      if (voiceEnabled && data.number) {
        voiceService.announceNumber(data.number, {
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
        });
      }
    });

    socket.on('game:started', (data) => {
      onGameStarted(data);
      toast.success('🎮 Game started!', { icon: '🎉' });
      // Announce game start
      if (voiceEnabled) {
        voiceService.announceGameStart({ rate: 0.9 });
      }
    });

    socket.on('game:over', (data) => {
      onGameOver(data);
      // Announce game over
      if (voiceEnabled) {
        voiceService.announceGameOver({ rate: 0.9 });
      }
    });

    socket.on('winner:announced', (data) => {
      onWinnerAnnounced(data);
      const patternLabels = {
        earlyFive: 'Early Five',
        topLine: 'Top Line',
        middleLine: 'Middle Line',
        bottomLine: 'Bottom Line',
        fullHouse: 'Full House',
      };
      toast.success(
        `🏆 ${data.playerName} won ${patternLabels[data.pattern] || data.pattern}!`,
        { duration: 5000 }
      );
      // Announce winner
      if (voiceEnabled) {
        voiceService.announceWinner(data.playerName, patternLabels[data.pattern] || data.pattern);
      }
    });

    socket.on('player:joined', (data) => {
      onPlayersUpdate(data);
    });

    socket.on('player:left', (data) => {
      onPlayersUpdate(data);
    });

    socket.on('error', (data) => {
      toast.error(data.message || 'Socket error');
    });

    return () => {
      disconnectSocket();
    };
  }, [roomCode, playerToken, hostToken, enabled, voiceEnabled]);

  return socketRef.current;
}
