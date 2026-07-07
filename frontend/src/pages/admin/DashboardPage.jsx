import React, { useEffect, useState } from 'react';
import { vehicleService } from '../../services/vehicleService';
import { bookingService } from '../../services/bookingService';

const DashboardPage = () => {
  const [vehicleStats, setVehicleStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([vehicleService.getStats(), bookingService.getStats()])
      .then(([vStats, bStats]) => {
        setVehicleStats(vStats);
        setBookingStats(bStats);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const cards = [
    { label: 'Total Vehicles', value: vehicleStats?.totalVehicles || 0 },
    { label: 'Available for Sale', value: vehicleStats?.availableForSale || 0 },
    { label: 'Available for Rental', value: vehicleStats?.availableForRental || 0 },
    { label: 'Vehicles Sold', value: vehicleStats?.sold || 0 },
    { label: 'Currently Rented', value: vehicleStats?.rented || 0 },
    { label: 'Total Bookings', value: bookingStats?.totalBookings || 0 },
    { label: 'Pending Bookings', value: bookingStats?.pending || 0 },
    { label: 'Active Bookings', value: bookingStats?.active || 0 }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard Overview</h1>
      <div className="grid grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card" style={styles.statCard}>
            <p style={styles.statValue}>{c.value}</p>
            <p style={styles.statLabel}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  statCard: {
    padding: '24px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1E40AF'
  },
  statLabel: {
    color: '#6B7280',
    marginTop: '8px'
  }
};

export default DashboardPage;
