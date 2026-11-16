import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const STEPS = [
  { emoji: '🏠', title: 'Create or Join a Room', desc: 'Host clicks "Create Game", gets a 6-character room code. Players click "Join Game" and enter the code along with their name.' },
  { emoji: '🎫', title: 'Get Your Ticket', desc: 'Each player receives a unique Tambola ticket with 15 numbers arranged in 3 rows of 9 columns (5 numbers per row).' },
  { emoji: '🔔', title: 'Numbers Are Called', desc: 'The host calls numbers 1–90 one at a time. Numbers are broadcast to all players instantly via real-time connection.' },
  { emoji: '✅', title: 'Mark Your Ticket', desc: 'Your ticket is marked automatically as numbers are called. Watch for highlighted numbers on your ticket.' },
  { emoji: '🏆', title: 'Win with Patterns', desc: 'Be the first to complete a pattern and hit "Claim". Claims are verified automatically against the called numbers.' },
];

const PATTERNS = [
  { emoji: '5️⃣', name: 'Early Five', desc: 'First player to have 5 numbers marked on their ticket.' },
  { emoji: '1️⃣', name: 'Top Line', desc: 'All 5 numbers in the first row marked.' },
  { emoji: '2️⃣', name: 'Middle Line', desc: 'All 5 numbers in the middle row marked.' },
  { emoji: '3️⃣', name: 'Bottom Line', desc: 'All 5 numbers in the bottom row marked.' },
  { emoji: '🏠', name: 'Full House', desc: 'All 15 numbers on the ticket marked. The ultimate win!' },
];

export default function HowToPlayPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-card px-6 py-8 mb-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📖</div>
          <h2 className="text-3xl font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
            How to Play
          </h2>
          <p className="text-gray-500 mt-2">Winter Bumper Tambola — the classic game, online!</p>
        </div>

        <div className="space-y-5">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                {step.emoji}
              </div>
              <div>
                <h4 className="font-black text-purple-900 mb-1" style={{ fontFamily: 'Nunito' }}>
                  {i + 1}. {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-card px-6 py-8">
        <h3 className="text-xl font-black text-purple-900 mb-5 text-center" style={{ fontFamily: 'Nunito' }}>
          🏆 Winning Patterns
        </h3>
        <div className="space-y-3">
          {PATTERNS.map((p, i) => (
            <div key={i} className="flex gap-3 items-start bg-purple-50 rounded-2xl px-4 py-3">
              <span className="text-2xl">{p.emoji}</span>
              <div>
                <p className="font-bold text-purple-800">{p.name}</p>
                <p className="text-sm text-gray-600">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
