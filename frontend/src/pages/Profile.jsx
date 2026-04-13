import { useState, useEffect } from 'react';
import { getMyPosts, getUserStats } from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import '../styles/profile.css';
import '../styles/feed.css';

function Profile() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [postsRes, statsRes] = await Promise.all([
        getMyPosts(0, 10),
        getUserStats(),
      ]);
      setPosts(postsRes.data.content);
      setHasMore(!postsRes.data.last);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const res = await getMyPosts(nextPage, 10);
      setPosts(prev => [...prev, ...res.data.content]);
      setHasMore(!res.data.last);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more');
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDelete = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
    if (stats) setStats({ ...stats, postCount: stats.postCount - 1 });
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    if (stats) setStats({ ...stats, postCount: stats.postCount + 1 });
  };

  if (loading) {
    return (
      <div className="feed-page container">
        <div className="loading-spinner" style={{ paddingTop: 120 }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page container">
      {/* Profile Header */}
      {stats && (
        <div className="profile-header glass animate-fade-in">
          <div className="profile-avatar-section">
            <span className="profile-avatar">{stats.anonymousAvatar}</span>
            <div className="profile-info">
              <h1 className="profile-name">{stats.anonymousName}</h1>
              <p className="profile-since">
                Member since {new Date(stats.memberSince).toLocaleDateString('en-US', { 
                  month: 'long', year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{stats.postCount}</span>
              <span className="stat-name">Posts</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{stats.totalReactions}</span>
              <span className="stat-name">Reactions</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{stats.totalViews}</span>
              <span className="stat-name">Views</span>
            </div>
          </div>
        </div>
      )}

      {/* My Posts */}
      <div className="profile-posts-section">
        <h2 className="profile-posts-title">
          My Posts 📝
        </h2>

        <div className="feed-grid">
          {posts.length > 0 ? (
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
                  <button className="btn btn-secondary" onClick={loadMore} id="load-more-profile">
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✍️</div>
              <h3 className="empty-title">No posts yet</h3>
              <p className="empty-text">
                Start sharing your thoughts, feelings, and experiences anonymously!
              </p>
            </div>
          )}
        </div>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}

export default Profile;
