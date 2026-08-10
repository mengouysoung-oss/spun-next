'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api.js';
import { useCart } from '@/context/CartContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { RequireAuth } from '@/components/ProtectedRoute.jsx';

const PAYMENT_METHODS = [
  { key: 'aba_qr', label: 'ABA QR', icon: '▦' },
  { key: 'acleda', label: 'ACLEDA', icon: '▤' },
  { key: 'visa', label: 'Visa', icon: '▮' },
  { key: 'mastercard', label: 'MasterCard', icon: '●' },
  { key: 'cod', label: 'Cash on Delivery', icon: '$' },
];

function CheckoutInner() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.location || '',
    delivery_method: 'standard',
  });
  const [paymentMethod, setPaymentMethod] = useState('aba_qr');
  const [cardNum, setCardNum] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function placeOrder(e) {
    e.preventDefault();
    setError('');
    if (!form.shipping_address || !form.shipping_phone) {
      setError('Please fill in your shipping address and phone number.');
      return;
    }
    if ((paymentMethod === 'visa' || paymentMethod === 'mastercard') && cardNum.replace(/\s/g, '').length < 12) {
      setError('Please enter a valid card number.');
      return;
    }
    setPlacing(true);
    try {
      const { order } = await api.post('/orders/checkout', { ...form, payment_method: paymentMethod });
      clear();
      router.push(`/account/orders?placed=${order.id}`);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return <div className="container empty-state"><h3>Nothing to checkout</h3><p>Your cart is empty.</p></div>;
  }

  return (
    <div className="container cart-layout">
      <form onSubmit={placeOrder}>
        <div className="section-head"><h2>Delivery</h2></div>
        <div className="field">
          <label>Full name</label>
          <input value={form.shipping_name} onChange={(e) => update('shipping_name', e.target.value)} required />
        </div>
        <div className="field">
          <label>Phone number</label>
          <input value={form.shipping_phone} onChange={(e) => update('shipping_phone', e.target.value)} required />
        </div>
        <div className="field">
          <label>Shipping address</label>
          <textarea rows={3} value={form.shipping_address} onChange={(e) => update('shipping_address', e.target.value)} required />
        </div>
        <div className="field">
          <label>Delivery method</label>
          <select value={form.delivery_method} onChange={(e) => update('delivery_method', e.target.value)}>
            <option value="standard">Standard (3–5 days)</option>
            <option value="express">Express (1–2 days)</option>
          </select>
        </div>

        <div className="section-head" style={{ marginTop: 32 }}><h2>Payment</h2></div>
        <div className="pay-options">
          {PAYMENT_METHODS.map((m) => (
            <label key={m.key} className={`pay-option ${paymentMethod === m.key ? 'active' : ''}`}>
              <input type="radio" name="payment" checked={paymentMethod === m.key} onChange={() => setPaymentMethod(m.key)} />
              <span aria-hidden>{m.icon}</span> {m.label}
            </label>
          ))}
        </div>

        {(paymentMethod === 'aba_qr' || paymentMethod === 'acleda') && (
          <div className="qr-box">
            <div className="qr-placeholder" />
            <p className="studio-hint">Scan with your {paymentMethod === 'aba_qr' ? 'ABA Mobile' : 'ACLEDA'} app to pay ${total.toFixed(2)}.</p>
          </div>
        )}
        {(paymentMethod === 'visa' || paymentMethod === 'mastercard') && (
          <div className="field">
            <label>Card number</label>
            <input placeholder="4242 4242 4242 4242" value={cardNum} onChange={(e) => setCardNum(e.target.value)} />
          </div>
        )}
        {paymentMethod === 'cod' && (
          <p className="studio-hint">You'll pay ${total.toFixed(2)} in cash when your order arrives.</p>
        )}

        {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}

        <button className="btn btn-volt btn-block" style={{ marginTop: 20 }} disabled={placing}>
          {placing ? 'Placing order…' : `Place Order — $${total.toFixed(2)}`}
        </button>
      </form>

      <div className="cart-summary">
        <h3 style={{ marginBottom: 18, fontSize: '1.3rem' }}>Order Summary</h3>
        {items.map((item) => (
          <div key={item.id} className="summary-row">
            <span>{item.product.name} × {item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return <RequireAuth><CheckoutInner /></RequireAuth>;
}
