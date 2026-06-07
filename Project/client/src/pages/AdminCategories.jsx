import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Loader from '../components/Loader';
import { FiPlus, FiEdit2, FiTrash2, FiFolderPlus, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      icon: cat.icon || '',
      description: cat.description || ''
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setFormData({ name: '', icon: '', description: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All services connected to it may be affected.')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        // Edit Category
        await API.put(`/categories/${editId}`, formData);
        toast.success('Category updated successfully!');
      } else {
        // Add Category
        await API.post('/categories', formData);
        toast.success('Category created successfully!');
      }
      handleCancel();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page" id="admin-categories-page">
      <div className="container">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className="page-header" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
          <h1>Manage Categories</h1>
          <p>Organize services by managing categories available on the marketplace</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
          
          {/* Left panel: Category Table */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Categories List</h3>
            {loading ? (
              <Loader text="Loading categories..." />
            ) : categories.length === 0 ? (
              <div className="glass" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
                <p>No categories created yet.</p>
              </div>
            ) : (
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat._id}>
                        <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cat.description || 'No description'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                              onClick={() => handleEdit(cat)}
                              id={`edit-cat-${cat._id}`}
                            >
                              <FiEdit2 size={12} /> Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', background: 'transparent' }}
                              onClick={() => handleDelete(cat._id)}
                              id={`delete-cat-${cat._id}`}
                            >
                              <FiTrash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel: Add / Edit Form */}
          <div>
            <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-light)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editId ? <><FiEdit2 /> Edit Category</> : <><FiFolderPlus /> Add New Category</>}
              </h3>

              <form onSubmit={handleSubmit} className="auth-form" id="category-form">
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Electrician"
                    required
                    className="form-input"
                    id="cat-name-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Emoji Icon</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="e.g. ⚡"
                    required
                    className="form-input"
                    id="cat-icon-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short summary of this category..."
                    rows={4}
                    className="form-input form-textarea"
                    id="cat-desc-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {editId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={handleCancel}
                      id="cancel-cat-btn"
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={submitting}
                    id="save-cat-btn"
                  >
                    <FiSave /> {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
