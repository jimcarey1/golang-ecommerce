import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import type { Product } from "../services/products.ts";
import ProductCard from "./ProductCard.tsx";
import { getParentCategories, type Category } from "../services/categories.ts";

interface MarketplaceViewProps {
  listings: Product[];
  loadingCatalog: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: number;
  setSelectedCategory: (value: number) => void;
  onBuyNow: (item: Product) => void;
}

export default function MarketplaceView({
  listings,
  loadingCatalog,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onBuyNow,
}: MarketplaceViewProps) {
  const [categories, setCategories] = useState<Category[]>([{"ID":0, "CategoryName":"All Categories"}]);
  const [categoryLoadError, setCategoryLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const parentCategories = await getParentCategories();

        if (!ignore) {
          setCategories([{ID:0, CategoryName:"All Categories"}, ...parentCategories]);
        }
      } catch {
        if (!ignore) {
          setCategoryLoadError("Unable to load categories.");
        }
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredListings = listings.filter((item) => {
    const isCategoryMatched = selectedCategory === 0 || item.CategoryID === selectedCategory;
    const isSearchQueryMatched =
      item.ProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ProductDescription.toLowerCase().includes(searchQuery.toLowerCase());

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
          {categories.map((cat) => (
            <button
              key={cat.ID}
              onClick={() => setSelectedCategory(cat.ID)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.ID
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.CategoryName}
            </button>
          ))}
        </div>
      </div>

      {categoryLoadError && (
        <p className="text-xs font-semibold text-red-600">
          {categoryLoadError}
        </p>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-xl font-black text-gray-950 font-sans tracking-tight">
          {selectedCategory === 0 ? "Trending Today" : selectedCategory}
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
          {(searchQuery || selectedCategory !== 0) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(0);
              }}
              className="mt-4 rounded-md bg-black px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
            >
              Clear Filter Constraints
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {filteredListings.map((item) => (
            <ProductCard
              key={String(item.ID)}
              item={item}
              onBuyNow={onBuyNow}
            />
          ))}
        </div>
      )}
    </div>
  );
}
