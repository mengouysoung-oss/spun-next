import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-badges">
          {product.is_new === 1 && <span className="tag tag-volt">New</span>}
          {product.is_bestseller === 1 && <span className="tag tag-thread">Best seller</span>}
        </div>
      </div>
      <div className="product-body">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span>${product.price.toFixed(2)}</span>
          {product.customizable === 1 && <span className="tag">Customizable</span>}
        </div>
      </div>
    </Link>
  );
}
