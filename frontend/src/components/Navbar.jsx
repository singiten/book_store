import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCartCount } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
    fetchCartCount();
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'User');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserName('User');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  const handleStorageChange = () => {
    checkLoginStatus();
    fetchCartCount();
  };

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getCartCount();
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setCartCount(0);
    navigate('/');
  };

  // Get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-amharic">ኩራዝ</span>
          <span className="logo-english">Kuraz Books</span>
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/books" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Books
          </Link>
          
          <Link to="/cart" className="nav-link cart-link" onClick={() => setIsMenuOpen(false)}>
            Cart 🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isLoggedIn ? (
            <>
              {/* User Greeting */}
              <span className="user-greeting">
                👋 Hi, {getFirstName(userName)}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link login-btn" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;