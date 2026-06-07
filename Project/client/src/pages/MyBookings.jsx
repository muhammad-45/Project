import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiInbox } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const statusColors = {
  pending: '#E9C46A',
  accepted: '#457B9D',
  'in-progress': '#2A9D8F',
  completed: '#264653',
  cancelled: '#E76F51'
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await API.get(`/bookings/my${params}`);
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      const { data } = await API.put(`/bookings/${bookingId}/status`, { status });
      toast.success(data.message);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="dashboard-page" id="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>{user?.role === 'provider' ? 'Manage your incoming service requests' : 'Track your service bookings'}</p>
        </div>

        <div className="filter-tabs">
          {['', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {loading ? <Loader text="Loading bookings..." /> : bookings.length === 0 ? (
          <div className="empty-state">
            <FiInbox size={48} />
            <h3>No Bookings Found</h3>
            <p>{filter ? `No ${filter} bookings.` : 'You don\'t have any bookings yet.'}</p>
          </div>
        ) : (
          <div className="bookings-list stagger-children">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card animate-fade-in-up" id={`booking-${booking._id}`}>
                <div className="booking-card-left">
                  <div className="booking-status-dot" style={{ background: statusColors[booking.status] }}></div>
                  <div className="booking-info">
                    <h4>{booking.service?.title || 'Service'}</h4>
                    <div className="booking-meta">
                      <span><FiCalendar size={14} /> {new Date(booking.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span><FiClock size={14} /> {booking.time}</span>
                      <span><FiMapPin size={14} /> {booking.city}</span>
                    </div>
                    <div className="booking-participants">
                      <span><FiUser size={14} /> {user?.role === 'provider' ? `Customer: ${booking.customer?.name}` : `Provider: ${booking.provider?.name}`}</span>
                    </div>
                    {booking.address && <p className="booking-address">📍 {booking.address}</p>}
                    {booking.notes && <p className="booking-notes">📝 {booking.notes}</p>}
                  </div>
                </div>

                <div className="booking-card-right">
                  <span className="booking-price">PKR {booking.totalPrice?.toLocaleString()}</span>
                  <span className="booking-status-badge" style={{ background: `${statusColors[booking.status]}20`, color: statusColors[booking.status] }}>
                    {booking.status}
                  </span>

                  {/* Provider actions */}
                  {user?.role === 'provider' && booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(booking._id, 'accepted')}>Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}>Decline</button>
                    </div>
                  )}
                  {user?.role === 'provider' && booking.status === 'accepted' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(booking._id, 'in-progress')}>Start Work</button>
                  )}
                  {user?.role === 'provider' && booking.status === 'in-progress' && (
                    <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(booking._id, 'completed')}>Mark Complete</button>
                  )}

                  {/* Customer can cancel pending bookings */}
                  {user?.role === 'customer' && booking.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(booking._id, 'cancelled')}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
