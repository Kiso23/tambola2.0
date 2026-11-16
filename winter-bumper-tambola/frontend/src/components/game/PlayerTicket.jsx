import React from 'react';
import clsx from 'clsx';
import { Trophy } from 'lucide-react';

const PATTERNS = [
  { key: 'earlyFive', label: 'Early Five' },
  { key: 'topLine', label: 'Top Line' },
  { key: 'middleLine', label: 'Middle Line' },
  { key: 'bottomLine', label: 'Bottom Line' },
  { key: 'fullHouse', label: 'Full House' },
];

export default function PlayerTicket({
  ticket,
  markedNumbers = [],
  myPatterns = {},
  patterns = {},
  onClaim,
  isHost,
}) {
  if (!ticket) return null;
  const marked = new Set(markedNumbers);

  const readyPatterns = PATTERNS.filter(
    ({ key }) => myPatterns[key] && !patterns[key]
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
          Your Ticket
        </h3>
      </div>

      {/* Ticket grid */}
      <div className="space-y-1.5 mb-4">
        {ticket.rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-9 gap-1">
            {row.map((num, colIdx) => {
              if (num === null) {
                return (
                  <div
                    key={colIdx}
                    className="ticket-cell ticket-blank border-transparent bg-gray-100 rounded-xl"
                  />
                );
              }
              const isMarked = marked.has(num);
              return (
                <div
                  key={colIdx}
                  className={clsx(
                    'ticket-cell rounded-xl font-black transition-all duration-300',
                    isMarked ? 'ticket-marked' : 'ticket-normal'
                  )}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
        <span>{markedNumbers.length} marked</span>
        <span>{15 - markedNumbers.filter(n => ticket.rows.flat().includes(n)).length} remaining</span>
      </div>

      {/* Claim buttons for ready patterns */}
      {!isHost && readyPatterns.length > 0 && (
        <div className="space-y-2">
          {readyPatterns.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onClaim(key)}
              className="btn-green w-full flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              Claim {label}!
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
