import { Link } from 'react-router-dom';
import '../styles/footer.css';

function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-glow"></div>
      <div className="footer-container container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand">
              <span className="brand-icon">💬</span>
              <span className="brand-text">
                <span className="gradient-text">Anon</span>Chat
              </span>
            </Link>
            <p className="footer-tagline">
              A safe space to share your thoughts, feelings, and experiences anonymously. 
              Your identity is always protected.
            </p>
          </div>

          <div className="footer-links-section">
            <h4 className="footer-title">Navigate</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/feed" className="footer-link">Feed</Link>
            <Link to="/profile" className="footer-link">Profile</Link>
          </div>

          <div className="footer-links-section">
            <h4 className="footer-title">Features</h4>
            <span className="footer-link">🔒 Anonymous Posts</span>
            <span className="footer-link">💬 Comments</span>
            <span className="footer-link">❤️ Reactions</span>
            <span className="footer-link">🔥 Trending</span>
          </div>

          <div className="footer-links-section">
            <h4 className="footer-title">Safety</h4>
            <span className="footer-link">🛡️ End-to-end Privacy</span>
            <span className="footer-link">🎭 Anonymous Identity</span>
            <span className="footer-link">🔐 Encrypted Auth</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} AnonChat. Built with ❤️ • Your identity, always protected.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">🔒 Secure</span>
            <span className="footer-badge">🎭 Anonymous</span>
            <span className="footer-badge">⚡ Fast</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
