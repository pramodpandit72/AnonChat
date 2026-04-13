import { useState } from 'react';
import { createPost } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['thought', 'feeling', 'experience', 'emotion', 'rant', 'gratitude', 'advice'];
const MOODS = [
  { value: 'happy', icon: '😊', label: 'Happy' },
  { value: 'sad', icon: '😢', label: 'Sad' },
  { value: 'angry', icon: '😡', label: 'Angry' },
  { value: 'anxious', icon: '😰', label: 'Anxious' },
  { value: 'excited', icon: '🤩', label: 'Excited' },
  { value: 'peaceful', icon: '😌', label: 'Peaceful' },
  { value: 'confused', icon: '😕', label: 'Confused' },
  { value: 'neutral', icon: '🙂', label: 'Neutral' },
];

function CreatePost({ onPostCreated }) {
  const { showToast } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('thought');
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const res = await createPost({ content: content.trim(), category, mood });
      setContent('');
      setCategory('thought');
      setMood('neutral');
      setIsOpen(false);
      showToast('Post shared anonymously! 🎭', 'success');
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="create-post-fab"
          onClick={() => setIsOpen(true)}
          id="create-post-fab"
          title="Share your thoughts"
        >
          <span className="fab-icon">✍️</span>
          <span className="fab-text">Share</span>
        </button>
      )}

      {isOpen && (
        <div className="create-post-overlay" onClick={() => setIsOpen(false)}>
          <div className="create-post-modal glass" onClick={e => e.stopPropagation()} id="create-post-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="gradient-text">Share Anonymously</span> 🎭
              </h3>
              <button className="modal-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="create-post-form">
              <textarea
                className="post-textarea"
                placeholder="What's on your mind? Share your thoughts, feelings, or experiences... 💭"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                rows={5}
                autoFocus
                id="post-content-input"
              />
              <div className="char-count">{content.length}/2000</div>

              <div className="form-section">
                <label className="form-label">How are you feeling?</label>
                <div className="mood-picker">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      className={`mood-option ${mood === m.value ? 'active' : ''}`}
                      onClick={() => setMood(m.value)}
                    >
                      <span className="mood-icon">{m.icon}</span>
                      <span className="mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Category</label>
                <div className="category-picker">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`category-option ${category === c ? 'active' : ''}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !content.trim()}
                  id="submit-post-btn"
                >
                  {loading ? 'Sharing...' : '🚀 Share Anonymously'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;
