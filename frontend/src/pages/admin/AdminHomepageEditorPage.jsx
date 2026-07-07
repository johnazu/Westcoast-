import React, { useEffect, useRef, useState } from 'react';
import { homepageService } from '../../services/homepageService';
import { toast } from 'react-toastify';

const AdminHomepageEditorPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef();

  const [testimonialForm, setTestimonialForm] = useState({ name: '', rating: 5, comment: '' });

  const load = () => {
    setLoading(true);
    homepageService.get()
      .then(data => setContent(data))
      .catch(() => toast.error('Error loading homepage content'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleHeroChange = (field, value) => {
    setContent({ ...content, hero: { ...content.hero, [field]: value } });
  };

  const handleAboutChange = (field, value) => {
    setContent({ ...content, about: { ...content.about, [field]: value } });
  };

  const handleContactChange = (field, value) => {
    setContent({ ...content, contact: { ...content.contact, [field]: value } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await homepageService.update({
        hero: content.hero,
        about: content.about,
        contact: content.contact,
        services: content.services,
        featured_vehicles: content.featured_vehicles
      });
      setContent(data);
      toast.success('Homepage updated successfully');
    } catch (err) {
      toast.error(err.message || 'Error updating homepage');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const data = await homepageService.uploadHeroImage(file);
      setContent(data);
      toast.success('Hero image updated');
    } catch (err) {
      toast.error(err.message || 'Error uploading image');
    } finally {
      setUploadingHero(false);
      if (heroInputRef.current) heroInputRef.current.value = '';
    }
  };

  const handleAddTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.comment) {
      toast.error('Please provide a name and comment');
      return;
    }
    try {
      const data = await homepageService.addTestimonial(testimonialForm);
      setContent(data);
      setTestimonialForm({ name: '', rating: 5, comment: '' });
      toast.success('Testimonial added');
    } catch (err) {
      toast.error(err.message || 'Error adding testimonial');
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      const data = await homepageService.deleteTestimonial(testimonialId);
      setContent(data);
      toast.success('Testimonial removed');
    } catch (err) {
      toast.error(err.message || 'Error removing testimonial');
    }
  };

  if (loading || !content) return <div className="spinner" />;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Homepage Editor</h1>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={styles.sectionTitle}>Hero Section</h3>
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" value={content.hero.title || ''} onChange={(e) => handleHeroChange('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input className="form-control" value={content.hero.subtitle || ''} onChange={(e) => handleHeroChange('subtitle', e.target.value)} />
        </div>

        {content.hero.backgroundImage?.url && (
          <img src={content.hero.backgroundImage.url} alt="Hero" style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '12px' }} />
        )}
        <div>
          <input type="file" accept="image/*" ref={heroInputRef} onChange={handleHeroImageUpload} disabled={uploadingHero} />
          {uploadingHero && <p>Uploading...</p>}
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={styles.sectionTitle}>About Section</h3>
        <div className="form-group">
          <label>Title</label>
          <input className="form-control" value={content.about.title || ''} onChange={(e) => handleAboutChange('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea className="form-control" rows={4} value={content.about.content || ''} onChange={(e) => handleAboutChange('content', e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={styles.sectionTitle}>Contact Information</h3>
        <div className="grid grid-2">
          <div className="form-group">
            <label>Phone 1</label>
            <input className="form-control" value={content.contact.phone?.[0] || ''} onChange={(e) => {
              const phones = [...(content.contact.phone || [])];
              phones[0] = e.target.value;
              handleContactChange('phone', phones);
            }} />
          </div>
          <div className="form-group">
            <label>Phone 2</label>
            <input className="form-control" value={content.contact.phone?.[1] || ''} onChange={(e) => {
              const phones = [...(content.contact.phone || [])];
              phones[1] = e.target.value;
              handleContactChange('phone', phones);
            }} />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-control" value={content.contact.email || ''} onChange={(e) => handleContactChange('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input className="form-control" value={content.contact.address || ''} onChange={(e) => handleContactChange('address', e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <div className="card" style={{ padding: '24px', marginTop: '32px' }}>
        <h3 style={styles.sectionTitle}>Testimonials</h3>

        {(content.testimonials?.items || []).map((t) => (
          <div key={t.id} style={styles.testimonialRow}>
            <div>
              <strong>{t.name}</strong> ({t.rating}★)<br />
              <span style={{ color: '#6B7280' }}>{t.comment}</span>
            </div>
            <button className="btn btn-danger" onClick={() => handleDeleteTestimonial(t.id)}>Remove</button>
          </div>
        ))}

        <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Add New Testimonial</h4>
        <div className="grid grid-3">
          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <select className="form-control" value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Comment</label>
          <textarea className="form-control" value={testimonialForm.comment} onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })} />
        </div>
        <button className="btn btn-secondary" onClick={handleAddTestimonial}>Add Testimonial</button>
      </div>
    </div>
  );
};

const styles = {
  sectionTitle: { marginBottom: '16px', color: '#1E40AF' },
  testimonialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6'
  }
};

export default AdminHomepageEditorPage;
