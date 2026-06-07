import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiCheckCircle, FiXCircle, FiGrid, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all, verified, pending
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProviders();
  }, [tab, page]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let url = `/admin/providers?page=${page}&limit=10`;
      if (tab === 'verified') url += '&verified=true';
      if (tab === 'pending') url += '&verified=false';

      const { data } = await API.get(url);
      setProviders(data.providers || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      const { data } = await API.put(`/admin/providers/${id}/verify`, { isVerified });
      toast.success(data.message || 'Verification updated successfully!');
      fetchProviders();
    } catch (error) {
      toast.error('Failed to update verification status.');
    }
  };

  return (
    <div className="dashboard-page" id="admin-providers-page">
      <div className="container">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <h1>Manage Providers</h1>
          <p>Review provider profiles, credentials, and verify their applications</p>
        </div>

        {/* Tab Filters */}
        <div className="filter-tabs" style={{ justifyContent: 'flex-start' }}>
          <button className={`filter-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => { setTab('all'); setPage(1); }} id="tab-all-providers">All Providers</button>
          <button className={`filter-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => { setTab('pending'); setPage(1); }} id="tab-pending-providers">Pending Verification</button>
          <button className={`filter-tab ${tab === 'verified' ? 'active' : ''}`} onClick={() => { setTab('verified'); setPage(1); }} id="tab-verified-providers">Verified</button>
        </div>

        {loading ? (
          <Loader text="Loading providers list..." />
        ) : providers.length === 0 ? (
          <div className="glass" style={{ padding: 'var(--space-10)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>No providers found matching this filter.</p>
          </div>
        ) : (
          <>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Provider Name</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>Hourly Rate</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(prov => (
                    <tr key={prov._id}>
                      <td>
                        <span className="table-avatar">{prov.name?.charAt(0).toUpperCase()}</span>
                        <strong>{prov.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{prov.email}</div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {prov.providerInfo?.category?.icon} {prov.providerInfo?.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td>{prov.providerInfo?.experience || 0} years</td>
                      <td>PKR {prov.providerInfo?.hourlyRate || 0}/hr</td>
                      <td>{prov.city}</td>
                      <td>
                        {prov.providerInfo?.isVerified ? (
                          <span className="booking-status-badge" style={{ background: 'rgba(42, 157, 143, 0.15)', color: 'var(--color-primary-light)' }}>Verified</span>
                        ) : (
                          <span className="booking-status-badge" style={{ background: 'rgba(233, 196, 106, 0.15)', color: '#D4A017' }}>Pending</span>
                        )}
                      </td>
                      <td>
                        {prov.providerInfo?.isVerified ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'transparent', padding: '6px 12px' }}
                            onClick={() => handleVerify(prov._id, false)}
                            id={`revoke-${prov._id}`}
                          >
                            <FiXCircle /> Revoke
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
                            onClick={() => handleVerify(prov._id, true)}
                            id={`verify-${prov._id}`}
                          >
                            <FiCheckCircle /> Verify
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

export default AdminProviders;
