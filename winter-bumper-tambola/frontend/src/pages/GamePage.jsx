import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, Users } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import useGameStore from '../store/gameStore';
import { getSocket } from '../services/socket';
import { roomAPI } from '../services/api';
import NumberBoard from '../components/game/NumberBoard';
import PlayerTicket from '../components/game/PlayerTicket';
import LastCalled from '../components/game/LastCalled';
import WinningPatterns from '../components/game/WinningPatterns';
import WinnerOverlay from '../components/game/WinnerOverlay';
import GameOverScreen from '../components/game/GameOverScreen';
import toast from 'react-hot-toast';

export default function GamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const store = useGameStore();
  const [calling, setCalling] = useState(false);
  const [showWinner, setShowWinner] = useState(null);
  const [autoCall, setAutoCall] = useState(false);
  const autoCallRef = React.useRef(null);

  const isHost = store.role === 'host';

  useSocket({
    roomCode,
    playerToken: store.playerToken,
    hostToken: store.hostToken,
    enabled: true,
  });

  // Guard: no session → home
  useEffect(() => {
    if (!store.roomCode) navigate('/', { replace: true });
  }, [store.roomCode, navigate]);

  // Show winner popup when new winner announced
  useEffect(() => {
    if (store.winners?.length > 0) {
      const latest = store.winners[store.winners.length - 1];
      setShowWinner(latest);
      const t = setTimeout(() => setShowWinner(null), 4000);
      return () => clearTimeout(t);
    }
  }, [store.winners?.length]);

  // Auto-call numbers (host only)
  useEffect(() => {
    if (isHost && store.status === 'playing') {
      const socket = getSocket();
      if (autoCall && socket?.connected) {
        socket.emit('host:enableAutoCall');
      } else if (!autoCall && socket?.connected) {
        socket.emit('host:disableAutoCall');
      }
    }
    return () => {
      if (!autoCall && isHost) {
        const socket = getSocket();
        socket?.emit('host:disableAutoCall');
      }
    };
  }, [autoCall, isHost, store.status]);

  const handleCallNumber = useCallback(async () => {
    if (calling || store.status !== 'playing') return;
    setCalling(true);
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('host:callNumber');
      } else {
        await roomAPI.callNumber(roomCode, store.hostToken);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to call number');
    } finally {
      setCalling(false);
    }
  }, [calling, store.status, roomCode, store.hostToken]);

  const handleClaim = useCallback(async (pattern) => {
    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('player:claim', { pattern });
      } else {
        await roomAPI.claimWin({
          roomCode,
          playerToken: store.playerToken,
          pattern,
        });
      }
    } catch (err) {
      toast.error(err.message || 'Claim failed');
    }
  }, [roomCode, store.playerToken]);

  if (store.status === 'finished') {
    return <GameOverScreen winners={store.winners} onHome={() => { store.clearSession(); navigate('/'); }} />;
  }

  return (
    <div className="min-h-screen px-2 md:px-4 py-4">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-purple-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-xl">❄️</span>
            <span className="text-white font-black text-lg" style={{ fontFamily: 'Nunito' }}>
              Winter Bumper
            </span>
          </div>
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold tracking-wider">
            Room: {roomCode}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-purple-200">
              <Users size={16} />
              <span className="text-sm font-semibold">{store.playerCount || store.players?.length || 0} Players</span>
            </div>
            {isHost && (
              <button
                onClick={() => setAutoCall((v) => !v)}
                className={`p-2 rounded-xl transition-colors ${autoCall ? 'bg-green-500 text-white' : 'bg-purple-600 text-purple-200 hover:bg-purple-500'}`}
                title={autoCall ? 'Auto-call ON' : 'Auto-call OFF'}
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main game layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: Last Called + Patterns */}
        <div className="lg:col-span-1 space-y-4">
          <LastCalled
            lastNumber={store.lastCalledNumber}
            recentNumbers={store.recentNumbers || []}
            remainingCount={store.remainingCount}
          />

          <WinningPatterns
            patterns={store.patterns}
            myPatterns={store.myPatterns}
            winners={store.winners}
            isHost={isHost}
            onClaim={handleClaim}
            gameStatus={store.status}
          />

          {/* Host call button */}
          {isHost && (
            <button
              onClick={handleCallNumber}
              disabled={calling || store.status !== 'playing' || autoCall}
              className="btn-primary w-full text-xl py-4 flex items-center justify-center gap-2"
            >
              {calling ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Calling...
                </>
              ) : autoCall ? (
                '⚡ Auto Calling...'
              ) : (
                '🔔 Call Next Number'
              )}
            </button>
          )}
        </div>

        {/* Center: Number Board */}
        <div className="lg:col-span-1">
          <NumberBoard
            calledNumbers={store.calledNumbers}
            lastCalledNumber={store.lastCalledNumber}
          />
        </div>

        {/* Right: Player Ticket */}
        <div className="lg:col-span-1">
          {store.ticket ? (
            <PlayerTicket
              ticket={store.ticket}
              markedNumbers={store.markedNumbers}
              myPatterns={store.myPatterns}
              patterns={store.patterns}
              onClaim={handleClaim}
              isHost={isHost}
            />
          ) : (
            <div className="card text-center text-gray-400 py-8">
              <span className="text-4xl">🎫</span>
              <p className="mt-2 font-semibold">No ticket assigned</p>
            </div>
          )}
        </div>
      </div>

      {/* Winner popup */}
      {showWinner && (
        <WinnerOverlay winner={showWinner} onClose={() => setShowWinner(null)} />
      )}
    </div>
  );
}
