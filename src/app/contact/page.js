'use client';

import { useState } from 'react';
import { api } from '@/lib/api.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container contact-layout">
      <div className="contact-info">
        <span className="tag">Contact</span>
        <h2 style={{ marginTop: 12 }}>Let&apos;s talk<br />shop.</h2>
        <p>Question about an order, a bulk request, or an idea for a design collab? Send it over — we read every message.</p>

        <div className="contact-detail">
          <span aria-hidden>✉</span>
          <div><b>Email</b>hello@spun.shop</div>
        </div>
        <div className="contact-detail">
          <span aria-hidden>☎</span>
          <div><b>Phone</b>+855 12 345 678</div>
        </div>
        <div className="contact-detail">
          <span aria-hidden>◎</span>
          <div><b>Studio</b>Phnom Penh, Cambodia</div>
        </div>
      </div>

      <div className="form-card" style={{ margin: 0, maxWidth: 'none' }}>
        {submitted ? (
          <>
            <h1>Message sent</h1>
            <p className="form-sub">Thanks for reaching out — we&apos;ll get back to you soon.</p>
            <button className="btn btn-outline" onClick={() => setSubmitted(false)}>Send another message</button>
          </>
        ) : (
          <>
            <h1>Send a message</h1>
            <p className="form-sub">Fill this out and we&apos;ll reply by email.</p>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div className="field">
                <label>Subject</label>
                <input value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="Optional" />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea rows={5} value={form.message} onChange={(e) => update('message', e.target.value)} required minLength={10} placeholder="What's up?" />
              </div>
              <button className="btn btn-volt btn-block" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
