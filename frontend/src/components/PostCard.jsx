import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reactToPost, deletePost } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/feed.css';

const REACTIONS = ['❤️', '🫂', '💪', '😢', '😊'];

const MOOD_ICONS = {
  happy: '😊', sad: '😢', angry: '😡', anxious: '😰',
  excited: '🤩', peaceful: '😌', confused: '😕', neutral: '🙂'
};

function PostCard({ post, onUpdate, onDelete }) {
  const { isAuthenticated, showToast } = useAuth();
  const [reacting, setReacting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleReact = async (type) => {
    if (!isAuthenticated) {
      showToast('Please login to react', 'error');
      return;
    }
    if (reacting) return;
    setReacting(true);
    try {
      const res = await reactToPost(post.id, type);
      if (onUpdate) onUpdate(res.data);
      setShowReactions(false);
    } catch {
      showToast('Failed to react', 'error');
    } finally {
      setReacting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      if (onDelete) onDelete(post.id);
      showToast('Post deleted', 'success');
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
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
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <article className="post-card glass animate-fade-in" id={`post-${post.id}`}>
      <div className="post-header">
        <div className="post-author">
          <span className="author-avatar">{post.anonymousAvatar}</span>
          <div className="author-info">
            <span className="author-name">{post.anonymousName}</span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="post-meta">
          {post.mood && post.mood !== 'neutral' && (
            <span className={`mood-badge mood-${post.mood}`}>
              {MOOD_ICONS[post.mood]} {post.mood}
            </span>
          )}
          {post.category && (
            <span className="category-tag">{post.category}</span>
          )}
        </div>
      </div>

      <Link to={`/post/${post.id}`} className="post-content-link">
        <p className="post-content">{post.content}</p>
      </Link>

      <div className="post-footer">
        <div className="post-actions">
          <div className="reaction-container">
            <button
              className={`action-btn reaction-trigger ${post.userReaction ? 'reacted' : ''}`}
              onClick={() => setShowReactions(!showReactions)}
              id={`react-btn-${post.id}`}
            >
              {post.userReaction || '❤️'} 
              <span className="action-count">{totalReactions || ''}</span>
            </button>

            {showReactions && (
              <div className="reaction-picker glass">
                {REACTIONS.map(r => (
                  <button
                    key={r}
                    className={`reaction-option ${post.userReaction === r ? 'active' : ''}`}
                    onClick={() => handleReact(r)}
                    disabled={reacting}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to={`/post/${post.id}`} className="action-btn" id={`comment-btn-${post.id}`}>
            💬 <span className="action-count">{post.commentCount || ''}</span>
          </Link>

          <span className="action-btn views-count">
            👁️ <span className="action-count">{post.viewCount || ''}</span>
          </span>
        </div>

        {post.ownPost && (
          <button
            className="btn btn-danger btn-sm delete-btn"
            onClick={handleDelete}
            disabled={deleting}
            id={`delete-btn-${post.id}`}
          >
            {deleting ? '...' : '🗑️'}
          </button>
        )}
      </div>
    </article>
  );
}

export default PostCard;
