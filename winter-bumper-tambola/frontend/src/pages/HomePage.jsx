import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Info } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* Logo Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-card px-8 py-10 max-w-sm w-full text-center mb-6">
        {/* Number tiles */}
        <div className="flex justify-center gap-2 mb-4">
          {[12, 36, 54].map((n) => (
            <div
              key={n}
              className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-purple-900 font-black text-lg shadow-md border-b-4 border-yellow-600"
            >
              {n}
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="mb-1">
          <h1 className="text-4xl font-black text-purple-900 leading-tight" style={{ fontFamily: 'Nunito' }}>
            Winter
          </h1>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl px-6 py-1 inline-block shadow-md">
            <span className="text-3xl font-black text-white" style={{ fontFamily: 'Nunito' }}>Bumper</span>
          </div>
        </div>
        <div className="mt-2 bg-purple-700 rounded-2xl px-5 py-2 inline-block">
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Nunito' }}>
            Tambola Game
          </span>
        </div>

        {/* Snowman decoration */}
        <div className="text-6xl my-4 animate-bounce-slow">⛄</div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            className="btn-primary flex items-center justify-center gap-2 text-lg w-full"
            onClick={() => navigate('/create')}
          >
            <Plus size={22} />
            Create Game
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2 text-lg w-full"
            onClick={() => navigate('/join')}
          >
            <Users size={22} />
            Join Game
          </button>
          <button
            className="flex items-center justify-center gap-2 text-purple-700 font-semibold hover:text-purple-900 transition-colors mt-1"
            onClick={() => navigate('/how-to-play')}
          >
            <Info size={18} />
            How to Play
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-blue-400 text-sm font-medium">
        Play with friends & family online ❄️
      </p>
    </div>
  );
}
