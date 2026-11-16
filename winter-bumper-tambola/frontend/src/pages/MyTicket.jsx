import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader, AlertCircle, Ticket } from 'lucide-react';
import api from '../services/api';

export default function MyTicket() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState(localStorage.getItem('ticketLoginId') || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(!loginId);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/tickets/${loginId}`);
      setTicket(response.data);
      localStorage.setItem('ticketLoginId', loginId);
      setShowLoginForm(false);
    } catch (err) {
      setError(err.message || 'Invalid Login ID');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ticketLoginId');
    setTicket(null);
    setLoginId('');
    setShowLoginForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-purple-900 mb-2 flex items-center justify-center gap-2">
            <Ticket size={36} />
            My Ticket
          </h1>
        </div>

        {showLoginForm ? (
          // Login Form
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 text-center">
              Access Your Ticket
            </h2>

            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 rounded flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Login ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., TID-A1B2C3"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono text-center"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You received this ID when you booked your ticket
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Loading...
                  </>
                ) : (
                  'View My Ticket'
                )}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : ticket ? (
          // Ticket Display
          <div className="space-y-6">
            {/* Ticket Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-purple-200 text-sm">TICKET NUMBER</p>
                  <p className="text-5xl font-black">{ticket.serialNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-200 text-sm">PLAYER</p>
                  <p className="text-xl font-bold">{ticket.playerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-purple-200 text-xs">EMAIL</p>
                  <p className="text-sm font-semibold">{ticket.email}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">PHONE</p>
                  <p className="text-sm font-semibold">{ticket.phone}</p>
                </div>
              </div>

              <div className="border-t border-purple-500 pt-4">
                <p className="text-purple-200 text-xs mb-2">LOGIN ID</p>
                <p className="text-lg font-mono font-bold bg-purple-900 p-3 rounded">
                  {loginId}
                </p>
              </div>
            </div>

            {/* Ticket Numbers Grid */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4">Your Numbers</h3>

              <div className="space-y-4">
                {ticket.numbers.rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2 justify-center">
                    {row.map((num, colIdx) => (
                      <div
                        key={colIdx}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm ${
                          num === null
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {num || '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Create Game
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
