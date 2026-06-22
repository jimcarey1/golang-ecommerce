import { Info, Search, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "../constants/categories.ts";
import type { Item, User } from "../types.ts";
import ProductCard from "./ProductCard.tsx";

interface MarketplaceViewProps {
  listings: Item[];
  loadingCatalog: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  currentUser: User | null;
  onBuyNow: (item: Item) => void;
}

export default function MarketplaceView({
  listings,
  loadingCatalog,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  currentUser,
  onBuyNow,
}: MarketplaceViewProps) {
  const filteredListings = listings.filter((item) => {
    const isCategoryMatched = selectedCategory === "All Categories" || item.category === selectedCategory;
    const isSearchQueryMatched =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return isCategoryMatched && isSearchQueryMatched;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute top-2.5 left-3 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search eBay listings (e.g. vintage, watch, headphones)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50/50 py-2 pl-10 pr-4 text-xs font-medium text-gray-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none pr-1 justify-start md:justify-end">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-xl font-black text-gray-950 font-sans tracking-tight">
          {selectedCategory === "All Categories" ? "Trending Today" : selectedCategory}
        </h2>
        <span className="text-xs text-gray-500 font-bold bg-white px-2.5 py-1 rounded-md border border-gray-150">
          {filteredListings.length} items catalogued
        </span>
      </div>

      {loadingCatalog ? (
        <div className="py-24 text-center text-sm font-semibold text-gray-400 animate-pulse">
          Inventory loading...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-24 text-center rounded-xl bg-white border border-gray-200 shadow-xs max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No matching search entries</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto px-4">
            We couldn't match items matching choice "{searchQuery || selectedCategory}". Try tweaking your filter queries or list an item yourself.
          </p>
          {(searchQuery || selectedCategory !== "All Categories") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="mt-4 rounded-md bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
            >
              Clear Filter Constraints
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl border border-blue-150 bg-blue-50/20 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-sans shadow-2xs">
        <div className="flex items-start gap-2.5">
          <Info className="h-5 w-5 text-[#0064d2] shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-950 leading-normal max-w-xl">
            <strong>EBay Clone Fullstack Guide:</strong> Create account profiles using traditional email/password settings. Fill out addresses and mock billing profiles, buy items, track active shipment states on your seller dashboard, and trigger automated emails!
          </p>
        </div>
      </div>
    </div>
  );
}
