import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiDollarSign, FiPackage, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', price: '', priceType: 'fixed', city: '', areas: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes, categoriesRes] = await Promise.all([
        API.get('/services/my/services'),
        API.get('/bookings/my'),
        API.get('/categories')
      ]);
      setServices(servicesRes.data.services || []);
      setBookings(bookingsRes.data.bookings || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        areas: formData.areas.split(',').map(a => a.trim()).filter(Boolean)
      };

      if (editingService) {
        await API.put(`/services/${editingService._id}`, payload);
        toast.success('Service updated!');
      } else {
        await API.post('/services', payload);
        toast.success('Service created!');
      }
      
      setShowForm(false);
      setEditingService(null);
      setFormData({ title: '', description: '', category: '', price: '', priceType: 'fixed', city: '', areas: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service.');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category?._id || service.category,
      price: service.price,
      priceType: service.priceType,
      city: service.city,
      areas: service.areas?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete service.');
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      const { data } = await API.put(`/bookings/${bookingId}/status`, { status });
      toast.success(data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update.');
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => ['accepted', 'in-progress'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="dashboard-page" id="provider-dashboard">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'left' }}>
          <h1>Provider Dashboard</h1>
          <p>Welcome back, {user?.name}! {!user?.providerInfo?.isVerified && '⏳ Your account is pending verification.'}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' }}>
              <FiPackage />
            </div>
            <span className="stat-card-value">{services.length}</span>
            <span className="stat-card-label">My Services</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(233,196,106,0.15)', color: '#E9C46A' }}>
              <FiCalendar />
            </div>
            <span className="stat-card-value">{pendingBookings.length}</span>
            <span className="stat-card-label">Pending Requests</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(69,123,157,0.1)', color: '#457B9D' }}>
              <FiCheckCircle />
            </div>
            <span className="stat-card-value">{activeBookings.length}</span>
            <span className="stat-card-label">Active Jobs</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(38,70,83,0.08)', color: '#264653' }}>
              <FiDollarSign />
            </div>
            <span className="stat-card-value">{completedBookings.length}</span>
            <span className="stat-card-label">Completed</span>
          </div>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-header">
              <h3>⏳ Pending Requests ({pendingBookings.length})</h3>
            </div>
            <div className="bookings-list">
              {pendingBookings.map(booking => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card-left">
                    <div className="booking-info">
                      <h4>{booking.service?.title}</h4>
                      <p className="booking-meta-text">
                        📅 {new Date(booking.date).toLocaleDateString()} • ⏰ {booking.time} • 📍 {booking.address}, {booking.city}
                      </p>
                      <p className="booking-participants-text">👤 Customer: {booking.customer?.name} ({booking.customer?.phone || booking.customer?.email})</p>
                    </div>
                  </div>
                  <div className="booking-card-right">
                    <span className="booking-price">PKR {booking.totalPrice?.toLocaleString()}</span>
                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(booking._id, 'accepted')}>Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}>Decline</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Services */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3>My Services</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setEditingService(null); setFormData({ title: '', description: '', category: '', price: '', priceType: 'fixed', city: '', areas: '' }); }}>
              <FiPlus /> {showForm ? 'Close' : 'Add Service'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="service-form animate-fade-in-down" id="service-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-input" placeholder="e.g. Home Electrical Repair" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="form-input">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="form-input form-textarea" placeholder="Describe your service..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (PKR)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price Type</label>
                  <select name="priceType" value={formData.priceType} onChange={handleChange} className="form-input">
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select name="city" value={formData.city} onChange={handleChange} required className="form-input">
                    <option value="">Select</option>
                    <option value="Abbottabad">Abbottabad</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Areas (comma separated)</label>
                  <input type="text" name="areas" value={formData.areas} onChange={handleChange} className="form-input" placeholder="e.g. Mansehra Road, Supply, Cantt" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-md">{editingService ? 'Update Service' : 'Create Service'}</button>
            </form>
          )}

          {services.length === 0 ? (
            <div className="empty-state">
              <FiPackage size={40} />
              <h4>No Services Yet</h4>
              <p>Add your first service to start receiving bookings.</p>
            </div>
          ) : (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service._id}>
                      <td><strong>{service.title}</strong></td>
                      <td>{service.category?.icon} {service.category?.name}</td>
                      <td>{service.city}</td>
                      <td>PKR {service.price?.toLocaleString()} {service.priceType === 'hourly' ? '/hr' : ''}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(service)}><FiEdit2 /></button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(service._id)}><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
