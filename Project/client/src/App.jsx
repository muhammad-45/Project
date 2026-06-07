import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import MyBookings from './pages/MyBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProviders from './pages/AdminProviders';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main className="main-content" style={{ flex: '1 0 auto' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />

              {/* Protected Routes — Customer & Provider */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute roles={['customer', 'provider']}>
                  <MyBookings />
                </ProtectedRoute>
              } />

              {/* Protected Routes — Provider Only */}
              <Route path="/provider/dashboard" element={
                <ProtectedRoute roles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes — Admin Only */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/providers" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminProviders />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />

              {/* Fallback Catch-All Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
        
        {/* React Toastify Notifications */}
        <ToastContainer 
          position="bottom-right" 
          autoClose={5000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
