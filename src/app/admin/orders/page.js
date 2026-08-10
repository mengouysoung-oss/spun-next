'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get('/admin/orders').then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <div className="section-head"><h2>Orders</h2></div>
      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="admin-panel" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}<br /><span className="studio-hint">{o.customer_email}</span></td>
                  <td>${o.total.toFixed(2)}</td>
                  <td>{o.payment_method}</td>
                  <td>
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="filter-chip">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
