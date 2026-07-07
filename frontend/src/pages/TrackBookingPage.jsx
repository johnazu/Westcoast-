import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-toastify';

const TrackBookingPage = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (ref) => {
    if (!ref) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await bookingService.getByReference(ref);
      setBooking(data);
    } catch (err) {
      setBooking(null);
      toast.error('Booking not found with this reference');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('ref')) {
      search(searchParams.get('ref'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    search(reference);
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '600px' }}>
      <h1>Track Your Booking</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <input
          className="form-control"
          placeholder="Enter your booking reference (e.g. RNT-260706-0001)"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {loading && <div className="spinner" />}

      {!loading && searched && !booking && (
        <p style={{ marginTop: '24px' }}>No booking found with that reference.</p>
      )}

      {booking && (
        <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
          <h3>Booking Reference: {booking.booking_reference}</h3>
          <p><strong>Type:</strong> {booking.booking_type.replace('_', ' ')}</p>
          <p><strong>Status:</strong> <span className="badge badge-available">{booking.status}</span></p>
          {booking.vehicle_make && (
            <p><strong>Vehicle:</strong> {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}</p>
          )}
          {booking.pickup_date && (
            <>
              <p><strong>Pickup:</strong> {new Date(booking.pickup_date).toLocaleDateString()}</p>
              <p><strong>Return:</strong> {new Date(booking.return_date).toLocaleDateString()}</p>
            </>
          )}
          {booking.total_amount > 0 && (
            <p><strong>Total:</strong> GHS {Number(booking.total_amount).toLocaleString()}</p>
          )}
          <p><strong>Submitted:</strong> {new Date(booking.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default TrackBookingPage;
