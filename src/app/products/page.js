'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api.js';
import ProductCard from '@/components/ProductCard.jsx';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'unisex', label: 'Unisex' },
  { key: 'accessories', label: 'Accessories' },
];

function ProductsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') || 'all';
  const q = params.get('q') || '';
  const sort = params.get('sort') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category !== 'all') qs.set('category', category);
    if (q) qs.set('q', q);
    if (sort) qs.set('sort', sort);
    api.get(`/products?${qs.toString()}`).then((d) => setProducts(d.products)).finally(() => setLoading(false));
  }, [category, q, sort]);

  function pushParams(next) {
    router.push(`/products?${next.toString()}`);
  }

  function setCategory(cat) {
    const next = new URLSearchParams(params);
    if (cat === 'all') next.delete('category'); else next.set('category', cat);
    pushParams(next);
  }

  function submitSearch(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (searchInput) next.set('q', searchInput); else next.delete('q');
    pushParams(next);
  }

  return (
    <div className="container section">
      <div className="section-head">
        <h2>{q ? `Results for "${q}"` : 'All Products'}</h2>
        <span className="num">{products.length} items</span>
      </div>

      <form onSubmit={submitSearch} className="search-bar" style={{ marginBottom: 22, maxWidth: 340 }}>
        <span aria-hidden>⌕</span>
        <input placeholder="Search by product name…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </form>

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button key={c.key} className={`filter-chip ${category === c.key ? 'active' : ''}`} onClick={() => setCategory(c.key)}>
            {c.label}
          </button>
        ))}
        <select
          className="filter-chip"
          value={sort}
          onChange={(e) => { const next = new URLSearchParams(params); if (e.target.value) next.set('sort', e.target.value); else next.delete('sort'); pushParams(next); }}
          style={{ marginLeft: 'auto' }}
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <ProductsInner />
    </Suspense>
  );
}
