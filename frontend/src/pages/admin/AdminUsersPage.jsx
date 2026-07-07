import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'staff' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    authService.getUsers()
      .then(data => setUsers(data))
      .catch(() => toast.error('Error loading users'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.registerStaff(form);
      toast.success('Staff account created');
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'staff' });
      load();
    } catch (err) {
      toast.error(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user\'s admin access? (Their login will remain but lose all staff permissions.)')) return;
    try {
      await authService.deleteUser(id);
      toast.success('User access removed');
      load();
    } catch (err) {
      toast.error(err.message || 'Error removing user');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Users</h1>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add Staff Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <div className="form-group"><label>First Name</label><input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
            <div className="form-group"><label>Last Name</label><input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required /></div>
            <div className="form-group"><label>Phone</label><input className="form-control" name="phone" value={form.phone} onChange={handleChange} required /></div>
            <div className="form-group"><label>Password</label><input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required minLength={6} /></div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Active</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.first_name} {u.last_name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>{u.is_active ? 'Yes' : 'No'}</td>
                  <td style={styles.td}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                  <td style={styles.td}>
                    {u.id !== currentUser?.id && (
                      <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
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
  td: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', fontSize: '14px' },
  deleteBtn: { background: 'none', border: 'none', color: '#EF4444', fontWeight: 600, cursor: 'pointer' }
};

export default AdminUsersPage;
