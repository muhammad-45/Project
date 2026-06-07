import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiCalendar, FiSettings } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, isAdmin, isProvider, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand" id="nav-brand">
          <img src="/logo.svg" alt="ServeNear" className="navbar-logo" />
        </Link>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</Link>
          
          {!isAuthenticated ? (
            <div className="nav-auth">
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <div className="nav-user" onMouseLeave={() => setShowDropdown(false)}>
              <button 
                className="nav-user-btn" 
                onClick={() => setShowDropdown(!showDropdown)}
                id="nav-user-menu"
              >
                <div className="nav-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">{user?.name}</span>
              </button>

              {showDropdown && (
                <div className="nav-dropdown animate-fade-in">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user?.name}</span>
                    <span className="dropdown-role">{user?.role}</span>
                  </div>
                  <div className="dropdown-divider" />
                  
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FiUser /> Profile
                  </Link>
                  
                  {isCustomerOrProvider(user?.role) && (
                    <Link to="/bookings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FiCalendar /> My Bookings
                    </Link>
                  )}

                  {isProvider && (
                    <Link to="/provider/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FiGrid /> Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FiSettings /> Admin Panel
                    </Link>
                  )}

                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)} id="nav-toggle">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

const isCustomerOrProvider = (role) => role === 'customer' || role === 'provider';

export default Navbar;
