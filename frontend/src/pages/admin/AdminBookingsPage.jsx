import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'];

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.bookingType = filterType;
    bookingService.getAll(params)
      .then(data => setBookings(data))
      .catch(() => toast.error('Error loading bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterStatus, filterType]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Bookings</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <select className="form-control" style={{ width: '200px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="rental">Rental</option>
          <option value="test_drive">Test Drive</option>
          <option value="purchase_inquiry">Purchase Inquiry</option>
          <option value="trade_in">Trade-In</option>
        </select>
        <select className="form-control" style={{ width: '200px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Vehicle</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={styles.td}>{b.booking_reference}</td>
                  <td style={styles.td}>{b.booking_type.replace('_', ' ')}</td>
                  <td style={styles.td}>{b.customer_first_name} {b.customer_last_name}<br /><small>{b.customer_email}</small></td>
                  <td style={styles.td}>{b.vehicle ? `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}` : '-'}</td>
                  <td style={styles.td}>{b.total_amount ? `GHS ${Number(b.total_amount).toLocaleString()}` : '-'}</td>
                  <td style={styles.td}>
                    <select
                      className="form-control"
                      style={{ padding: '4px 8px', height: 'auto' }}
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}>{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #E5E7EB', fontSize: '13px', color: '#6B7280' },
  td: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', fontSize: '14px' }
};

export default AdminBookingsPage;
