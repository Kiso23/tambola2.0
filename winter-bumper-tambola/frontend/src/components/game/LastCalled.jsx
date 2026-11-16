import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function LastCalled({ lastNumber, recentNumbers = [], remainingCount }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (lastNumber) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(t);
    }
  }, [lastNumber]);

  return (
    <div className="card text-center">
      <p className="text-sm font-bold text-gray-500 mb-3">Last Called</p>

      {/* Big number */}
      <div
        className={clsx(
          'w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-black text-white shadow-glow transition-all duration-300',
          lastNumber
            ? 'bg-gradient-to-br from-purple-600 to-purple-800'
            : 'bg-gray-200 text-gray-400',
          animate && 'animate-number-pop scale-110'
        )}
      >
        {lastNumber ?? '—'}
      </div>

      {/* Recent numbers */}
      <div className="mt-4">
        <p className="text-xs font-bold text-gray-400 mb-2">Recent Numbers</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {recentNumbers.slice(0, 4).map((n, i) => (
            <div
              key={`${n}-${i}`}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i === 0
                  ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white scale-110 shadow-number'
                  : 'bg-purple-100 text-purple-700'
              )}
            >
              {n}
            </div>
          ))}
          {recentNumbers.length === 0 && (
            <span className="text-gray-300 text-sm">No numbers called yet</span>
          )}
        </div>
      </div>

      {/* Remaining count */}
      <div className="mt-4 bg-purple-50 rounded-xl px-3 py-2">
        <span className="text-xs font-bold text-purple-500">
          {remainingCount ?? 90} numbers remaining
        </span>
      </div>
    </div>
  );
}
