'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', location: user.location || '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); setSaved(false); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <div>
      <div className="section-head"><h2>Profile</h2></div>
      {saved && <div className="form-success">Profile updated.</div>}
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 440 }}>
        <div className="field"><label>Name</label><input value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="field"><label>Email</label><input value={user.email} disabled /></div>
        <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        <div className="field"><label>Location</label><input value={form.location} onChange={(e) => update('location', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-volt">Save Changes</button>
          <button type="button" className="btn btn-outline" onClick={logout}>Log Out</button>
        </div>
      </form>
    </div>
  );
}
