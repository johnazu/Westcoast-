import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-toastify';

const ADDITIONAL_OPTIONS = [
  { name: 'Insurance', price: 50 },
  { name: 'GPS Navigation', price: 20 },
  { name: 'Child Seat', price: 15 }
];

const RentalBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    licenseNumber: '', licenseExpiry: '',
    pickupDate: '', returnDate: '',
    selectedOptions: []
  });

  useEffect(() => {
    vehicleService.getOne(id)
      .then(data => setVehicle(data))
      .catch(() => toast.error('Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleOption = (option) => {
    const exists = form.selectedOptions.find(o => o.name === option.name);
    if (exists) {
      setForm({ ...form, selectedOptions: form.selectedOptions.filter(o => o.name !== option.name) });
    } else {
      setForm({ ...form, selectedOptions: [...form.selectedOptions, option] });
    }
  };

  const calculateDays = () => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const diff = new Date(form.returnDate) - new Date(form.pickupDate);
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const days = calculateDays();
  const baseCost = vehicle?.rental_daily ? Number(vehicle.rental_daily) * days : 0;
  const optionsCost = form.selectedOptions.reduce((sum, o) => sum + o.price * days, 0);
  const total = baseCost + optionsCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.pickupDate || !form.returnDate) {
      toast.error('Please select pickup and return dates');
      return;
    }
    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      toast.error('Return date must be after pickup date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: id,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          driversLicense: {
            number: form.licenseNumber,
            expiryDate: form.licenseExpiry
          }
        },
        rentalDetails: {
          pickupDate: form.pickupDate,
          returnDate: form.returnDate
        },
        additionalOptions: form.selectedOptions
      };

      const booking = await bookingService.createRental(payload);
      toast.success(`Booking confirmed! Reference: ${booking.booking_reference}`);
      navigate(`/track-booking?ref=${booking.booking_reference}`);
    } catch (err) {
      toast.error(err.message || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!vehicle) return <div className="container" style={{ padding: '32px' }}>Vehicle not found.</div>;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '700px' }}>
      <h1>Book Your Rental</h1>
      <p style={{ marginBottom: '24px', color: '#6B7280' }}>
        Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
      </p>

      <form onSubmit={handleSubmit}>
        <h3 style={styles.stepTitle}>Step 1: Rental Period</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>Pickup Date</label>
            <input type="date" name="pickupDate" className="form-control" value={form.pickupDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Return Date</label>
            <input type="date" name="returnDate" className="form-control" value={form.returnDate} onChange={handleChange} required />
          </div>
        </div>
        {days > 0 && <p>Duration: {days} day(s)</p>}

        <h3 style={styles.stepTitle}>Step 2: Your Information</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>First Name</label>
            <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Driver's License Number</label>
            <input className="form-control" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>License Expiry Date</label>
            <input type="date" className="form-control" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} required />
          </div>
        </div>

        <h3 style={styles.stepTitle}>Step 3: Additional Options</h3>
        {ADDITIONAL_OPTIONS.map((opt) => (
          <label key={opt.name} style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={!!form.selectedOptions.find(o => o.name === opt.name)}
              onChange={() => toggleOption(opt)}
            />
            {opt.name} (+GHS {opt.price}/day)
          </label>
        ))}

        <div className="card" style={styles.summary}>
          <h3>Pricing Summary</h3>
          <div style={styles.summaryRow}><span>Base Rate ({days} days)</span><span>GHS {baseCost.toLocaleString()}</span></div>
          {form.selectedOptions.map(o => (
            <div key={o.name} style={styles.summaryRow}>
              <span>{o.name} ({days} days)</span><span>GHS {(o.price * days).toLocaleString()}</span>
            </div>
          ))}
          <hr style={{ margin: '12px 0' }} />
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '18px' }}>
            <span>Total</span><span>GHS {total.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: '20px' }}>
          {submitting ? 'Submitting...' : 'Complete Booking'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  stepTitle: {
    marginTop: '32px',
    marginBottom: '16px',
    fontSize: '18px'
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  summary: {
    marginTop: '24px',
    padding: '20px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  }
};

export default RentalBookingPage;
