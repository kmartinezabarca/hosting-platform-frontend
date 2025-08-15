import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const register = (name, email, password, password_confirmation) => {
  return axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
    password_confirmation,
  });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  })
  .then((response) => {
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const logout = () => {
  localStorage.removeItem('user');
  // Optionally, send a request to the backend to invalidate the token
  // return axios.post(`${API_URL}/auth/logout`);
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;


