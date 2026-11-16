import { useState, useEffect } from 'react';
import { authAPI, setTokens, clearTokens, decodeToken, isAuthenticated } from '../services/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        }
      } catch (err) {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (playerName, roomCode = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({
        playerName: playerName.trim(),
        roomCode: roomCode.trim(),
      });

      const { accessToken, refreshToken, player } = response.data;

      // Save tokens
      setTokens(accessToken, refreshToken);

      // Set user
      setUser(player);

      toast.success(`Welcome, ${playerName}!`);
      return player;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API failed:', err);
    } finally {
      clearTokens();
      setUser(null);
      toast.success('Logged out');
    }
  };

  // Check if token is expiring soon
  const isTokenExpiringSoon = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const decoded = decodeToken(token);
      if (!decoded || !decoded.exp) return false;

      // Check if expires in less than 5 minutes
      const expiresIn = decoded.exp * 1000 - Date.now();
      return expiresIn < 5 * 60 * 1000;
    } catch {
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isTokenExpiringSoon,
  };
}
