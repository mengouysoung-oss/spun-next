'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAdmin } from '@/components/ProtectedRoute.jsx';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isActive = (href) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <RequireAdmin>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link href="/admin" className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
          <Link href="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>Products</Link>
          <Link href="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>Orders</Link>
          <Link href="/admin/customers" className={isActive('/admin/customers') ? 'active' : ''}>Customers</Link>
          <Link href="/admin/messages" className={isActive('/admin/messages') ? 'active' : ''}>Messages</Link>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </RequireAdmin>
  );
}
