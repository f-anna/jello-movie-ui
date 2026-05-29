import axios from 'axios';

export const API_HOST = import.meta.env.VITE_API_URL || 'https://localhost:7151';

export const api = axios.create({
  baseURL: `${API_HOST}/api`,
  withCredentials: true,
});

export const PLACEHOLDER_POSTER = '/no_image_placeholder.png';

export const getImageUrl = (path) => {
  if (!path) return PLACEHOLDER_POSTER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_HOST}${path}`;
};


