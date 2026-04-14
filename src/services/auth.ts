import axios from '../axios';

import type { User } from '../interfaces/user';

const fetchSession = () => axios.get<{ authenticated: boolean; spotifyConnected: boolean }>('/session');
const login = (password: string) => axios.post('/login', { password });
const logout = () => axios.post('/logout');
const fetchUser = () => axios.get<User>('/me');

export const authService = {
  fetchSession,
  login,
  logout,
  fetchUser,
};
