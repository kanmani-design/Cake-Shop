import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', withCredentials: true });
export const errMsg = e => e.response?.data?.message || 'Could not reach the server. Please try again.';
export const inr = n => '₹' + Number(n).toLocaleString('en-IN');
