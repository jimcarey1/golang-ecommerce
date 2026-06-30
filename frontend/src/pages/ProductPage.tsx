import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { getProductById, type Product } from "../services/products";

interface ProductPageProps {
  onBuyNow: (item: Product) => void;
}

function getProductImages(product: Product | null) {
  if (!product?.Images?.length) {
    return [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=900",
    ];
  }

  return product.Images;
}

function getAttributes(product: Product | null) {
  if (!product?.Attributes) return [];

  try {
    const attributes =
      typeof product.Attributes === "string"
        ? JSON.parse(product.Attributes)
        : product.Attributes;

    if (!attributes || typeof attributes !== "object") return [];

    return Object.entries(attributes as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)] as const);
  } catch {
    return [];
  }
}

export default function ProductPage({ onBuyNow }: ProductPageProps) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const images = useMemo(() => getProductImages(product), [product]);
  const attributes = useMemo(() => getAttributes(product), [product]);
  const isOwnListing = Boolean(product && user && product.UserID === user.ID);

  useEffect(() => {
    let ignore = false;
    const id = Number(productId);

    async function loadProduct() {
      if (!id) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const productData = await getProductById(id);

        if (!ignore) {
          setProduct(productData);
          setSelectedImage(productData.Images?.[0] ?? "");
        }
      } catch {
        if (!ignore) {
          setError("We could not find this product listing.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border border-gray-200 bg-white p-10 text-center text-sm font-semibold text-gray-400 shadow-xs">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-10 text-center shadow-xs">
        <h1 className="text-lg font-bold text-gray-900">Product unavailable</h1>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const activeImage = selectedImage || images[0];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={activeImage}
              alt={product.ProductName}
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden rounded-lg border bg-gray-50 ${
                    activeImage === image
                      ? "border-[#0064d2] ring-2 ring-[#0064d2]/20"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {product.Brand || "Unbranded"}
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-950">
                  {product.ProductName}
                </h1>
              </div>

              <button
                type="button"
                className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-[#e53238]"
                aria-label="Add to watchlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-500">Price</p>
              <p className="mt-1 text-3xl font-black text-gray-950">
                ${product.Price.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-semibold text-green-700">
                Buy It Now · Razorpay secure checkout
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="font-bold text-gray-900">Condition</p>
                <p className="mt-1 text-gray-500">Seller listed</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="font-bold text-gray-900">Listing type</p>
                <p className="mt-1 capitalize text-gray-500">{product.Mode}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBuyNow(product)}
              disabled={isOwnListing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0064d2] px-5 py-3 text-sm font-black text-white shadow-xs hover:bg-[#0051ab] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOwnListing ? "Cannot buy your own listing" : "Buy It Now"}
            </button>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0064d2]/10 text-[#0064d2]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Seller #{product.UserID}
                </h2>
                <p className="text-xs text-gray-500">Marketplace seller</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Verified account listing
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0064d2]" />
                Purchase protected by checkout verification
              </p>
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                Shipping coordinated after payment
              </p>
            </div>
          </section>
        </aside>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-gray-950">About this item</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
            {product.ProductDescription}
          </p>

          {attributes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-900">
                Item specifics
              </h3>
              <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {attributes.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {key}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-gray-950">Delivery & payment</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-700">
            <div className="flex gap-3">
              <PackageCheck className="mt-0.5 h-5 w-5 text-[#86b817]" />
              <div>
                <p className="font-bold text-gray-900">Handled with care</p>
                <p className="text-xs text-gray-500">
                  Seller shares dispatch details after checkout confirmation.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[#0064d2]" />
              <div>
                <p className="font-bold text-gray-900">Secure checkout</p>
                <p className="text-xs text-gray-500">
                  Payment verification and buyer details stay inside the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
