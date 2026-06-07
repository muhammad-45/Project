import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import API from '../utils/api';
import './SearchFilters.css';

const cities = ['Abbottabad', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Faisalabad', 'Multan'];

const SearchFilters = ({ onFilter, initialFilters = {} }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    category: initialFilters.category || '',
    city: initialFilters.city || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const reset = { search: '', category: '', city: '', minPrice: '', maxPrice: '', sort: '' };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <div className="search-filters" id="search-filters">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filters-main">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search services..."
              className="search-input"
              id="filter-search"
            />
          </div>

          <div className="filter-select-wrapper">
            <FiMapPin className="filter-icon" />
            <select name="city" value={filters.city} onChange={handleChange} className="filter-select" id="filter-city">
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select name="category" value={filters.category} onChange={handleChange} className="filter-select" id="filter-category">
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-md" id="filter-search-btn">
            <FiSearch size={16} /> Search
          </button>

          <button 
            type="button" 
            className="btn btn-ghost btn-md filter-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <FiFilter size={16} />
          </button>
        </div>

        {showAdvanced && (
          <div className="filters-advanced animate-fade-in-down">
            <div className="filter-group">
              <label className="filter-label">Min Price (PKR)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
                id="filter-min-price"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Price (PKR)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="50000"
                className="form-input"
                id="filter-max-price"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select name="sort" value={filters.sort} onChange={handleChange} className="form-input" id="filter-sort">
                <option value="">Latest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
              Clear All
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilters;
