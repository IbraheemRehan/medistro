import axios from 'axios';
import { getApiErrorMessage } from '../utils/apiErrors';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages for consistent UI handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      error.response.data.message = getApiErrorMessage(error);
    }
    return Promise.reject(error);
  }
);

export default API;
export { getApiErrorMessage };
