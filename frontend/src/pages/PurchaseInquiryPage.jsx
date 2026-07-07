import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-toastify';

const PurchaseInquiryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    financingNeeded: false, message: '',
    tradeIn: false, tradeMake: '', tradeModel: '', tradeYear: '', tradeMileage: '', tradeCondition: 'Used'
  });

  useEffect(() => {
    vehicleService.getOne(id)
      .then(data => setVehicle(data))
      .catch(() => toast.error('Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicleId: id,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone
        },
        purchaseDetails: {
          financingNeeded: form.financingNeeded,
          message: form.message,
          tradeInVehicle: form.tradeIn ? {
            make: form.tradeMake,
            model: form.tradeModel,
            year: Number(form.tradeYear),
            mileage: Number(form.tradeMileage),
            condition: form.tradeCondition
          } : undefined
        }
      };
      const booking = await bookingService.createPurchaseInquiry(payload);
      toast.success(`Inquiry submitted! Reference: ${booking.booking_reference}`);
      navigate(`/track-booking?ref=${booking.booking_reference}`);
    } catch (err) {
      toast.error(err.message || 'Error submitting inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!vehicle) return <div className="container" style={{ padding: '32px' }}>Vehicle not found.</div>;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '600px' }}>
      <h1>Purchase Inquiry</h1>
      <p style={{ marginBottom: '24px', color: '#6B7280' }}>
        Vehicle: {vehicle.year} {vehicle.make} {vehicle.model} — GHS {Number(vehicle.sale_price).toLocaleString()}
      </p>

      <form onSubmit={handleSubmit}>
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
        </div>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <input type="checkbox" name="financingNeeded" checked={form.financingNeeded} onChange={handleChange} />
          I would like information on financing options
        </label>

        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <input type="checkbox" name="tradeIn" checked={form.tradeIn} onChange={handleChange} />
          I have a vehicle to trade in
        </label>

        {form.tradeIn && (
          <div className="grid grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label>Trade-in Make</label>
              <input className="form-control" name="tradeMake" value={form.tradeMake} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Trade-in Model</label>
              <input className="form-control" name="tradeModel" value={form.tradeModel} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Trade-in Year</label>
              <input type="number" className="form-control" name="tradeYear" value={form.tradeYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Trade-in Mileage</label>
              <input type="number" className="form-control" name="tradeMileage" value={form.tradeMileage} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Message (optional)</label>
          <textarea className="form-control" name="message" value={form.message} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default PurchaseInquiryPage;
