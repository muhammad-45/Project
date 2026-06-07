import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import BookingModal from '../components/BookingModal';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import { FiMapPin, FiClock, FiCheckCircle, FiCalendar, FiPhone, FiMail, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data } = await API.get(`/services/${id}`);
      setService(data.service);
    } catch (error) {
      toast.error('Service not found.');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.info('Please login to book a service.');
      return navigate('/login');
    }
    if (!isCustomer) {
      return toast.warning('Only customers can book services.');
    }
    setShowBooking(true);
  };

  if (loading) return <Loader text="Loading service details..." />;
  if (!service) return null;

  const provider = service.provider;

  return (
    <div className="service-detail-page" id="service-detail-page">
      <div className="container">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="detail-grid">
          <div className="detail-main animate-fade-in-up">
            <div className="detail-badges">
              <span className="service-category-badge">
                {service.category?.icon} {service.category?.name}
              </span>
              {provider?.providerInfo?.isVerified && (
                <span className="verified-badge">
                  <FiCheckCircle size={14} /> Verified
                </span>
              )}
            </div>

            <h1 className="detail-title">{service.title}</h1>
            
            <div className="detail-meta">
              <span><FiMapPin size={16} /> {service.city}</span>
              <span><FiClock size={16} /> {service.priceType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</span>
            </div>

            <div className="detail-price-box">
              <span className="detail-price">PKR {service.price?.toLocaleString()}</span>
              {service.priceType === 'hourly' && <span className="detail-price-type">/hour</span>}
            </div>

            <div className="detail-section">
              <h3>Description</h3>
              <p>{service.description}</p>
            </div>

            {service.areas && service.areas.length > 0 && (
              <div className="detail-section">
                <h3>Service Areas</h3>
                <div className="area-tags">
                  {service.areas.map((area, i) => (
                    <span key={i} className="area-tag">{area}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-sidebar animate-fade-in">
            {/* Provider Card */}
            <div className="provider-card">
              <div className="provider-card-header">
                <div className="provider-avatar-lg">
                  {provider?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="provider-card-name">
                    {provider?.name}
                    {provider?.providerInfo?.isVerified && <FiCheckCircle className="verified-icon" />}
                  </h4>
                  <StarRating rating={provider?.providerInfo?.rating || 0} size={14} />
                  <span className="provider-reviews">
                    ({provider?.providerInfo?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {provider?.providerInfo?.bio && (
                <p className="provider-bio">{provider.providerInfo.bio}</p>
              )}

              <div className="provider-details">
                {provider?.city && (
                  <div className="provider-detail-item">
                    <FiMapPin size={14} />
                    <span>{provider.city}</span>
                  </div>
                )}
                {provider?.phone && (
                  <div className="provider-detail-item">
                    <FiPhone size={14} />
                    <span>{provider.phone}</span>
                  </div>
                )}
                {provider?.email && (
                  <div className="provider-detail-item">
                    <FiMail size={14} />
                    <span>{provider.email}</span>
                  </div>
                )}
                {provider?.providerInfo?.experience > 0 && (
                  <div className="provider-detail-item">
                    <FiCalendar size={14} />
                    <span>{provider.providerInfo.experience} years experience</span>
                  </div>
                )}
              </div>

              {provider?.providerInfo?.skills?.length > 0 && (
                <div className="provider-skills">
                  <h5>Skills</h5>
                  <div className="skill-tags">
                    {provider.providerInfo.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-lg btn-block" onClick={handleBook} id="book-service-btn">
                <FiCalendar size={18} /> Book This Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal 
          service={service} 
          onClose={() => setShowBooking(false)} 
          onSuccess={() => navigate('/bookings')}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
