import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBook, addToCart } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import './BookDetail.css';

const BookDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBook();
  }, [slug]);

  const fetchBook = async () => {
    try {
      const response = await getBook(slug);
      setBook(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book:', error);
      setLoading(false);
      showError('Failed to load book details');
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart(book._id, quantity);
      showSuccess(`${book.title} added to cart!`);
      setTimeout(() => navigate('/cart'), 1500);
    } catch (error) {
      showError(error.response?.data?.error || 'Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="error">Book not found</div>;

  return (
    <div className="book-detail">
      <div className="book-detail-container">
        <div className="book-image">
          <img 
            src={book.coverImage ? `http://localhost:5001${book.coverImage}` : '/default-book.jpg'} 
            alt={book.title}
          />
        </div>

        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">By {book.author}</p>
          
          <div className="book-meta">
            <span className="category">
              Category: {book.category?.name}
            </span>
            <span className="language">
              Language: {book.language}
            </span>
          </div>

          <div className="book-pricing">
            <span className="price-etb">{book.priceETB} Birr</span>
            {book.priceUSD && (
              <span className="price-usd">${book.priceUSD} USD</span>
            )}
          </div>

          <div className="stock-info">
            {book.stock > 0 ? (
              <span className="in-stock">✓ In Stock ({book.stock} available)</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          <div className="book-description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>

          {book.publisher && (
            <div className="book-details">
              <p><strong>Publisher:</strong> {book.publisher}</p>
              {book.publishedYear && <p><strong>Published:</strong> {book.publishedYear}</p>}
              {book.pages && <p><strong>Pages:</strong> {book.pages}</p>}
            </div>
          )}

          {book.stock > 0 && (
            <div className="add-to-cart-section">
              {!token ? (
                <div className="login-prompt">
                  <p>Please <Link to="/login">login</Link> to add items to cart</p>
                </div>
              ) : (
                <>
                  <div className="quantity-selector">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q-1))}
                      disabled={quantity <= 1}
                    >-</button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(book.stock, q+1))}
                      disabled={quantity >= book.stock}
                    >+</button>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;