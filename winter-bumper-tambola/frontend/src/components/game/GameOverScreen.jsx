import React from 'react';
import { Home } from 'lucide-react';

const PATTERN_LABELS = {
  earlyFive: 'Early Five',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  fullHouse: 'Full House',
};

export default function GameOverScreen({ winners = [], onHome }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-card px-8 py-10 max-w-md w-full text-center">
        <div className="text-7xl mb-4">🎊</div>
        <h2
          className="text-3xl font-black text-purple-900 mb-2"
          style={{ fontFamily: 'Nunito' }}
        >
          Game Over!
        </h2>
        <p className="text-gray-500 mb-8">All 90 numbers have been called.</p>

        {winners.length > 0 ? (
          <div className="mb-8">
            <h3 className="font-black text-purple-700 mb-4" style={{ fontFamily: 'Nunito' }}>
              🏆 Winners
            </h3>
            <div className="space-y-3">
              {winners.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-purple-50 rounded-2xl px-4 py-3"
                >
                  <span className="text-2xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                  </span>
                  <div className="text-left">
                    <p className="font-bold text-gray-800">{w.playerName}</p>
                    <p className="text-sm text-purple-600 font-semibold">
                      {PATTERN_LABELS[w.pattern] || w.pattern}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mb-8">No winners this round.</p>
        )}

        <button onClick={onHome} className="btn-primary w-full flex items-center justify-center gap-2">
          <Home size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
