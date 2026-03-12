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
      console.log('RAW BOOK DATA:', response.data.books);
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

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <div className="books-page">
      <div className="books-header">
        <h1>All Books</h1>
        <p>Discover Ethiopian books across all categories</p>
      </div>

      <div className="books-layout">
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

        <div className="books-grid">
          {books.map(book => {
            // LOG THE EXACT URL FOR EACH BOOK
            console.log(`Book: ${book.title}, Cover URL:`, book.coverImage);
            
            return (
              <div key={book._id} className="book-card">
                <div className="book-image-container">
                  {/* DIRECT URL - NO FUNCTIONS, NO CONDITIONS */}
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    style={{ 
                      width: '100%', 
                      height: '250px', 
                      objectFit: 'cover',
                      backgroundColor: '#f0f0f0'
                    }}
                    onError={(e) => {
                      console.log('ERROR LOADING:', book.coverImage);
                      e.target.style.display = 'none';
                      // Add fallback text
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="height:250px; display:flex; align-items:center; justify-content:center; background:#f0f0f0; color:#999;">📚 No Image</div>';
                      }
                    }}
                  />
                </div>
                <Link to={`/books/${book.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <p className="price">{book.priceETB} Birr</p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

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