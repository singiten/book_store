import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks, getCategories } from '../../services/api';
import './Books.css';

const Books = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [currentPage, filters.category]);

  const fetchBooks = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 12,
        category: filters.category || undefined
      };
      const response = await getBooks(params);
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
    setCurrentPage(1);
  };

  // Helper function to get the correct image URL
  const getImageUrl = (coverImage) => {
  if (!coverImage) return '/default-book.jpg';
  
  // Check for ANY full URL (http or https)
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  
  // Also check for cloudinary specifically (belt and suspenders)
  if (coverImage.includes('cloudinary.com')) {
    return coverImage;
  }
  
  return `https://book-store-5sk4.onrender.com${coverImage}`;
};

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>All Books</h1>
        <p>Discover Ethiopian books across all categories</p>
      </div>

      <div className="books-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3>Filter by Category</h3>
          <select 
            value={filters.category} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.bookCount})
              </option>
            ))}
          </select>
        </aside>

        {/* Books Grid */}
        <div className="books-grid">
          {books.map(book => (
            <Link to={`/books/${book.slug}`} key={book._id} className="book-card">
              <img 
                src={getImageUrl(book.coverImage)} 
                alt={book.title}
              />
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              <p className="price">{book.priceETB} Birr</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default Books;