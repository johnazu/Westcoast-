import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={styles.layout}>
      <header style={styles.topbar}>
        <span style={styles.brand}>WESTCOAST AUTOMOBILE ADMIN</span>
        <div style={styles.userArea}>
          <span>👤 {user?.firstName} ({user?.role})</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <NavLink to="/admin/dashboard" style={navStyle}>📊 Dashboard</NavLink>
          <NavLink to="/admin/vehicles" style={navStyle}>🚗 Vehicles</NavLink>
          <NavLink to="/admin/bookings" style={navStyle}>📅 Bookings</NavLink>
          <NavLink to="/admin/homepage" style={navStyle}>🏠 Homepage</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" style={navStyle}>👥 Users</NavLink>
          )}
        </aside>

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const navStyle = ({ isActive }) => ({
  display: 'block',
  padding: '12px 20px',
  color: isActive ? '#1E40AF' : '#374151',
  background: isActive ? '#EFF6FF' : 'transparent',
  fontWeight: isActive ? 700 : 500,
  borderRadius: '8px',
  marginBottom: '4px'
});

const styles = {
  layout: { minHeight: '100vh', background: '#F9FAFB' },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#111827',
    color: '#fff'
  },
  brand: { fontWeight: 700, letterSpacing: '1px' },
  userArea: { display: 'flex', alignItems: 'center', gap: '16px' },
  body: { display: 'flex' },
  sidebar: {
    width: '220px',
    padding: '20px 12px',
    background: '#fff',
    borderRight: '1px solid #E5E7EB',
    minHeight: 'calc(100vh - 64px)'
  },
  main: {
    flex: 1,
    padding: '24px'
  }
};

export default AdminLayout;
