import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <div className="footer-logo">
            <span className="footer-logo-icon">📖✝️</span>
            <span className="footer-logo-text">ኩራዝ መጻሕፍት</span>
          </div>
          <p className="footer-description">
            የኢትዮጵያ ባህል እና እምነትን የሚያንጸባርቅ የመጻሕፍት መደብር
          </p>
          <p className="footer-description-english">
            Ethiopian bookstore celebrating culture, faith, and knowledge through books.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">📘</a>
            <a href="#" className="social-link" aria-label="Telegram">📱</a>
            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/books">Books</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h3 className="footer-title">Categories</h3>
          <ul className="footer-links">
            <li><Link to="/books?category=religious">Religious Books</Link></li>
            <li><Link to="/books?category=history">Ethiopian History</Link></li>
            <li><Link to="/books?category=fiction">Amharic Fiction</Link></li>
            <li><Link to="/books?category=children">Children's Books</Link></li>
            <li><Link to="/books?category=educational">Educational</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <ul className="contact-info">
            <li>
              <span className="contact-icon">📍</span>
              <span>Addis Ababa, Ethiopia</span>
            </li>
            <li>
              <span className="contact-icon">📞</span>
              <span>+251 911 234 567</span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <span>info@kurazbooks.com</span>
            </li>
            <li>
              <span className="contact-icon">🕒</span>
              <span>Mon-Sat: 9:00 AM - 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            © {currentYear} ኩራዝ መጻሕፍት (Kuraz Books). All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
      </div>

      {/* Ethiopian Flag Stripe */}
      <div className="flag-stripe">
        <div className="stripe-green"></div>
        <div className="stripe-yellow"></div>
        <div className="stripe-red"></div>
      </div>
    </footer>
  );
};

export default Footer;