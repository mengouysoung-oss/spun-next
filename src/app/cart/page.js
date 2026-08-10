'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext.jsx';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, loading } = useCart();
  const router = useRouter();

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h3>Your cart is empty</h3>
        <p>Time to design something.</p>
        <Link href="/products" className="btn btn-volt" style={{ marginTop: 18 }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container cart-layout">
      <div>
        <div className="section-head">
          <h2>Your Cart</h2>
          <span className="num">{items.length} items</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.design_preview || item.product.image} alt={item.product.name} />
            <div>
              <strong>{item.product.name}</strong>
              <div className="cart-item-meta">
                {item.size && `Size ${item.size}`} {item.color && `· Color`} {item.design_json && '· Custom design'}
              </div>
              <div className="qty-control" style={{ marginTop: 10 }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>–</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 10 }}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
              <button className="icon-action danger" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3 style={{ marginBottom: 18, fontSize: '1.3rem' }}>Order Summary</h3>
        <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
        <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        <button className="btn btn-volt btn-block" style={{ marginTop: 16 }} onClick={() => router.push('/checkout')}>
          Checkout
        </button>
      </div>
    </div>
  );
}
