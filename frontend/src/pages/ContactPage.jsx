import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // No dedicated contact endpoint in the API; this is a simple client-side confirmation.
    toast.success('Thank you! We will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container" style={{ padding: '48px 16px', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '24px' }}>Contact Us</h1>

      <div style={{ marginBottom: '32px' }}>
        <p>📞 0553629054</p>
        <p>📞 0204425572</p>
        <p>📧 info@westcoastautomobile.com</p>
        <p>📍 Ecowas Road 64, Agbogba Risk Road</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea className="form-control" name="message" value={form.message} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Send Message</button>
      </form>
    </div>
  );
};

export default ContactPage;
