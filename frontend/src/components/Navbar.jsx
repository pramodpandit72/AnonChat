import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('anonchat_theme') || 'dark');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('anonchat_theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} id="main-navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <span className="brand-icon">💬</span>
          <span className="brand-text">
            <span className="gradient-text">Anon</span>Chat
          </span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`} id="navbar-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} id="nav-home">
            <span className="nav-icon">🏠</span> Home
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/feed" className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`} id="nav-feed">
                <span className="nav-icon">📝</span> Feed
              </Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} id="nav-profile">
                <span className="nav-icon">👤</span> Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm nav-btn" id="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" id="nav-login">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm nav-btn" id="nav-signup">
                Get Started
              </Link>
            </>
          )}
          
          <button onClick={toggleTheme} className="theme-toggle" id="theme-toggle" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="hamburger-btn"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
