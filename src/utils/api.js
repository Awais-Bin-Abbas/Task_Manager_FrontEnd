import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',   // Your Django backend URL
});

// Automatically add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;