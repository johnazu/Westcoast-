import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const FEATURE_OPTIONS = [
  'Air Conditioning', 'Power Windows', 'ABS Brakes', 'Bluetooth',
  'Backup Camera', 'Cruise Control', 'Keyless Entry', 'Sunroof', 'Leather Seats', 'Navigation System'
];

const emptyForm = {
  make: '', model: '', year: new Date().getFullYear(), vin: '',
  mileage: '', transmission: 'Automatic', fuelType: 'Petrol',
  engineSize: '', horsepower: '',
  exteriorColor: '', interiorColor: '', seats: 5, doors: 4,
  bodyType: 'Sedan', category: 'Midsize', condition: 'Used',
  features: [], description: '',
  salePrice: '', dailyRate: '', weeklyRate: '', monthlyRate: '',
  availableForSale: true, availableForRental: false,
  status: 'Available', discount: 0, featured: false
};

const AdminVehicleFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      vehicleService.getOne(id).then(v => {
        setForm({
          make: v.make, model: v.model, year: v.year, vin: v.vin,
          mileage: v.mileage, transmission: v.transmission, fuelType: v.fuel_type,
          engineSize: v.engine_size || '', horsepower: v.horsepower || '',
          exteriorColor: v.exterior_color, interiorColor: v.interior_color,
          seats: v.seats, doors: v.doors, bodyType: v.body_type, category: v.category,
          condition: v.condition, features: v.features || [], description: v.description,
          salePrice: v.sale_price || '', dailyRate: v.rental_daily || '',
          weeklyRate: v.rental_weekly || '', monthlyRate: v.rental_monthly || '',
          availableForSale: v.available_for?.includes('sale') || false,
          availableForRental: v.available_for?.includes('rental') || false,
          status: v.status, discount: v.discount || 0, featured: v.featured || false
        });
      }).catch(() => toast.error('Error loading vehicle'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleFeature = (feature) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const availableFor = [];
    if (form.availableForSale) availableFor.push('sale');
    if (form.availableForRental) availableFor.push('rental');

    if (availableFor.length === 0) {
      toast.error('Vehicle must be available for sale, rental, or both');
      return;
    }

    const payload = {
      make: form.make, model: form.model, year: Number(form.year), vin: form.vin,
      mileage: Number(form.mileage), transmission: form.transmission, fuel_type: form.fuelType,
      engine_size: form.engineSize || null, horsepower: form.horsepower ? Number(form.horsepower) : null,
      exterior_color: form.exteriorColor, interior_color: form.interiorColor,
      seats: Number(form.seats), doors: Number(form.doors),
      body_type: form.bodyType, category: form.category, condition: form.condition,
      features: form.features, description: form.description,
      available_for: availableFor,
      sale_price: form.salePrice ? Number(form.salePrice) : null,
      rental_daily: form.dailyRate ? Number(form.dailyRate) : null,
      rental_weekly: form.weeklyRate ? Number(form.weeklyRate) : null,
      rental_monthly: form.monthlyRate ? Number(form.monthlyRate) : null,
      status: form.status,
      discount: Number(form.discount) || 0,
      featured: form.featured
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await vehicleService.update(id, payload);
        toast.success('Vehicle updated successfully');
        navigate('/admin/vehicles');
      } else {
        payload.created_by = user?.id;
        const created = await vehicleService.create(payload);
        toast.success('Vehicle created successfully. You can now upload images and video.');
        navigate(`/admin/vehicles/${created.id}/media`);
      }
    } catch (err) {
      toast.error(err.message || 'Error saving vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
        <h3 style={styles.sectionTitle}>Basic Information</h3>
        <div className="grid grid-3">
          <div className="form-group"><label>Make *</label><input className="form-control" name="make" value={form.make} onChange={handleChange} required /></div>
          <div className="form-group"><label>Model *</label><input className="form-control" name="model" value={form.model} onChange={handleChange} required /></div>
          <div className="form-group"><label>Year *</label><input type="number" className="form-control" name="year" value={form.year} onChange={handleChange} required /></div>
        </div>
        <div className="form-group"><label>VIN *</label><input className="form-control" name="vin" value={form.vin} onChange={handleChange} required /></div>

        <h3 style={styles.sectionTitle}>Specifications</h3>
        <div className="grid grid-3">
          <div className="form-group"><label>Mileage (km) *</label><input type="number" className="form-control" name="mileage" value={form.mileage} onChange={handleChange} required /></div>
          <div className="form-group">
            <label>Transmission *</label>
            <select className="form-control" name="transmission" value={form.transmission} onChange={handleChange}>
              {['Automatic', 'Manual', 'CVT', 'Semi-Automatic'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fuel Type *</label>
            <select className="form-control" name="fuelType" value={form.fuelType} onChange={handleChange}>
              {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Engine Size</label><input className="form-control" name="engineSize" value={form.engineSize} onChange={handleChange} placeholder="e.g. 2.5L" /></div>
          <div className="form-group"><label>Horsepower</label><input type="number" className="form-control" name="horsepower" value={form.horsepower} onChange={handleChange} /></div>
        </div>

        <h3 style={styles.sectionTitle}>Exterior & Interior</h3>
        <div className="grid grid-4">
          <div className="form-group"><label>Exterior Color *</label><input className="form-control" name="exteriorColor" value={form.exteriorColor} onChange={handleChange} required /></div>
          <div className="form-group"><label>Interior Color *</label><input className="form-control" name="interiorColor" value={form.interiorColor} onChange={handleChange} required /></div>
          <div className="form-group"><label>Seats *</label><input type="number" className="form-control" name="seats" value={form.seats} onChange={handleChange} required /></div>
          <div className="form-group"><label>Doors *</label><input type="number" className="form-control" name="doors" value={form.doors} onChange={handleChange} required /></div>
        </div>

        <h3 style={styles.sectionTitle}>Category</h3>
        <div className="grid grid-3">
          <div className="form-group">
            <label>Body Type *</label>
            <select className="form-control" name="bodyType" value={form.bodyType} onChange={handleChange}>
              {['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Minivan'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-control" name="category" value={form.category} onChange={handleChange}>
              {['Economy', 'Compact', 'Midsize', 'Luxury', 'Sports', 'Commercial'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Condition *</label>
            <select className="form-control" name="condition" value={form.condition} onChange={handleChange}>
              {['New', 'Used', 'Certified Pre-Owned'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>Features</h3>
        <div className="grid grid-3" style={{ marginBottom: '8px' }}>
          {FEATURE_OPTIONS.map(f => (
            <label key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggleFeature(f)} />
              {f}
            </label>
          ))}
        </div>

        <h3 style={styles.sectionTitle}>Description</h3>
        <div className="form-group">
          <textarea className="form-control" name="description" value={form.description} onChange={handleChange} maxLength={2000} required rows={4} />
        </div>

        <h3 style={styles.sectionTitle}>Pricing & Availability</h3>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" name="availableForSale" checked={form.availableForSale} onChange={handleChange} /> Available for Sale
          </label>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" name="availableForRental" checked={form.availableForRental} onChange={handleChange} /> Available for Rental
          </label>
        </div>

        {form.availableForSale && (
          <div className="form-group">
            <label>Sale Price (GHS)</label>
            <input type="number" className="form-control" name="salePrice" value={form.salePrice} onChange={handleChange} />
          </div>
        )}

        {form.availableForRental && (
          <div className="grid grid-3">
            <div className="form-group"><label>Daily Rate (GHS)</label><input type="number" className="form-control" name="dailyRate" value={form.dailyRate} onChange={handleChange} /></div>
            <div className="form-group"><label>Weekly Rate (GHS)</label><input type="number" className="form-control" name="weeklyRate" value={form.weeklyRate} onChange={handleChange} /></div>
            <div className="form-group"><label>Monthly Rate (GHS)</label><input type="number" className="form-control" name="monthlyRate" value={form.monthlyRate} onChange={handleChange} /></div>
          </div>
        )}

        <div className="grid grid-3">
          <div className="form-group"><label>Discount (%)</label><input type="number" min="0" max="100" className="form-control" name="discount" value={form.discount} onChange={handleChange} /></div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              {['Available', 'Reserved', 'Rented', 'Sold', 'Maintenance'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Feature on homepage
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/vehicles')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
          </button>
        </div>
        {!isEdit && <p style={{ marginTop: '12px', fontSize: '13px', color: '#6B7280' }}>After creating, you'll be able to upload images and a video.</p>}
      </form>
    </div>
  );
};

const styles = {
  sectionTitle: {
    marginTop: '24px',
    marginBottom: '12px',
    fontSize: '16px',
    color: '#1E40AF'
  }
};

export default AdminVehicleFormPage;
