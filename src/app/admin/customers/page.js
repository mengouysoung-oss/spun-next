'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);

  useEffect(() => { api.get('/admin/customers').then((d) => setCustomers(d.customers)); }, []);

  if (!customers) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-head"><h2>Customers</h2></div>
      <div className="admin-panel" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Lifetime Value</th><th>Joined</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td>{c.order_count}</td>
                <td>${c.lifetime_value.toFixed(2)}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
