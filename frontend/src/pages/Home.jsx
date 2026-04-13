import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrendingPosts } from '../api/axios';
import '../styles/home.css';

function Home() {
  const { isAuthenticated } = useAuth();
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const res = await getTrendingPosts();
      setTrending(res.data);
    } catch (err) {
      console.log('No trending posts yet');
    } finally {
      setLoadingTrending(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        
        <div className="hero-content container">
          <div className="hero-badge animate-fade-in">
            <span className="badge-icon">🔒</span>
            <span>100% Anonymous & Secure</span>
          </div>
          
          <h1 className="hero-title animate-fade-in">
            Share Your <span className="gradient-text">True Self</span>
            <br />Without Revealing It
          </h1>
          
          <p className="hero-subtitle animate-fade-in">
            A safe space to express your thoughts, feelings, and experiences with complete anonymity.
            No judgments, no identities — just genuine human connection.
          </p>
          
          <div className="hero-actions animate-fade-in">
            {isAuthenticated ? (
              <Link to="/feed" className="btn btn-primary btn-lg" id="hero-cta-feed">
                📝 Go to Feed
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg" id="hero-cta-signup">
                  🚀 Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-cta-login">
                  Sign In
                </Link>
              </>
            )}
          </div>
          
          <div className="hero-stats animate-fade-in">
            <div className="stat-item">
              <span className="stat-icon">🎭</span>
              <span className="stat-label">Anonymous</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-icon">🔐</span>
              <span className="stat-label">Encrypted</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">Real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container" id="features-section">
        <h2 className="section-title">
          Why <span className="gradient-text">AnonChat</span>?
        </h2>
        <p className="section-subtitle">Express yourself freely in a safe, anonymous environment</p>
        
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🎭</span>
            </div>
            <h3 className="feature-title">Complete Anonymity</h3>
            <p className="feature-desc">
              Your identity is never revealed. Share freely without fear of exposure. 
              Each user gets a unique anonymous avatar.
            </p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">💭</span>
            </div>
            <h3 className="feature-title">Express Freely</h3>
            <p className="feature-desc">
              Share thoughts, feelings, experiences, and emotions. 
              Tag your mood and let others relate to your story.
            </p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">❤️</span>
            </div>
            <h3 className="feature-title">React & Connect</h3>
            <p className="feature-desc">
              React with emojis, leave anonymous comments, and show support 
              without revealing who you are.
            </p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🔥</span>
            </div>
            <h3 className="feature-title">Trending Posts</h3>
            <p className="feature-desc">
              Discover what's resonating with the community. 
              Trending posts are visible to everyone, even without an account.
            </p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🔒</span>
            </div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-desc">
              Built with JWT authentication and BCrypt encryption. 
              Your data is protected with industry-standard security.
            </p>
          </div>
          
          <div className="feature-card glass">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📱</span>
            </div>
            <h3 className="feature-title">Works Everywhere</h3>
            <p className="feature-desc">
              Fully responsive design. Use on your phone, tablet, or desktop. 
              Your safe space, wherever you go.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Section - Visible to Everyone */}
      {trending.length > 0 && (
        <section className="home-trending container" id="trending-section">
          <h2 className="section-title">
            <span className="trending-fire">🔥</span> Trending Now
          </h2>
          <p className="section-subtitle">See what's resonating with the community</p>
          
          <div className="trending-grid">
            {trending.map((post, index) => (
              <Link
                to={`/post/${post.id}`}
                className="trending-home-card glass"
                key={post.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                id={`trending-post-${post.id}`}
              >
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-card-author">
                  <span className="trending-card-avatar">{post.anonymousAvatar}</span>
                  <span className="trending-card-name">{post.anonymousName}</span>
                </div>
                <p className="trending-card-content">{post.content}</p>
                <div className="trending-card-footer">
                  {post.mood && post.mood !== 'neutral' && (
                    <span className={`mood-badge mood-${post.mood}`} style={{ fontSize: '11px' }}>
                      {post.mood}
                    </span>
                  )}
                  <div className="trending-card-stats">
                    <span>❤️ {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}</span>
                    <span>💬 {post.commentCount || 0}</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card glass">
            <div className="cta-glow"></div>
            <h2 className="cta-title">Ready to Share Your Story?</h2>
            <p className="cta-text">
              Join the community of people sharing their authentic selves, anonymously.
            </p>
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-primary btn-lg" id="cta-signup-btn">
                ✨ Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
