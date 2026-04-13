import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById, getComments, addComment, deleteComment } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import '../styles/feed.css';

function PostDetail() {
  const { id } = useParams();
  const { isAuthenticated, showToast } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments(0);
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await getPostById(id);
      setPost(res.data);
    } catch (err) {
      console.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (page, append = false) => {
    try {
      const res = await getComments(id, page, 20);
      setComments(prev => append ? [...prev, ...res.data.content] : res.data.content);
      setHasMoreComments(!res.data.last);
      setCommentPage(page);
    } catch (err) {
      console.log('No comments yet');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      showToast('Please login to comment', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await addComment(id, { content: commentText.trim() });
      setComments(prev => [res.data, ...prev]);
      setCommentText('');
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      showToast('Comment added anonymously! 🎭', 'success');
    } catch (err) {
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPost(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
      showToast('Comment deleted', 'success');
    } catch {
      showToast('Failed to delete comment', 'error');
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

  if (loading) {
    return (
      <div className="feed-page container">
        <div className="loading-spinner" style={{ paddingTop: 120 }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="feed-page container">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-icon">😕</div>
          <h3 className="empty-title">Post not found</h3>
          <Link to="/feed" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Link to="/feed" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          ← Back to Feed
        </Link>

        <PostCard post={post} onUpdate={setPost} />

        {/* Comments Section */}
        <div className="comments-section animate-fade-in">
          <h3 className="comments-title">
            💬 Comments ({post.commentCount || 0})
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <input
                type="text"
                className="comment-input"
                placeholder="Write an anonymous comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                id="comment-input"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !commentText.trim()}
                id="submit-comment-btn"
              >
                {submitting ? '...' : 'Send'}
              </button>
            </form>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              <Link to="/login" className="auth-link">Login</Link> to comment anonymously
            </div>
          )}

          {comments.length > 0 ? (
            <>
              {comments.map(comment => (
                <div className="comment-card" key={comment.id}>
                  <span className="comment-avatar">{comment.anonymousAvatar}</span>
                  <div className="comment-body">
                    <div className="comment-header">
                      <div>
                        <span className="comment-name">{comment.anonymousName}</span>
                        <span className="comment-time" style={{ marginLeft: 8 }}>
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {comment.ownComment && (
                        <button
                          className="comment-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}

              {hasMoreComments && (
                <div className="load-more-container">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => loadComments(commentPage + 1, true)}
                  >
                    Load more comments
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
              No comments yet. Be the first to respond! 💬
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
