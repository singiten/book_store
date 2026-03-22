import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (userData) => API.post('/auth/register', userData);

// Category APIs
export const getCategories = () => API.get('/categories');
export const getCategory = (slug) => API.get(`/categories/${slug}`);

// Book APIs
export const getBooks = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return API.get(`/books${queryString ? `?${queryString}` : ''}`);
};
export const getBook = (slug) => API.get(`/books/${slug}`);
export const getBooksByCategory = (categoryId) => API.get(`/books/category/${categoryId}`);

// Cart APIs
export const getCart = () => API.get('/cart');
export const addToCart = (bookId, quantity = 1) => API.post('/cart/add', { bookId, quantity });
export const updateCartItem = (bookId, quantity) => API.put(`/cart/update/${bookId}`, { quantity });
export const removeFromCart = (bookId) => API.delete(`/cart/remove/${bookId}`);
export const clearCart = () => API.delete('/cart/clear');
export const getCartCount = () => API.get('/cart/count');

export default API;