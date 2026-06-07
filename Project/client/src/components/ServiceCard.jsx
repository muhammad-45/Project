import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const provider = service.provider;
  const category = service.category;

  return (
    <Link to={`/services/${service._id}`} className="service-card animate-fade-in-up" id={`service-${service._id}`}>
      <div className="service-card-header">
        <span className="service-category-badge">
          {category?.icon} {category?.name}
        </span>
        <span className="service-price">
          PKR {service.price?.toLocaleString()}
          {service.priceType === 'hourly' && <small>/hr</small>}
        </span>
      </div>

      <h3 className="service-card-title">{service.title}</h3>
      <p className="service-card-desc">{service.description?.substring(0, 100)}...</p>

      <div className="service-card-provider">
        <div className="provider-avatar-sm">
          {provider?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="provider-info-sm">
          <span className="provider-name-sm">
            {provider?.name}
            {provider?.providerInfo?.isVerified && (
              <FiCheckCircle className="verified-icon" title="Verified Provider" />
            )}
          </span>
          <span className="provider-meta-sm">
            <FiMapPin size={12} /> {service.city}
          </span>
        </div>
      </div>

      <div className="service-card-footer">
        <div className="service-rating">
          <FiStar className="star-filled" />
          <span>{provider?.providerInfo?.rating?.toFixed(1) || '0.0'}</span>
          <small>({provider?.providerInfo?.totalReviews || 0})</small>
        </div>
        <div className="service-type-badge">
          <FiClock size={12} />
          {service.priceType === 'hourly' ? 'Hourly' : 'Fixed'}
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
