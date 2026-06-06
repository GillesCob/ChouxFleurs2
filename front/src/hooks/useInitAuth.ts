import { useEffect } from 'react';
import { api, USE_MOCK } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IUser } from '@/types';

export function useInitAuth() {
  const { token, setUser, setLoading, setToken } = useAuthStore();

  useEffect(() => {
    if (!USE_MOCK && !token) {
      setLoading(false);
      return;
    }
    api
      .get<IUser>('/auth/me')
      .then((user) => setUser(user))
      .catch(() => {
        if (!USE_MOCK) setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);
}
