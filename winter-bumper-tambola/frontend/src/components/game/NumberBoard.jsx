import React from 'react';
import clsx from 'clsx';

const NUMBERS = Array.from({ length: 90 }, (_, i) => i + 1);

export default function NumberBoard({ calledNumbers = [], lastCalledNumber }) {
  const calledSet = new Set(calledNumbers);

  return (
    <div className="card">
      <h3 className="text-center font-black text-purple-900 mb-4" style={{ fontFamily: 'Nunito' }}>
        Number Board (1–90)
      </h3>
      <div className="grid grid-cols-10 gap-1">
        {NUMBERS.map((n) => {
          const isLast = n === lastCalledNumber;
          const isCalled = calledSet.has(n);
          return (
            <div
              key={n}
              className={clsx(
                'number-cell text-xs font-bold select-none transition-all duration-300',
                isLast
                  ? 'board-cell-last animate-pulse'
                  : isCalled
                  ? 'board-cell-called'
                  : 'board-cell-normal'
              )}
            >
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
}
