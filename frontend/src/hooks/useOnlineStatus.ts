import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

export const useOnlineStatus = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId) {
      setIsOnline(false);
      return;
    }

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
        setIsOnline(false);
      }
    };

    checkStatus();


    const interval = setInterval(checkStatus, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [userId, token]); 

  return isOnline;
};