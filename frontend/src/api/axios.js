import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('anonchat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anonchat_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// Posts
export const getPosts = (page = 0, size = 10, category = '', mood = '') => {
  const params = new URLSearchParams({ page, size });
  if (category) params.append('category', category);
  if (mood) params.append('mood', mood);
  return API.get(`/posts?${params}`);
};
export const getTrendingPosts = () => API.get('/posts/trending');
export const getPostById = (id) => API.get(`/posts/${id}`);
export const getMyPosts = (page = 0, size = 10) => API.get(`/posts/my?page=${page}&size=${size}`);
export const createPost = (data) => API.post('/posts', data);
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const reactToPost = (id, type) => API.post(`/posts/${id}/react`, { type });
export const getUserStats = () => API.get('/posts/stats');

// Comments
export const getComments = (postId, page = 0, size = 20) =>
  API.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
export const addComment = (postId, data) => API.post(`/posts/${postId}/comments`, data);
export const deleteComment = (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`);

export default API;
