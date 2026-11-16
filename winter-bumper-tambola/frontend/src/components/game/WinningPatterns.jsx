import React from 'react';
import clsx from 'clsx';
import { Check, Trophy } from 'lucide-react';

const PATTERNS = [
  { key: 'earlyFive', label: 'Early Five', desc: 'First 5 numbers marked' },
  { key: 'topLine', label: 'Top Line', desc: 'Complete first row' },
  { key: 'middleLine', label: 'Middle Line', desc: 'Complete middle row' },
  { key: 'bottomLine', label: 'Bottom Line', desc: 'Complete bottom row' },
  { key: 'fullHouse', label: 'Full House', desc: 'All numbers marked' },
];

export default function WinningPatterns({
  patterns = {},
  myPatterns = {},
  winners = [],
  isHost,
  onClaim,
  gameStatus,
}) {
  const getWinnerName = (key) => {
    const w = winners.find((x) => x.pattern === key && x.verified);
    return w?.playerName || null;
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
          Winning Patterns
        </h3>
      </div>

      <div className="space-y-2">
        {PATTERNS.map(({ key, label, desc }) => {
          const globalWon = patterns[key];
          const myReady = myPatterns[key];
          const winner = getWinnerName(key);
          const canClaim = !isHost && myReady && !globalWon && gameStatus === 'playing';

          return (
            <div
              key={key}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                globalWon ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              )}
            >
              {/* Status indicator */}
              <div
                className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  globalWon
                    ? 'bg-green-500 border-green-500'
                    : myReady
                    ? 'bg-yellow-400 border-yellow-400 animate-pulse'
                    : 'bg-white border-gray-300'
                )}
              >
                {globalWon && <Check size={12} className="text-white" />}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    'text-sm font-bold leading-none',
                    globalWon ? 'text-green-700' : 'text-gray-700'
                  )}
                >
                  {label}
                </p>
                {winner && (
                  <p className="text-xs text-green-600 mt-0.5 truncate">🏆 {winner}</p>
                )}
              </div>

              {/* Claim button */}
              {canClaim && (
                <button
                  onClick={() => onClaim(key)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-xs px-3 py-1 rounded-lg transition-colors flex-shrink-0"
                >
                  Claim!
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
