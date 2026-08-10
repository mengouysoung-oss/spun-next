'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

export default function AdminMessages() {
  const [messages, setMessages] = useState(null);

  function load() {
    api.get('/admin/messages').then((d) => setMessages(d.messages));
  }
  useEffect(load, []);

  async function setStatus(id, status) {
    await api.put(`/admin/messages/${id}`, { status });
    load();
  }

  if (!messages) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-head"><h2>Messages</h2></div>
      {messages.length === 0 ? (
        <div className="empty-state"><h3>No messages yet</h3><p>Contact form submissions will show up here.</p></div>
      ) : messages.map((m) => (
        <div className="message-card" key={m.id}>
          <div className="message-card-head">
            <div>
              <strong>{m.subject || '(No subject)'}</strong>
              <div className="studio-hint">{m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</div>
            </div>
            <span className={`status-pill status-${m.status}`}>{m.status}</span>
          </div>
          <p style={{ margin: '10px 0' }}>{m.message}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {m.status !== 'read' && <button className="icon-action" onClick={() => setStatus(m.id, 'read')}>Mark read</button>}
            {m.status !== 'replied' && <button className="icon-action" onClick={() => setStatus(m.id, 'replied')}>Mark replied</button>}
            <a className="icon-action" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message to SPUN')}`}>Reply by email</a>
          </div>
        </div>
      ))}
    </div>
  );
}
