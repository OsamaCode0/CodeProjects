import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

const API = import.meta.env.VITE_API_BASE_URL;

export const useOnlineStatus = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(false);
  const { on } = useWebSocket();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId) return;

    // Initial check
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API}/users/${userId}/online`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setIsOnline(data.online);
      } catch (error) {
        console.error('Failed to check online status:', error);
      }
    };

    checkStatus();

    // Listen for status changes via WebSocket
    const unsubscribe = on('user_status', (msg) => {
      if (msg.data?.user_id === userId) {
        setIsOnline(msg.data?.online || false);
      }
    });

    // Recheck every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId, token, on]);

  return isOnline;
};