import React from 'react';

const PATTERN_LABELS = {
  earlyFive: 'Early Five',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  fullHouse: 'Full House',
};

export default function WinnerOverlay({ winner, onClose }) {
  if (!winner) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl px-10 py-10 text-center max-w-xs mx-4 animate-winner-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🏆</div>
        <div className="text-5xl mb-3">🎉</div>
        <h2
          className="text-2xl font-black text-purple-900 mb-2"
          style={{ fontFamily: 'Nunito' }}
        >
          {winner.playerName}
        </h2>
        <div className="bg-yellow-400 rounded-2xl px-4 py-2 inline-block mb-4">
          <span className="text-yellow-900 font-black text-lg">
            {PATTERN_LABELS[winner.pattern] || winner.pattern}
          </span>
        </div>
        <p className="text-gray-500 text-sm font-semibold">
          Claimed and verified! 🎊
        </p>
        <button
          onClick={onClose}
          className="mt-6 text-purple-600 font-bold text-sm hover:text-purple-800 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
