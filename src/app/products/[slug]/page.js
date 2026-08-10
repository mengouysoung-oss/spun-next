'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api.js';
import { useCart } from '@/context/CartContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import DesignCanvas from '@/components/DesignCanvas.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [showStudio, setShowStudio] = useState(false);
  const [design, setDesign] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setProduct(null);
    api.get(`/products/slug/${slug}`).then((d) => {
      setProduct(d.product);
      setSize(d.product.sizes[0]);
      setColor(d.product.colors[0]);
    });
  }, [slug]);

  if (!product) return <div className="loading"><div className="spinner" /></div>;

  async function handleAdd(buyNow) {
    if (!user) { router.push('/login'); return; }
    setAdding(true);
    setMessage('');
    try {
      await addItem({
        product_id: product.id,
        size, color, quantity: qty,
        design_json: design?.layers?.length ? design.layers : null,
        design_preview: design?.layers?.length ? design.preview : null,
      });
      if (buyNow) router.push('/cart');
      else setMessage('Added to cart.');
    } catch (e) {
      setMessage(e.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container">
      <div className="pd-layout">
        <div className="pd-gallery">
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="pd-info">
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="pd-price">${product.price.toFixed(2)}</div>
          <p className="pd-desc">{product.description}</p>

          <div className="option-group">
            <label className="option-label">Size</label>
            <div className="size-options">
              {product.sizes.map((s) => (
                <button key={s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">Color</label>
            <div className="color-options">
              {product.colors.map((c) => (
                <button key={c} className={`color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">Quantity</label>
            <div className="qty-row">
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>–</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>
          </div>

          {product.customizable === 1 && (
            <div className="studio-toggle">
              <div>
                <strong>Make it yours</strong>
                <div className="studio-hint">Add your own text or upload a graphic to print on this piece.</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setShowStudio((v) => !v)}>
                {showStudio ? 'Hide design studio' : 'Open design studio'}
              </button>
            </div>
          )}

          {showStudio && <DesignCanvas baseColor={color} onChange={setDesign} />}

          {message && <p className="studio-hint" style={{ marginBottom: 10 }}>{message}</p>}

          <div className="pd-actions">
            <button className="btn btn-outline" onClick={() => handleAdd(false)} disabled={adding}>Add to Cart</button>
            <button className="btn btn-volt" onClick={() => handleAdd(true)} disabled={adding}>Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
