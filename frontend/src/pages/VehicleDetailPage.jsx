import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState({ type: 'image', index: 0 });
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getOne(id);
        setVehicle(data);
      } catch (err) {
        console.error('Error loading vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!vehicle) return <div className="container" style={{ padding: '32px' }}>Vehicle not found.</div>;

  const images = vehicle.images || [];
  const hasVideo = !!vehicle.video?.url;

  const mediaSrc = activeMedia.type === 'video'
    ? vehicle.video?.url
    : (images[activeMedia.index]?.url);

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '24px' }}>{vehicle.year} {vehicle.make} {vehicle.model}</h1>

      <div style={styles.topGrid}>
        {/* MEDIA GALLERY */}
        <div>
          <div style={styles.mainMedia}>
            {activeMedia.type === 'video' ? (
              <video src={mediaSrc} controls style={{ width: '100%', borderRadius: '12px' }} />
            ) : mediaSrc ? (
              <img src={mediaSrc} alt="Vehicle" style={{ width: '100%', borderRadius: '12px' }} />
            ) : (
              <div style={styles.noMedia}>No media available</div>
            )}
          </div>

          <div style={styles.thumbRow}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`thumb-${idx}`}
                style={{
                  ...styles.thumb,
                  border: activeMedia.type === 'image' && activeMedia.index === idx ? '3px solid #1E40AF' : '1px solid #E5E7EB'
                }}
                onClick={() => setActiveMedia({ type: 'image', index: idx })}
              />
            ))}
            {hasVideo && (
              <div
                style={{
                  ...styles.thumb,
                  ...styles.videoThumb,
                  border: activeMedia.type === 'video' ? '3px solid #1E40AF' : '1px solid #E5E7EB'
                }}
                onClick={() => setActiveMedia({ type: 'video' })}
              >
                ▶ Video
              </div>
            )}
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="card" style={styles.infoPanel}>
          {vehicle.available_for?.includes('sale') && vehicle.sale_price && (
            <p style={styles.price}>GHS {Number(vehicle.sale_price).toLocaleString()}</p>
          )}
          <span className={`badge badge-${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vehicle.available_for?.includes('rental') && vehicle.status === 'Available' && (
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/book-rental/${vehicle.id}`)}
              >
                Book for Rental
              </button>
            )}
            <button
              className="btn btn-secondary btn-block"
              onClick={() => navigate(`/test-drive/${vehicle.id}`)}
            >
              Schedule Test Drive
            </button>
            {vehicle.available_for?.includes('sale') && (
              <button
                className="btn btn-secondary btn-block"
                onClick={() => navigate(`/purchase-inquiry/${vehicle.id}`)}
              >
                Make Purchase Inquiry
              </button>
            )}
          </div>

          <div style={{ marginTop: '24px', fontSize: '14px' }}>
            <p>📞 0553629054</p>
            <p>📞 0204425572</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabBar}>
        {['overview', 'features', 'rental'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }}
          >
            {t === 'overview' ? 'Overview' : t === 'features' ? 'Features' : 'Rental Info'}
          </button>
        ))}
      </div>

      <div style={styles.tabContent}>
        {tab === 'overview' && (
          <div>
            <div className="grid grid-2">
              <p><strong>Make:</strong> {vehicle.make}</p>
              <p><strong>Model:</strong> {vehicle.model}</p>
              <p><strong>Year:</strong> {vehicle.year}</p>
              <p><strong>VIN:</strong> {vehicle.vin}</p>
              <p><strong>Mileage:</strong> {vehicle.mileage?.toLocaleString()} km</p>
              <p><strong>Body Type:</strong> {vehicle.body_type}</p>
              <p><strong>Transmission:</strong> {vehicle.transmission}</p>
              <p><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
              <p><strong>Exterior:</strong> {vehicle.exterior_color}</p>
              <p><strong>Seats:</strong> {vehicle.seats}</p>
              <p><strong>Interior:</strong> {vehicle.interior_color}</p>
              <p><strong>Doors:</strong> {vehicle.doors}</p>
            </div>
            <p style={{ marginTop: '20px' }}><strong>Description:</strong></p>
            <p>{vehicle.description}</p>
          </div>
        )}

        {tab === 'features' && (
          <div className="grid grid-3">
            {(vehicle.features || []).map((f, idx) => (
              <p key={idx}>✓ {f}</p>
            ))}
            {(!vehicle.features || vehicle.features.length === 0) && <p>No features listed.</p>}
          </div>
        )}

        {tab === 'rental' && (
          <div>
            {vehicle.rental_daily ? (
              <>
                <p><strong>Daily Rate:</strong> GHS {Number(vehicle.rental_daily).toLocaleString()}</p>
                {vehicle.rental_weekly && <p><strong>Weekly Rate:</strong> GHS {Number(vehicle.rental_weekly).toLocaleString()}</p>}
                {vehicle.rental_monthly && <p><strong>Monthly Rate:</strong> GHS {Number(vehicle.rental_monthly).toLocaleString()}</p>}
              </>
            ) : (
              <p>This vehicle is not currently available for rental.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '32px'
  },
  mainMedia: {
    background: '#F3F4F6',
    borderRadius: '12px',
    minHeight: '360px',
    display: 'flex',
    alignItems: 'center'
  },
  noMedia: {
    width: '100%',
    textAlign: 'center',
    padding: '120px 0',
    color: '#9CA3AF'
  },
  thumbRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  thumb: {
    width: '70px',
    height: '55px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  videoThumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111827',
    color: '#fff',
    fontSize: '11px',
    cursor: 'pointer'
  },
  infoPanel: {
    padding: '24px',
    height: 'fit-content'
  },
  price: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1E40AF',
    marginBottom: '8px'
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    marginTop: '40px',
    borderBottom: '1px solid #E5E7EB'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#6B7280',
    borderBottom: '2px solid transparent'
  },
  tabBtnActive: {
    color: '#1E40AF',
    borderBottom: '2px solid #1E40AF'
  },
  tabContent: {
    padding: '24px 0'
  }
};

export default VehicleDetailPage;
