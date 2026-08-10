'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api.js';
import ProductCard from '@/components/ProductCard.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true').then((d) => setFeatured(d.products));
    api.get('/products?newArrivals=true').then((d) => setNewArrivals(d.products.slice(0, 4)));
    api.get('/products?bestsellers=true').then((d) => setBestsellers(d.products.slice(0, 4)));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">Design studio, built in</div>
            <h1>WEAR<br />WHAT YOU<br /><span className="accent">MAKE.</span></h1>
            <p>Start from a blank tee, hoodie, or tote. Drop in your own text and graphics with our live design tool, then we cut, print, and ship it.</p>
            <div className="hero-ctas">
              <Link href="/products" className="btn btn-volt">Shop blanks</Link>
              <Link href="/products?category=unisex" className="btn btn-outline">Start designing</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><b>10+</b><span>Base pieces</span></div>
              <div className="stat"><b>24H</b><span>Print turnaround</span></div>
              <div className="stat"><b>∞</b><span>Design combos</span></div>
            </div>
          </div>
          <div>
            <img src="/img/nav_img.jpg" alt="Rack of neutral-toned clothing ready to customize" style={{ border: '2px solid var(--ink)', borderRadius: '2px' }} />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Featured</h2>
          <span className="num">01 — Picked for you</span>
        </div>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>New Arrivals</h2>
          <span className="num">02 — Just dropped</span>
        </div>
        <div className="grid">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Best Sellers</h2>
          <span className="num">03 — Most customized</span>
        </div>
        <div className="grid">
          {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
