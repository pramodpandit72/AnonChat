import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Signup() {
  const { signupUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    navigate('/feed');
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await signupUser({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/feed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card glass animate-fade-in" id="signup-card">
          <div className="auth-header">
            <span className="auth-icon">🎭</span>
            <h1 className="auth-title">Join AnonChat</h1>
            <p className="auth-subtitle">Create an account and get your anonymous identity</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
            <div className="form-group">
              <label htmlFor="signup-username" className="form-label">Username</label>
              <input
                type="text"
                id="signup-username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoFocus
              />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email</label>
              <input
                type="email"
                id="signup-email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
              <span className="form-hint">🔒 Your email is never shown to anyone</span>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <input
                type="password"
                id="signup-password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="signup-confirm"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                  Creating account...
                </span>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
