import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Safety Check: If the saved user has a string ID (MongoDB style), clear it.
        // PostgreSQL IDs are numbers.
        const looksLikeMongoObjectId =
          typeof parsedUser.id === 'string' && /^[a-f0-9]{24}$/i.test(parsedUser.id);
        if (looksLikeMongoObjectId) {
          console.log('Detected old MongoDB session. Clearing...');
          logout();
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = ({ token, ...userFromApi }) => {
    setUser(userFromApi);
    localStorage.setItem('user', JSON.stringify(userFromApi));
    if (token) localStorage.setItem('token', token);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (e) {
      // If the session is invalid, the axios interceptor will handle redirect.
      console.error('Failed to refresh user', e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
