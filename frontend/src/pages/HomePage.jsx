import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { homepageService } from '../services/homepageService';
import VehicleCard from '../components/VehicleCard';

const HomePage = () => {
  const [content, setContent] = useState(null);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [contentData, vehiclesRes] = await Promise.all([
          homepageService.get(),
          vehicleService.getAll({ featured: true, limit: 6 })
        ]);
        setContent(contentData);
        setFeaturedVehicles(vehiclesRes.data);
      } catch (err) {
        console.error('Error loading homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="spinner" />;

  const hero = content?.hero || {};
  const services = content?.services;
  const about = content?.about;
  const testimonials = content?.testimonials;

  return (
    <div>
      {/* HERO */}
      <section
        style={{
          ...styles.hero,
          backgroundImage: hero.backgroundImage?.url
            ? `linear-gradient(rgba(17,24,39,0.6), rgba(17,24,39,0.6)), url(${hero.backgroundImage.url})`
            : 'linear-gradient(135deg, #1E40AF, #1E3A8A)'
        }}
      >
        <div className="container">
          <h1 style={styles.heroTitle}>{hero.title || 'Welcome to Westcoast Automobile'}</h1>
          <p style={styles.heroSubtitle}>{hero.subtitle || 'Your Premier Car Dealership & Rental Agency'}</p>
          <div style={styles.heroButtons}>
            <Link to="/vehicles" className="btn btn-primary">Browse Vehicles</Link>
            <Link to="/vehicles?availableFor=rental" className="btn btn-secondary" style={{ background: '#fff' }}>
              Book a Rental
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      {featuredVehicles.length > 0 && (
        <section className="container" style={styles.section}>
          <h2 style={styles.sectionTitle}>{content?.featured_vehicles?.title || 'Featured Vehicles'}</h2>
          <div className="grid grid-3" style={{ marginTop: '24px' }}>
            {featuredVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/vehicles" className="btn btn-secondary">View All Vehicles →</Link>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {services?.enabled !== false && (
        <section style={{ background: '#F3F4F6', padding: '64px 0' }}>
          <div className="container">
            <h2 style={styles.sectionTitle}>{services?.title || 'Our Services'}</h2>
            <div className="grid grid-3" style={{ marginTop: '24px' }}>
              <div className="card" style={styles.serviceCard}>
                <div style={styles.serviceIcon}>🚗</div>
                <h3>Vehicle Sales</h3>
                <p>Wide selection of quality vehicles for every budget and need.</p>
              </div>
              <div className="card" style={styles.serviceCard}>
                <div style={styles.serviceIcon}>🔑</div>
                <h3>Vehicle Rentals</h3>
                <p>Flexible daily, weekly, and monthly rental periods.</p>
              </div>
              <div className="card" style={styles.serviceCard}>
                <div style={styles.serviceIcon}>🛠️</div>
                <h3>Quality Service</h3>
                <p>All vehicles thoroughly inspected and serviced.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {about?.enabled !== false && (
        <section className="container" style={styles.section}>
          <h2 style={styles.sectionTitle}>{about?.title || 'About Westcoast Automobile'}</h2>
          <p style={styles.aboutText}>
            {about?.content || 'At Westcoast Automobile, we provide quality vehicles for sale and rental, backed by exceptional customer service.'}
          </p>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials?.enabled !== false && testimonials?.items?.length > 0 && (
        <section style={{ background: '#F3F4F6', padding: '64px 0' }}>
          <div className="container">
            <h2 style={styles.sectionTitle}>{testimonials?.title || 'What Our Customers Say'}</h2>
            <div className="grid grid-2" style={{ marginTop: '24px' }}>
              {testimonials.items.map((t, idx) => (
                <div key={idx} className="card" style={{ padding: '24px' }}>
                  <div>{'⭐'.repeat(t.rating || 5)}</div>
                  <p style={{ margin: '12px 0' }}>"{t.comment}"</p>
                  <p style={{ fontWeight: 600 }}>- {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const styles = {
  hero: {
    padding: '120px 0',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    textAlign: 'center'
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: 800,
    marginBottom: '16px'
  },
  heroSubtitle: {
    fontSize: '18px',
    marginBottom: '32px',
    opacity: 0.9
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  section: {
    padding: '64px 16px'
  },
  sectionTitle: {
    fontSize: '30px',
    fontWeight: 700,
    textAlign: 'center'
  },
  serviceCard: {
    padding: '32px 24px',
    textAlign: 'center'
  },
  serviceIcon: {
    fontSize: '40px',
    marginBottom: '16px'
  },
  aboutText: {
    maxWidth: '720px',
    margin: '24px auto 0',
    textAlign: 'center',
    fontSize: '16px',
    lineHeight: 1.7
  }
};

export default HomePage;
