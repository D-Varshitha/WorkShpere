import { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import api from '../api/axios';
=======
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3

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

<<<<<<< HEAD
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
=======
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
=======
    <AuthContext.Provider value={{ user, login, logout, loading }}>
>>>>>>> 0a06ae65cf91bb6d9063e587f7198e572e340cc3
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
