import api from './api';

export const register = async (email, senha, nome) => {
  try {
    const response = await api.post('/auth/register', { email, senha, nome });
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Erro ao registrar.';
  }
};

export const login = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Erro ao fazer login.';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};