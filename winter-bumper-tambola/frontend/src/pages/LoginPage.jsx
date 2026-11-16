import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Hash, ArrowRight } from 'lucide-react';
import { authAPI, setTokens } from '../services/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ playerName: '', roomCode: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.name === 'roomCode'
      ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
      : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.playerName.trim()) {
      toast.error('Enter your name');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login({
        playerName: form.playerName.trim(),
        roomCode: form.roomCode.trim(),
      });

      const { accessToken, refreshToken, player } = response.data;

      // Save tokens
      setTokens(accessToken, refreshToken);

      // Update auth store
      login(player, accessToken, refreshToken);

      toast.success(`Welcome, ${form.playerName}!`);

      // Navigate based on whether they specified a room
      if (form.roomCode.trim()) {
        navigate(`/lobby/${form.roomCode.trim()}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-card px-8 py-10 max-w-sm w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-3xl font-black text-purple-900" style={{ fontFamily: 'Nunito' }}>
            Login
          </h2>
          <p className="text-gray-500 text-sm mt-2">Enter your details to play</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Your Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="playerName"
                value={form.playerName}
                onChange={handleChange}
                placeholder="Your Name"
                maxLength={30}
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">
              Room Code (Optional)
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="roomCode"
                value={form.roomCode}
                onChange={handleChange}
                placeholder="Leave blank to create new room"
                maxLength={8}
                className="input-field pl-10 tracking-widest font-mono uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Logging in...
              </>
            ) : (
              <>Login <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>First time? Login with your name to get started!</p>
        </div>
      </div>
    </div>
  );
}
