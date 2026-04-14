import api from '../api';

import type { User } from '../interfaces/user';

const fetchSession = () => api.get<{ authenticated: boolean; spotifyConnected: boolean }>('/session');
const login = (password: string) => api.post('/login', { password });
const logout = () => api.post('/logout');
const fetchUser = () => api.get<User>('/me');

export const authService = {
  fetchSession,
  login,
  logout,
  fetchUser,
};
