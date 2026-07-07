import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { toast } from 'react-toastify';

const AdminVehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    vehicleService.getAll({ limit: 100 })
      .then(res => setVehicles(res.data))
      .catch(() => toast.error('Error loading vehicles'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This cannot be undone.')) return;
    try {
      await vehicleService.remove(id);
      toast.success('Vehicle deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Error deleting vehicle');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1>Vehicles</h1>
        <Link to="/admin/vehicles/new" className="btn btn-primary">+ Add New Vehicle</Link>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Vehicle</th>
                <th style={styles.th}>VIN</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Sale Price</th>
                <th style={styles.th}>Daily Rate</th>
                <th style={styles.th}>Images</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td style={styles.td}>{v.year} {v.make} {v.model}</td>
                  <td style={styles.td}>{v.vin}</td>
                  <td style={styles.td}><span className={`badge badge-${v.status.toLowerCase()}`}>{v.status}</span></td>
                  <td style={styles.td}>{v.sale_price ? `GHS ${Number(v.sale_price).toLocaleString()}` : '-'}</td>
                  <td style={styles.td}>{v.rental_daily ? `GHS ${Number(v.rental_daily).toLocaleString()}` : '-'}</td>
                  <td style={styles.td}>{v.images?.length || 0}{v.video?.url ? ' + video' : ''}</td>
                  <td style={styles.td}>
                    <Link to={`/admin/vehicles/${v.id}/edit`} style={styles.actionLink}>Edit</Link>
                    {' | '}
                    <Link to={`/admin/vehicles/${v.id}/media`} style={styles.actionLink}>Media</Link>
                    {' | '}
                    <button style={styles.deleteBtn} onClick={() => handleDelete(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No vehicles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #E5E7EB',
    fontSize: '13px',
    color: '#6B7280'
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #F3F4F6',
    fontSize: '14px'
  },
  actionLink: {
    color: '#1E40AF',
    fontWeight: 600,
    fontSize: '13px'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer'
  }
};

export default AdminVehicleListPage;
