import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IUser } from '@/types';

export function useInitAuth() {
  const { token, setUser, setLoading, setToken } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<IUser>('/auth/me')
      .then((user) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);
}
