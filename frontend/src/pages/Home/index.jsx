import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getBooks } from '../../services/api';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, booksRes] = await Promise.all([
        getCategories(),
        getBooks({ limit: 8 })
      ]);
      setCategories(categoriesRes.data);
      setFeaturedBooks(booksRes.data.books || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>የኢትዮጵያ መጽሐፍት መደብር</h1>
          <p>Ethiopian Bookstore - Discover books in Amharic, English, and more</p>
          <Link to="/books" className="btn-primary">Browse Books</Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Book Categories</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link 
              to={`/books?category=${category._id}`} 
              key={category._id} 
              className="category-card"
            >
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="book-count">{category.bookCount} books</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-section">
        <h2>Featured Books</h2>
        <div className="books-grid">
          {featuredBooks.map(book => (
            <Link to={`/books/${book.slug}`} key={book._id} className="book-card">
              <img 
                src={book.coverImage ? `http://localhost:5001${book.coverImage}` : '/default-book.jpg'} 
                alt={book.title}
              />
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              <p className="price">{book.priceETB} Birr</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;