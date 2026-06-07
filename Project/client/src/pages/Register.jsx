import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../utils/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    role: 'customer',
    bio: '',
    experience: '',
    category: '',
    hourlyRate: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) { /* ignore */ }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        role: formData.role
      };

      if (formData.role === 'provider') {
        userData.providerInfo = {
          bio: formData.bio,
          experience: Number(formData.experience) || 0,
          category: formData.category,
          hourlyRate: Number(formData.hourlyRate) || 0,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        };
      }

      const data = await register(userData);
      toast.success(data.message || 'Registration successful!');
      
      if (formData.role === 'provider') {
        toast.info('Your account will be verified by admin before your services appear.');
      }
      
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: formData.role === 'provider' ? '1000px' : '900px' }}>
        <div className="auth-left">
          <div className="auth-left-content">
            <img src="/logo.svg" alt="ServeNear" className="auth-logo" />
            <h2>Join ServeNear</h2>
            <p>Create an account to start booking services or offering your skills to customers across Pakistan.</p>
            <div className="auth-features">
              <div className="auth-feature">🛡️ Verified & Trusted</div>
              <div className="auth-feature">📍 Local Coverage</div>
              <div className="auth-feature">💰 Fair Pricing</div>
              <div className="auth-feature">⭐ Quality Service</div>
            </div>
          </div>
        </div>

        <div className="auth-right" style={{ overflowY: 'auto', maxHeight: '90vh' }}>
          <div className="auth-form-wrapper">
            <h3>Create Account</h3>
            <p className="auth-form-subtitle">Choose your role and fill in your details</p>

            {/* Role Selection */}
            <div className="role-selector" style={{ marginBottom: 'var(--space-6)' }}>
              <div 
                className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                id="role-customer"
              >
                <span className="role-option-icon">🏠</span>
                <span className="role-option-label">Customer</span>
                <span className="role-option-desc">Find & book services</span>
              </div>
              <div 
                className={`role-option ${formData.role === 'provider' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'provider' })}
                id="role-provider"
              >
                <span className="role-option-icon">🔧</span>
                <span className="role-option-label">Provider</span>
                <span className="role-option-desc">Offer your services</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><FiUser size={16} /> Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Your full name" required className="form-input" id="reg-name" />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiMail size={16} /> Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="your@email.com" required className="form-input" id="reg-email" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><FiLock size={16} /> Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min 6 characters" required minLength={6} className="form-input" id="reg-password" />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiLock size={16} /> Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter password" required className="form-input" id="reg-confirm" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><FiPhone size={16} /> Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+92-300-0000000" className="form-input" id="reg-phone" />
                </div>
                <div className="form-group">
                  <label className="form-label"><FiMapPin size={16} /> City</label>
                  <select name="city" value={formData.city} onChange={handleChange} required className="form-input" id="reg-city">
                    <option value="">Select city</option>
                    <option value="Abbottabad">Abbottabad</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>
              </div>

              {/* Provider-specific fields */}
              {formData.role === 'provider' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Service Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="form-input" id="reg-category">
                      <option value="">Select your specialty</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Experience (years)</label>
                      <input type="number" name="experience" value={formData.experience} onChange={handleChange}
                        placeholder="e.g. 5" min="0" className="form-input" id="reg-experience" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hourly Rate (PKR)</label>
                      <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange}
                        placeholder="e.g. 1500" min="0" className="form-input" id="reg-rate" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills (comma separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                      placeholder="e.g. Wiring, AC Repair, Installation" className="form-input" id="reg-skills" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange}
                      placeholder="Tell customers about yourself..." rows={3}
                      className="form-input form-textarea" id="reg-bio" />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'} {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
