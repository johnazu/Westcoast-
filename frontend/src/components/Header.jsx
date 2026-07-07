import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>WESTCOAST</span>
          <span style={styles.logoSub}>AUTOMOBILE</span>
        </Link>

        <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav style={{ ...styles.nav, ...(menuOpen ? styles.navOpen : {}) }}>
          <NavLink to="/" style={styles.link} end>Home</NavLink>
          <NavLink to="/vehicles" style={styles.link}>Vehicles</NavLink>
          <NavLink to="/about" style={styles.link}>About</NavLink>
          <NavLink to="/contact" style={styles.link}>Contact</NavLink>
          <NavLink to="/track-booking" style={styles.link}>Track Booking</NavLink>
          <NavLink to="/admin/login" style={styles.adminLink}>Admin Login</NavLink>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px'
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#1E40AF',
    letterSpacing: '1px'
  },
  logoSub: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '3px'
  },
  menuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '24px'
  },
  nav: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  link: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#374151',
    padding: '8px 0'
  },
  adminLink: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    background: '#1E40AF',
    padding: '8px 16px',
    borderRadius: '8px'
  },
  navOpen: {}
};

export default Header;
