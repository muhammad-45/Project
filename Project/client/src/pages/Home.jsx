import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiShield, FiClock, FiStar, FiArrowRight, FiCheckCircle, FiUsers } from 'react-icons/fi';
import API from '../utils/api';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ providers: 0, services: 0, cities: 7 });

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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content animate-fade-in-up">
            <span className="hero-badge">
              <FiShield size={14} /> Trusted Service Providers
            </span>
            <h1 className="hero-title">
              Find Expert Local Services <span className="hero-highlight">Near You</span>
            </h1>
            <p className="hero-subtitle">
              Connect with verified electricians, plumbers, tutors, mechanics, and more 
              in Abbottabad, Islamabad, and across Pakistan.
            </p>
            
            <div className="hero-search glass">
              <FiSearch className="hero-search-icon" />
              <input 
                type="text" 
                placeholder="What service are you looking for?" 
                className="hero-search-input"
                id="hero-search-input"
              />
              <select className="hero-search-select" id="hero-city-select">
                <option value="">All Cities</option>
                <option value="Abbottabad">Abbottabad</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
              </select>
              <Link to="/services" className="btn btn-primary btn-md hero-search-btn">
                Search <FiArrowRight />
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">500+</span>
                <span className="hero-stat-label">Providers</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">1000+</span>
                <span className="hero-stat-label">Services</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">7+</span>
                <span className="hero-stat-label">Cities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section" id="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2>Browse Service Categories</h2>
            <p className="section-subtitle">Find the right professional for every need</p>
          </div>
          
          <div className="categories-grid stagger-children">
            {categories.map((cat) => (
              <Link 
                to={`/services?category=${cat._id}`} 
                key={cat._id} 
                className="category-card animate-fade-in-up"
                id={`category-${cat._id}`}
              >
                <span className="category-icon">{cat.icon}</span>
                <h4 className="category-name">{cat.name}</h4>
                <p className="category-desc">{cat.description}</p>
                <span className="category-link">
                  Explore <FiArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2>How ServeNear Works</h2>
            <p className="section-subtitle">Get the help you need in 3 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card animate-fade-in-up">
              <div className="step-number">1</div>
              <div className="step-icon-wrap">
                <FiSearch size={28} />
              </div>
              <h4>Search & Browse</h4>
              <p>Search for services by category, location, or keyword. Filter by price and ratings.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card animate-fade-in-up">
              <div className="step-number">2</div>
              <div className="step-icon-wrap">
                <FiCalendar size={28} />
              </div>
              <h4>Book a Service</h4>
              <p>Choose your preferred date, time, and provide your address. Booking is instant.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card animate-fade-in-up">
              <div className="step-number">3</div>
              <div className="step-icon-wrap">
                <FiCheckCircle size={28} />
              </div>
              <h4>Get It Done</h4>
              <p>The verified provider arrives at your doorstep. Pay after the job is completed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-us-section" id="why-us">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why ServeNear</span>
            <h2>Your Trusted Service Partner</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield size={24} />
              </div>
              <h4>Verified Providers</h4>
              <p>Every provider goes through admin verification before appearing on the platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiStar size={24} />
              </div>
              <h4>Ratings & Reviews</h4>
              <p>Real customer ratings help you choose the best service provider with confidence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiMapPin size={24} />
              </div>
              <h4>Local Coverage</h4>
              <p>Serving Abbottabad, Islamabad, and expanding across all major cities of Pakistan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiClock size={24} />
              </div>
              <h4>Easy Booking</h4>
              <p>Book in minutes. Pick your date, time, and address — we handle the rest.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers size={24} />
              </div>
              <h4>For Everyone</h4>
              <p>Whether you need a plumber, tutor, or beautician — we have you covered.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-accent">
                💰
              </div>
              <h4>Fair Pricing</h4>
              <p>Transparent pricing with no hidden charges. Compare rates before you book.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card glass-dark">
            <h2>Ready to Get Started?</h2>
            <p>Join ServeNear today — whether you're looking for services or offering your skills.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Sign Up as Customer <FiArrowRight />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FiCalendar = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default Home;
