import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Make sure this matches your backend port
});

export default api;
