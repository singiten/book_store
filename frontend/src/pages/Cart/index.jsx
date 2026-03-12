import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../services/api';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
      showError('Failed to load cart');
    }
  };

  const handleUpdateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await updateCartItem(bookId, newQuantity);
      await fetchCart();
      showInfo('Cart updated');
    } catch (error) {
      showError(error.response?.data?.error || 'Error updating cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (bookId) => {
    setUpdating(true);
    try {
      await removeFromCart(bookId);
      await fetchCart();
      showSuccess('Item removed from cart');
    } catch (error) {
      showError('Error removing item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setUpdating(true);
    try {
      await clearCart();
      await fetchCart();
      showInfo('Cart cleared');
    } catch (error) {
      showError('Error clearing cart');
    } finally {
      setUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse our collection and find your next favorite book!</p>
          <Link to="/books" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-container">
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item.book._id} className="cart-item">
                  <Link to={`/books/${item.book.slug}`} className="item-image">
                    <img 
                      src={item.book.coverImage ? `http://localhost:5001${item.book.coverImage}` : '/default-book.jpg'} 
                      alt={item.book.title}
                    />
                  </Link>
                  
                  <div className="item-details">
                    <Link to={`/books/${item.book.slug}`} className="item-title">
                      {item.book.title}
                    </Link>
                    <p className="item-author">by {item.book.author}</p>
                    
                    <div className="item-price">
                      {item.price} Birr
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-control">
                        <button 
                          onClick={() => handleUpdateQuantity(item.book._id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                        >-</button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.book._id, item.quantity + 1)}
                          disabled={updating}
                        >+</button>
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.book._id)}
                        disabled={updating}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-total">
                    {item.price * item.quantity} Birr
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{calculateSubtotal()} Birr</span>
              </div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>{calculateSubtotal()} Birr</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={() => {
                  showInfo('Checkout coming soon!');
                }}
                disabled={updating}
              >
                Proceed to Checkout
              </button>

              <div className="cart-actions">
                <button 
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                  disabled={updating}
                >
                  Clear Cart
                </button>
                
                <Link to="/books" className="continue-link">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;