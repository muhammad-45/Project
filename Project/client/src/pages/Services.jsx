import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import ServiceCard from '../components/ServiceCard';
import SearchFilters from '../components/SearchFilters';
import Loader from '../components/Loader';
import { FiInbox } from 'react-icons/fi';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get('category') || '';
    fetchServices({ category });
  }, [searchParams]);

  const fetchServices = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await API.get(`/services?${params.toString()}`);
      setServices(data.services || []);
      setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    fetchServices(filters);
  };

  const handlePageChange = (page) => {
    fetchServices({ page });
  };

  return (
    <div className="services-page" id="services-page">
      <div className="container">
        <div className="page-header">
          <h1>Find Services</h1>
          <p>Browse verified service providers across Pakistan</p>
        </div>

        <SearchFilters onFilter={handleFilter} />

        {loading ? (
          <Loader text="Finding services..." />
        ) : services.length === 0 ? (
          <div className="empty-state">
            <FiInbox size={48} />
            <h3>No Services Found</h3>
            <p>Try adjusting your filters or search for something different.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{pagination.total} services found</p>
            <div className="services-grid stagger-children">
              {services.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === pagination.current ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
