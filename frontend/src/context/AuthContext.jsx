import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, signup as signupApi } from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('anonchat_token');
    const message = localStorage.getItem('anonchat_welcome');
    if (token) {
      setUser({ token });
    }
    if (message) {
      showToast(message, 'success');
      localStorage.removeItem('anonchat_welcome');
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loginUser = async (credentials) => {
    try {
      const res = await loginApi(credentials);
      const { token, message } = res.data;
      localStorage.setItem('anonchat_token', token);
      setUser({ token });
      showToast(message, 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const signupUser = async (data) => {
    try {
      const res = await signupApi(data);
      const { token, message } = res.data;
      localStorage.setItem('anonchat_token', token);
      localStorage.setItem('anonchat_welcome', message);
      setUser({ token });
      showToast(message, 'success');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('anonchat_token');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const isAuthenticated = !!user?.token;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      toast,
      isAuthenticated,
      loginUser,
      signupUser,
      logout,
      showToast,
    }}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
