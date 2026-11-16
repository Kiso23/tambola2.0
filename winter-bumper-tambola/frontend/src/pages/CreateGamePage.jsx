import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Pencil } from 'lucide-react';
import { roomAPI } from '../services/api';
import useGameStore from '../store/gameStore';
import toast from 'react-hot-toast';

export default function CreateGamePage() {
  const navigate = useNavigate();
  const setSession = useGameStore((s) => s.setSession);
  const [form, setForm] = useState({ hostName: '', gameName: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hostName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      const res = await roomAPI.createRoom({
        hostName: form.hostName.trim(),
        gameName: form.gameName.trim() || undefined,
      });
      const { roomCode, hostToken, gameName, hostName } = res.data;
      setSession({
        role: 'host',
        roomCode,
        hostToken,
        playerToken: null,
        playerName: hostName,
        gameName,
        hostName,
      });
      navigate(`/lobby/${roomCode}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-card px-8 py-10 max-w-sm w-full">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Icon + Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎮</span>
          </div>
          <h2 className="text-3xl font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
            Create Game
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              Your Name (Host)
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="hostName"
                value={form.hostName}
                onChange={handleChange}
                placeholder="Enter your name"
                maxLength={30}
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              Game Name (Optional)
            </label>
            <div className="relative">
              <Pencil size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="gameName"
                value={form.gameName}
                onChange={handleChange}
                placeholder="e.g. Team Party"
                maxLength={50}
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Game'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
