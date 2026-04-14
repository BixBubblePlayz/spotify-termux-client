import axios from '../../axios';

const logInWithSpotify = async () => {
  window.location.href = '/api/auth/spotify/start';
};

const getToken = async () => {
  const { data } = await axios.get<{ access_token: string }>('/spotify/token');
  return [data.access_token, true] as const;
};

export const getRefreshToken = async () => {
  const { data } = await axios.get<{ access_token: string }>('/spotify/token');
  return data.access_token;
};

export default { logInWithSpotify, getToken, getRefreshToken };
