import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function TicketShop() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    playerName: '',
    email: '',
    phone: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/available');
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tickets/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setBookingLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/tickets/book', {
        serialNumber: selectedTicket.serialNumber,
        playerName: bookingForm.playerName,
        email: bookingForm.email,
        phone: bookingForm.phone,
      });

      setSuccess(
        `Ticket booked successfully! Your Login ID: ${response.data.loginId}`
      );

      // Store login ID for future use
      localStorage.setItem('ticketLoginId', response.data.loginId);

      // Refresh data
      setTimeout(() => {
        fetchTickets();
        fetchStats();
        setSelectedTicket(null);
        setBookingForm({ playerName: '', email: '', phone: '' });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-purple-900 mb-2">
            Winter Bumper Tickets
          </h1>
          <p className="text-blue-600 font-semibold">
            Choose your lucky ticket and start playing!
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Total Tickets</p>
              <p className="text-3xl font-black text-purple-900">{stats.total}</p>
            </div>
            <div className="bg-green-100 rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-black text-green-600">{stats.available}</p>
            </div>
            <div className="bg-blue-100 rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-600 text-sm">Booked</p>
              <p className="text-3xl font-black text-blue-600">
                {stats.booked} ({stats.bookedPercentage}%)
              </p>
            </div>
          </div>
        )}

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-600 p-4 rounded flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-600 p-4 rounded">
            <p className="text-green-800 font-semibold">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-purple-900 mb-4">Available Tickets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.serialNumber}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedTicket?.serialNumber === ticket.serialNumber
                      ? 'bg-purple-600 border-purple-700 text-white'
                      : 'bg-white border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <p className="text-sm font-semibold">{ticket.serialNumber}</p>
                  <p className="text-lg font-black mt-1">{ticket.ticketNumber}</p>
                  <p className="text-xs mt-2 opacity-75">
                    ₹{ticket.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
            <h2 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              Book Ticket
            </h2>

            {selectedTicket ? (
              <form onSubmit={handleBookTicket} className="space-y-4">
                <div className="bg-purple-50 p-3 rounded mb-4">
                  <p className="text-sm text-gray-600">Selected Ticket</p>
                  <p className="text-2xl font-black text-purple-900">
                    {selectedTicket.serialNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={30}
                    value={bookingForm.playerName}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, playerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    minLength={10}
                    maxLength={15}
                    value={bookingForm.phone}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    placeholder="Your phone number"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Booking...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Book Ticket
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Select a ticket to book</p>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
