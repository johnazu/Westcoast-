import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-toastify';

const TestDrivePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    preferredDate: '', preferredTime: '', message: ''
  });

  useEffect(() => {
    vehicleService.getOne(id)
      .then(data => setVehicle(data))
      .catch(() => toast.error('Could not load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        testDriveDetails: {
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          message: form.message
        }
      };
      const booking = await bookingService.createTestDrive(payload);
      toast.success(`Request submitted! Reference: ${booking.booking_reference}`);
      navigate(`/track-booking?ref=${booking.booking_reference}`);
    } catch (err) {
      toast.error(err.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!vehicle) return <div className="container" style={{ padding: '32px' }}>Vehicle not found.</div>;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '600px' }}>
      <h1>Schedule a Test Drive</h1>
      <p style={{ marginBottom: '24px', color: '#6B7280' }}>
        Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
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
          <div className="form-group">
            <label>Preferred Date</label>
            <input type="date" className="form-control" name="preferredDate" value={form.preferredDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Preferred Time</label>
            <input type="time" className="form-control" name="preferredTime" value={form.preferredTime} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Message (optional)</label>
          <textarea className="form-control" name="message" value={form.message} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default TestDrivePage;
