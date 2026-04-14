import { useState, useEffect, useCallback, useRef } from 'react';
import { getPosts, getTrendingPosts } from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';
import '../styles/feed.css';

const CATEGORIES = ['all', 'thought', 'feeling', 'experience', 'emotion', 'rant', 'gratitude', 'advice'];
const MOODS = ['all', 'happy', 'sad', 'angry', 'anxious', 'excited', 'peaceful', 'confused'];

function Feed() {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMood, setActiveMood] = useState('all');
  const [filterType, setFilterType] = useState('category');
  const postsAbortRef = useRef(null);
  const trendingAbortRef = useRef(null);
  const initialLoadDoneRef = useRef(false);

  const loadPosts = useCallback(async (pageNum = 0, append = false) => {
    if (postsAbortRef.current) {
      postsAbortRef.current.abort();
    }
    const controller = new AbortController();
    postsAbortRef.current = controller;

    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const category = activeCategory !== 'all' ? activeCategory : '';
      const mood = activeMood !== 'all' ? activeMood : '';
      const res = await getPosts(pageNum, 10, category, mood, { signal: controller.signal });
      
      const newPosts = res.data.content;
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(!res.data.last);
      setPage(pageNum);
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return;
      console.error('Failed to load posts', err);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [activeCategory, activeMood]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      loadPosts(0);
      return;
    }

    const debounceTimer = setTimeout(() => {
      loadPosts(0);
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [loadPosts]);

  useEffect(() => {
    const controller = new AbortController();
    trendingAbortRef.current = controller;

    const loadTrending = async () => {
      try {
        const res = await getTrendingPosts({ signal: controller.signal });
        setTrending(res.data);
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return;
        console.log('No trending posts yet');
      }
    };

    loadTrending();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (postsAbortRef.current) postsAbortRef.current.abort();
      if (trendingAbortRef.current) trendingAbortRef.current.abort();
    };
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDelete = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveMood('all');
    setFilterType('category');
  };

  const handleMoodChange = (mood) => {
    setActiveMood(mood);
    setActiveCategory('all');
    setFilterType('mood');
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
    <div className="feed-page container">
      <div className="feed-header animate-fade-in">
        <h1 className="feed-title">
          <span className="gradient-text">Anonymous</span> Feed 📝
        </h1>
        <p className="feed-subtitle">See what the community is sharing, completely anonymously</p>
      </div>

      {/* Trending horizontal section */}
      {trending.length > 0 && (
        <div className="trending-section animate-fade-in">
          <div className="trending-header">
            <span className="trending-icon">🔥</span>
            <span className="trending-title">Trending</span>
          </div>
          <div className="trending-scroll">
            {trending.slice(0, 5).map(post => (
              <Link to={`/post/${post.id}`} className="trending-card glass" key={post.id}>
                <div className="trending-card-author">
                  <span className="trending-card-avatar">{post.anonymousAvatar}</span>
                  <span className="trending-card-name">{post.anonymousName}</span>
                </div>
                <p className="trending-card-content">{post.content}</p>
                <div className="trending-card-stats">
                  <span>❤️ {Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}</span>
                  <span>💬 {post.commentCount || 0}</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="feed-filters animate-fade-in">
        <button
          className={`filter-btn ${filterType === 'category' ? 'active' : ''}`}
          onClick={() => setFilterType('category')}
          style={{ fontWeight: 700 }}
        >
          📂 Category
        </button>
        <button
          className={`filter-btn ${filterType === 'mood' ? 'active' : ''}`}
          onClick={() => setFilterType('mood')}
          style={{ fontWeight: 700 }}
        >
          😊 Mood
        </button>
        <span style={{ width: 1, height: 24, background: 'var(--border-color)' }}></span>
        
        {filterType === 'category' && CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
        
        {filterType === 'mood' && MOODS.map(m => (
          <button
            key={m}
            className={`filter-btn ${activeMood === m ? 'active' : ''}`}
            onClick={() => handleMoodChange(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="feed-grid">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))}
            {hasMore && (
              <div className="load-more-container">
                <button
                  className="btn btn-secondary"
                  onClick={() => loadPosts(page + 1, true)}
                  disabled={loadingMore}
                  id="load-more-btn"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💭</div>
            <h3 className="empty-title">No posts yet</h3>
            <p className="empty-text">
              Be the first to share something! Tap the button below to create a post.
            </p>
          </div>
        )}
      </div>

      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}

export default Feed;
