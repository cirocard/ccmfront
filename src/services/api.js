import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_URL_API_LOCAL,
});

export default api;
