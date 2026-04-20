import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setUser({ token });
      setIsAdmin(adminFlag);
      if (!adminFlag) {
        fetchBalance();
      }
    }
    setLoading(false);
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/api/wallet');
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Erro ao buscar saldo');
    }
  };

  const login = async (phone, password) => {
    const res = await api.post('/api/auth/login', { phone, password });
    localStorage.setItem('token', res.data.token);
    localStorage.removeItem('isAdmin');
    setUser({ token: res.data.token });
    setIsAdmin(false);
    await fetchBalance();
    return res.data;
  };

  const register = async (phone, password) => {
    const res = await api.post('/api/auth/register', { phone, password });
    localStorage.setItem('token', res.data.token);
    localStorage.removeItem('isAdmin');
    setUser({ token: res.data.token });
    setIsAdmin(false);
    setBalance(0);
    return res.data;
  };

  const adminLogin = async (phone, password) => {
    const res = await api.post('/api/admin/login', { phone, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('isAdmin', 'true');
    setUser({ token: res.data.token });
    setIsAdmin(true);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setUser(null);
    setIsAdmin(false);
    setBalance(0);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, balance, setBalance, login, register, adminLogin, logout, fetchBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
