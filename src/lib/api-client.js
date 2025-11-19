import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://localhost:7151/api',
});

// TODO: later can add interceptors here for authentication, error handling, etc.

