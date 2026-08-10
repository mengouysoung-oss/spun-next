'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/components/ProtectedRoute.jsx';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  return (
    <RequireAuth>
      <div className="container account-grid">
        <nav className="account-nav">
          <Link href="/account/profile" className={pathname === '/account/profile' ? 'active' : ''}>Profile</Link>
          <Link href="/account/orders" className={pathname === '/account/orders' ? 'active' : ''}>Order History</Link>
        </nav>
        <div>{children}</div>
      </div>
    </RequireAuth>
  );
}
