import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiUsers, FiSearch, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '', customer, provider, admin
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const fetchUsers = async (searchQuery = search) => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${page}&limit=10`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const { data } = await API.get(url);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search);
  };

  const handleRoleChange = async (userId) => {
    if (!newRole) return;
    try {
      const { data } = await API.put(`/admin/users/${userId}`, { role: newRole });
      toast.success(data.message || 'User role updated successfully!');
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role.');
    }
  };

  return (
    <div className="dashboard-page" id="admin-users-page">
      <div className="container">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <h1>Manage Users</h1>
          <p>Search users, change roles, and monitor user registrations on the platform</p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {/* Tab Filters */}
          <div className="filter-tabs" style={{ justifyContent: 'flex-start', margin: 0 }}>
            <button className={`filter-tab ${roleFilter === '' ? 'active' : ''}`} onClick={() => { setRoleFilter(''); setPage(1); }} id="filter-all-users">All Users</button>
            <button className={`filter-tab ${roleFilter === 'customer' ? 'active' : ''}`} onClick={() => { setRoleFilter('customer'); setPage(1); }} id="filter-customers">Customers</button>
            <button className={`filter-tab ${roleFilter === 'provider' ? 'active' : ''}`} onClick={() => { setRoleFilter('provider'); setPage(1); }} id="filter-providers">Providers</button>
            <button className={`filter-tab ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => { setRoleFilter('admin'); setPage(1); }} id="filter-admins">Admins</button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '400px' }} id="user-search-form">
            <input
              type="text"
              className="form-input"
              style={{ padding: '8px 12px', margin: 0 }}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="user-search-input"
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }} id="user-search-submit">
              <FiSearch /> Search
            </button>
          </form>
        </div>

        {loading ? (
          <Loader text="Loading users..." />
        ) : users.length === 0 ? (
          <div className="glass" style={{ padding: 'var(--space-10)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>No users found matching your query.</p>
          </div>
        ) : (
          <>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <span className="table-avatar">{u.name?.charAt(0).toUpperCase()}</span>
                        <strong>{u.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{u.email}</div>
                      </td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>{u.city || 'N/A'}</td>
                      <td>
                        {editingUserId === u._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="form-input"
                            style={{ margin: 0, padding: '4px 8px', fontSize: '12px', width: '120px' }}
                            id={`select-role-${u._id}`}
                          >
                            <option value="customer">Customer</option>
                            <option value="provider">Provider</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="booking-status-badge" style={{
                            textTransform: 'capitalize',
                            background: u.role === 'admin' ? 'rgba(38, 70, 83, 0.15)' : u.role === 'provider' ? 'rgba(42, 157, 143, 0.15)' : 'rgba(107, 105, 104, 0.15)',
                            color: u.role === 'admin' ? 'var(--color-primary)' : u.role === 'provider' ? 'var(--color-primary-light)' : 'var(--color-text-secondary)'
                          }}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {editingUserId === u._id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                              onClick={() => handleRoleChange(u._id)}
                              id={`save-role-${u._id}`}
                            >
                              <FiSave /> Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px 12px' }}
                              onClick={() => setEditingUserId(null)}
                              id={`cancel-role-${u._id}`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 12px' }}
                            onClick={() => { setEditingUserId(u._id); setNewRole(u.role); }}
                            id={`edit-role-${u._id}`}
                          >
                            Change Role
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-6)' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`filter-tab ${p === page ? 'active' : ''}`}
                    style={{ padding: '6px 12px', minWidth: '40px' }}
                    onClick={() => setPage(p)}
                    id={`page-${p}`}
                  >
                    {p}
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

export default AdminUsers;
