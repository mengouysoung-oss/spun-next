'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/admin/dashboard').then(setData); }, []);

  if (!data) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-head"><h2>Dashboard</h2></div>

      <div className="stat-grid">
        <div className="stat-card"><b>${data.totalRevenue.toFixed(2)}</b><span>Revenue</span></div>
        <div className="stat-card"><b>{data.totalOrders}</b><span>Orders</span></div>
        <div className="stat-card"><b>{data.totalCustomers}</b><span>Customers</span></div>
        <div className="stat-card"><b>{data.totalProducts}</b><span>Products</span></div>
      </div>

      {data.newMessages > 0 && (
        <div className="admin-panel" style={{ borderColor: 'var(--grape)', background: 'rgba(91,60,196,0.06)' }}>
          <strong>{data.newMessages} new contact message{data.newMessages === 1 ? '' : 's'}</strong> waiting in the Messages tab.
        </div>
      )}

      <div className="admin-panel">
        <h3 style={{ marginBottom: 14, fontSize: '1.2rem' }}>Recent Orders</h3>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}</td>
                <td>${o.total.toFixed(2)}</td>
                <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h3 style={{ marginBottom: 14, fontSize: '1.2rem' }}>Top Products</h3>
        <table>
          <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.product_name}>
                <td>{p.product_name}</td>
                <td>{p.units_sold}</td>
                <td>${p.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
