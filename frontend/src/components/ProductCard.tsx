import { User, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Item } from "../types.ts";
import { useAuthContext } from "../context/AuthContext.tsx";

interface ProductCardProps {
  key?: string;
  item: Item;
  onBuyNow: (item: Item) => void;
}

export default function ProductCard({ item, onBuyNow }: ProductCardProps) {
  const { user } = useAuthContext()
  const isOwnListing = user && item.sellerId === Number(user.ID);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
      
      {/* Product Image Stage */}
      <Link
        to={`/products/${item.id}`}
        className="relative aspect-square w-full overflow-hidden bg-gray-100"
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Category Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-xs">
          {item.category}
        </span>
        
        {/* Status indicator overlay */}
        {item.status !== "active" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded-md border-2 border-white px-4 py-2 text-sm font-black uppercase tracking-widest text-white transform -rotate-12">
              {item.status === "sold" ? "SOLD OUT" : "COMPLETED"}
            </span>
          </div>
        )}
      </Link>

      {/* Item metadata description */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <Link
            to={`/products/${item.id}`}
            className="line-clamp-2 min-h-[40px] text-sm font-semibold tracking-tight text-gray-900 group-hover:text-[#0064d2]"
          >
            {item.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {item.description}
          </p>
        </div>

        {/* Pricing tag & Seller credit */}
        <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-gray-950">${item.price.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">
              Razorpay Only
            </span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-gray-400" />
              <span className="truncate max-w-[120px]">{item.sellerName}</span>
            </div>
            {isOwnListing && (
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-xs">Your Item</span>
            )}
          </div>
        </div>

        {/* Dynamic CTA choice mapping */}
        <div className="mt-4">
          {item.status === "active" ? (
            isOwnListing ? (
              <button
                disabled
                className="w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
              >
                Cannot Purchase Self-Listings
              </button>
            ) : (
              <button
                onClick={() => onBuyNow(item)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0064d2] py-2.5 text-xs font-bold text-white hover:bg-[#0051ab] active:bg-[#00428a] transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Buy It Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )
          ) : (
            <button
              disabled
              className="w-full rounded-lg bg-gray-100 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
            >
              Listing Closed
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
