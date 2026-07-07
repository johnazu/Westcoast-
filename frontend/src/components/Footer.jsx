import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.grid}>
        <div>
          <h4 style={styles.heading}>Contact Us</h4>
          <p style={styles.text}>📞 0553629054</p>
          <p style={styles.text}>📞 0204425572</p>
          <p style={styles.text}>📧 info@westcoastautomobile.com</p>
          <p style={styles.text}>📍 Ecowas Road 64, Agbogba Risk Road</p>
        </div>

        <div>
          <h4 style={styles.heading}>Quick Links</h4>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/vehicles" style={styles.link}>Vehicles</Link>
          <Link to="/about" style={styles.link}>About Us</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
        </div>

        <div>
          <h4 style={styles.heading}>Follow Us</h4>
          <p style={styles.text}>🌐 Facebook</p>
          <p style={styles.text}>🌐 Instagram</p>
          <p style={styles.text}>🌐 Twitter</p>
        </div>
      </div>

      <div style={styles.bottom}>
        <p>© {new Date().getFullYear()} Westcoast Automobile. All rights reserved.</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#111827',
    color: '#D1D5DB',
    marginTop: '64px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    padding: '48px 16px'
  },
  heading: {
    color: '#fff',
    marginBottom: '16px',
    fontSize: '16px'
  },
  text: {
    fontSize: '14px',
    marginBottom: '8px'
  },
  link: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px',
    color: '#D1D5DB'
  },
  bottom: {
    textAlign: 'center',
    padding: '16px',
    borderTop: '1px solid #374151',
    fontSize: '13px'
  }
};

export default Footer;
