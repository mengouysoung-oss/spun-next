'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCart } from '@/context/CartContext.jsx';

function NavItem({ href, children, exact = false }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return <Link href={href} className={isActive ? 'active' : ''}>{children}</Link>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  function submitSearch(e) {
    e.preventDefault();
    if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="logo">SP<span>U</span>N</Link>

        <nav className="nav-links">
          <NavItem href="/" exact>Home</NavItem>
          <NavItem href="/products">Products</NavItem>
          <NavItem href="/contact">Contact</NavItem>
          <NavItem href={user ? '/account/orders' : '/login'}>{user ? 'Account' : 'Login'}</NavItem>
          {user?.role === 'admin' && <NavItem href="/admin">Admin</NavItem>}
        </nav>

        <form className="search-bar" onSubmit={submitSearch}>
          <span aria-hidden>⌕</span>
          <input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <div className="nav-icons">
          <button className="icon-btn mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">☰</button>
          <Link href="/cart" className="icon-btn" aria-label="Cart">
            🛍
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          {user ? (
            <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">⎋</button>
          ) : (
            <Link href="/login" className="icon-btn" aria-label="Account">☺</Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="nav-links" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0 24px 20px', display: 'flex' }}>
          <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/products" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>
          <Link href={user ? '/account/orders' : '/login'} onClick={() => setMobileOpen(false)}>{user ? 'Account' : 'Login'}</Link>
          {user?.role === 'admin' && <Link href="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
        </nav>
      )}
    </header>
  );
}
