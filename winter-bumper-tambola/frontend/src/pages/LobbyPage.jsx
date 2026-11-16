import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Copy, Check, Play } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import useGameStore from '../store/gameStore';
import { roomAPI } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const store = useGameStore();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const isHost = store.role === 'host';

  useSocket({
    roomCode,
    playerToken: store.playerToken,
    hostToken: store.hostToken,
    enabled: true,
  });

  // If game starts, navigate to game
  useEffect(() => {
    if (store.status === 'playing') {
      navigate(`/game/${roomCode}`, { replace: true });
    }
  }, [store.status, roomCode, navigate]);

  // Guard: if no session, redirect home
  useEffect(() => {
    if (!store.roomCode) navigate('/', { replace: true });
  }, [store.roomCode, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('host:startGame');
      } else {
        await roomAPI.startGame(roomCode, store.hostToken);
        store.onGameStarted({ players: store.players });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-card px-8 py-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">❄️</div>
          <h2 className="text-2xl font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
            {store.gameName || 'Winter Bumper Tambola'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Waiting for players to join...</p>
        </div>

        {/* Room Code */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-6 text-center">
          <p className="text-sm font-bold text-purple-500 mb-1">ROOM CODE</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black text-purple-900 tracking-widest font-mono">
              {roomCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-purple-600" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Share this code with friends to join</p>
        </div>

        {/* Players */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-purple-600" />
            <span className="font-bold text-gray-700">
              Players ({store.playerCount || store.players?.length || 0})
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {store.players?.length > 0 ? (
              store.players.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-purple-50 rounded-xl px-4 py-2.5"
                >
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-800 font-bold text-sm">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-700">{p.name}</span>
                  {p.name === store.hostName && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                      HOST
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No players yet...</p>
            )}
          </div>
        </div>

        {/* Host action */}
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={starting || (store.players?.length || 0) < 1}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            {starting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Starting...
              </>
            ) : (
              <><Play size={20} fill="currentColor" /> Start Game</>
            )}
          </button>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="font-semibold">Waiting for host to start...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
