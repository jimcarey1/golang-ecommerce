import { Link } from "react-router-dom";
import type { Product } from "../services/products.ts";

interface ProductCardProps {
  key?: string;
  item: Product;
  onBuyNow: (item: Product) => void;
}

export default function ProductCard({ item }: ProductCardProps) {
  return (
    <Link
      to={`/products/${item.ID}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={item.Images[0]}
          alt={item.ProductName}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
        />
      </div>

      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 group-hover:text-[#0064d2]">
          {item.ProductName}
        </h3>
        <p className="text-sm font-black text-gray-950">
          ${item.Price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
