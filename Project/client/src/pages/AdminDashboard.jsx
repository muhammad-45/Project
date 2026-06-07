import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiUsers, FiPackage, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiGrid, FiUserCheck } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load admin stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;
  if (!stats) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const bookingChartData = {
    labels: stats.monthlyBookings?.map(m => months[m._id.month - 1]) || [],
    datasets: [{
      label: 'Bookings',
      data: stats.monthlyBookings?.map(m => m.count) || [],
      backgroundColor: 'rgba(42, 157, 143, 0.7)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const statusChartData = {
    labels: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        stats.bookingStatus.pending,
        stats.bookingStatus.accepted,
        stats.bookingStatus.completed,
        stats.bookingStatus.cancelled
      ],
      backgroundColor: ['#E9C46A', '#457B9D', '#2A9D8F', '#E76F51'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="dashboard-page" id="admin-dashboard">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'left' }}>
          <h1>Admin Dashboard</h1>
          <p>Overview of your platform's performance</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' }}><FiUsers /></div>
            <span className="stat-card-value">{stats.totalUsers}</span>
            <span className="stat-card-label">Total Users</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(69,123,157,0.1)', color: '#457B9D' }}><FiUserCheck /></div>
            <span className="stat-card-value">{stats.verifiedProviders}/{stats.totalProviders}</span>
            <span className="stat-card-label">Verified Providers</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(233,196,106,0.15)', color: '#E9C46A' }}><FiPackage /></div>
            <span className="stat-card-value">{stats.totalServices}</span>
            <span className="stat-card-label">Total Services</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(38,70,83,0.08)', color: '#264653' }}><FiCalendar /></div>
            <span className="stat-card-value">{stats.totalBookings}</span>
            <span className="stat-card-label">Total Bookings</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' }}><FiDollarSign /></div>
            <span className="stat-card-value">PKR {stats.totalRevenue?.toLocaleString()}</span>
            <span className="stat-card-label">Revenue (Completed)</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(231,111,81,0.1)', color: '#E76F51' }}><FiClock /></div>
            <span className="stat-card-value">{stats.pendingProviders}</span>
            <span className="stat-card-label">Pending Verifications</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' }}><FiGrid /></div>
            <span className="stat-card-value">{stats.totalCategories}</span>
            <span className="stat-card-label">Categories</span>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(69,123,157,0.1)', color: '#457B9D' }}><FiCheckCircle /></div>
            <span className="stat-card-value">{stats.bookingStatus.completed}</span>
            <span className="stat-card-label">Completed Jobs</span>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
          <div className="chart-container">
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Monthly Bookings</h3>
            <Bar data={bookingChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </div>
          <div className="chart-container">
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Booking Status</h3>
            <Doughnut data={statusChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="stats-grid">
          <Link to="/admin/providers" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <FiUserCheck size={24} style={{ color: 'var(--color-primary-light)', marginBottom: '8px' }} />
            <span className="stat-card-label" style={{ fontWeight: 600, color: 'var(--color-text)' }}>Manage Providers →</span>
          </Link>
          <Link to="/admin/categories" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <FiGrid size={24} style={{ color: 'var(--color-primary-light)', marginBottom: '8px' }} />
            <span className="stat-card-label" style={{ fontWeight: 600, color: 'var(--color-text)' }}>Manage Categories →</span>
          </Link>
          <Link to="/admin/users" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <FiUsers size={24} style={{ color: 'var(--color-primary-light)', marginBottom: '8px' }} />
            <span className="stat-card-label" style={{ fontWeight: 600, color: 'var(--color-text)' }}>Manage Users →</span>
          </Link>
        </div>

        {/* Recent Bookings */}
        {stats.recentBookings?.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-header">
              <h3>Recent Bookings</h3>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr><th>Customer</th><th>Provider</th><th>Service</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map(b => (
                    <tr key={b._id}>
                      <td><span className="table-avatar">{b.customer?.name?.charAt(0)}</span>{b.customer?.name}</td>
                      <td>{b.provider?.name}</td>
                      <td>{b.service?.title}</td>
                      <td><span className="booking-status-badge" style={{ textTransform: 'capitalize' }}>{b.status}</span></td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
