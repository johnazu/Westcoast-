import React from 'react';
import { Link } from 'react-router-dom';

const statusBadgeClass = {
  Available: 'badge-available',
  Reserved: 'badge-reserved',
  Rented: 'badge-rented',
  Sold: 'badge-sold',
  Maintenance: 'badge-maintenance'
};

const VehicleCard = ({ vehicle }) => {
  const image = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0].url : null;

  return (
    <Link to={`/vehicles/${vehicle.id}`} className="card" style={styles.card}>
      <div style={styles.imageWrap}>
        {image ? (
          <img src={image} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>No Image</div>
        )}
        {vehicle.featured && <span style={styles.featuredTag}>Featured</span>}
      </div>

      <div style={styles.body}>
        <h3 style={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model}</h3>

        {vehicle.available_for?.includes('sale') && vehicle.sale_price && (
          <p style={styles.price}>GHS {Number(vehicle.sale_price).toLocaleString()}</p>
        )}
        {vehicle.available_for?.includes('rental') && vehicle.rental_daily && (
          <p style={styles.rentalPrice}>GHS {Number(vehicle.rental_daily).toLocaleString()}/day rental</p>
        )}

        <div style={styles.metaRow}>
          <span>⚙️ {vehicle.transmission}</span>
          <span>⛽ {vehicle.fuel_type}</span>
        </div>

        <span className={`badge ${statusBadgeClass[vehicle.status] || ''}`}>{vehicle.status}</span>
      </div>
    </Link>
  );
};

const styles = {
  card: { display: 'block', overflow: 'hidden', cursor: 'pointer' },
  imageWrap: { position: 'relative', height: '200px', background: '#F3F4F6' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' },
  featuredTag: { position: 'absolute', top: '12px', left: '12px', background: '#F59E0B', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px' },
  body: { padding: '16px' },
  title: { fontSize: '18px', marginBottom: '8px' },
  price: { fontSize: '20px', fontWeight: 700, color: '#1E40AF' },
  rentalPrice: { fontSize: '14px', color: '#374151', marginBottom: '8px' },
  metaRow: { display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280', margin: '8px 0' }
};

export default VehicleCard;
