import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>SPUN</h4>
          <p>Blank pieces, made yours. Design your own streetwear in minutes — upload art, add text, drag it into place, and we print it.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="footer-links">
            <Link href="/products?category=men">Men</Link>
            <Link href="/products?category=women">Women</Link>
            <Link href="/products?category=unisex">Unisex</Link>
            <Link href="/products?category=accessories">Accessories</Link>
          </div>
        </div>
        <div>
          <h4>Help</h4>
          <div className="footer-links">
            <Link href="/account/orders">Track an order</Link>
            <Link href="/cart">Your cart</Link>
            <Link href="/contact">Contact us</Link>
          </div>
        </div>
        <div>
          <h4>Payments</h4>
          <div className="footer-links">
            <span>ABA QR · ACLEDA</span>
            <span>Visa · Mastercard</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} SPUN — a demo storefront built with Claude</div>
    </footer>
  );
}
