'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';

const BLANK = { name: '', category: 'unisex', price: '', description: '', image: '/img/nav_img.jpg', sizes: 'S,M,L,XL', colors: '#141210,#F6F3EA', customizable: true, is_new: false, is_bestseller: false, stock: 100 };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/products').then((d) => setProducts(d.products)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openNew() { setForm(BLANK); setEditing('new'); }
  function openEdit(p) {
    setForm({ ...p, sizes: p.sizes.join(','), colors: p.colors.join(','), price: String(p.price) });
    setEditing(p.id);
  }
  function close() { setEditing(null); setError(''); }

  async function save(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      stock: parseInt(form.stock, 10) || 0,
    };
    try {
      if (editing === 'new') await api.post('/products', payload);
      else await api.put(`/products/${editing}`, payload);
      close();
      load();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    await api.del(`/products/${id}`);
    load();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Products</h2>
        <button className="btn btn-volt btn-sm" onClick={openNew}>Add Product</button>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>{p.is_new ? 'New ' : ''}{p.is_bestseller ? 'Best' : ''}</td>
                  <td>
                    <button className="icon-action" onClick={() => openEdit(p)}>Edit</button>
                    <button className="icon-action danger" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing === 'new' ? 'Add Product' : 'Edit Product'}</h3>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={save}>
              <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option><option value="accessories">Accessories</option>
                </select>
              </div>
              <div className="field"><label>Price ($)</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="field"><label>Sizes (comma-separated)</label><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></div>
              <div className="field"><label>Colors (comma-separated hex)</label><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></div>
              <div className="field"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="field" style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!form.customizable} onChange={(e) => setForm({ ...form, customizable: e.target.checked })} /> Customizable</label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} /> New</label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} /> Best seller</label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn btn-volt">Save</button>
                <button type="button" className="btn btn-outline" onClick={close}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
