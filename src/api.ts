import Axios from 'axios';

const api = Axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
