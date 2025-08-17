import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // change to your backend URL

export async function login(email, password) {
  const { data } = await axios.post(`${API_URL}/login`, { email, password });
  return data;
}
