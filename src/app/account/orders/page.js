'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api.js';

const PAYMENT_LABELS = { aba_qr: 'ABA QR', acleda: 'ACLEDA', visa: 'Visa', mastercard: 'MasterCard', cod: 'Cash on Delivery' };

function OrderHistoryInner() {
  const [orders, setOrders] = useState(null);
  const params = useSearchParams();
  const placedId = params.get('placed');

  useEffect(() => {
    api.get('/orders').then((d) => setOrders(d.orders));
  }, []);

  if (!orders) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-head"><h2>Order History</h2></div>
      {placedId && <div className="form-success">Order #{placedId} placed! We&apos;ll text you tracking updates.</div>}
      {orders.length === 0 ? (
        <div className="empty-state"><h3>No orders yet</h3><p>Your future custom pieces will show up here.</p></div>
      ) : orders.map((o) => (
        <div className="order-card" key={o.id}>
          <div className="order-card-head">
            <div>
              <strong>Order #{o.id}</strong>
              <div className="studio-hint">{new Date(o.created_at).toLocaleDateString()} · {PAYMENT_LABELS[o.payment_method]}</div>
            </div>
            <span className={`status-pill status-${o.status}`}>{o.status}</span>
          </div>
          {o.items.map((it) => (
            <div key={it.id} className="summary-row">
              <span>{it.product_name} ({it.size}) × {it.quantity}</span>
              <span>${(it.price * it.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total"><span>Total</span><span>${o.total.toFixed(2)}</span></div>
          <div className="studio-hint" style={{ marginTop: 8 }}>Tracking: {o.tracking_code} · Ships to {o.shipping_address}</div>
        </div>
      ))}
    </div>
  );
}

export default function OrderHistory() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <OrderHistoryInner />
    </Suspense>
  );
}
