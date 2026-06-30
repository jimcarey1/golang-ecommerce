import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
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
      <div className="mx-auto -mt-4 max-w-6xl p-10 text-center text-sm font-semibold text-gray-400">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto -mt-4 max-w-2xl p-10 text-center">
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
    <div className="mx-auto -mt-4 max-w-6xl space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      <div className="grid grid-cols-1 gap-1 lg:grid-cols-[minmax(0,620px)_minmax(320px,1fr)]">
        <section className="p-4">
          <div className="flex gap-4">
            {images.length > 1 && (
              <div className="flex w-20 shrink-0 flex-col gap-2">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border bg-gray-50 ${
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

            <div className="flex h-[420px] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-gray-300">
              <img
                src={activeImage}
                alt={product.ProductName}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        <aside className="p-6">
            <h1 className="text-2xl font-bold leading-tight text-gray-950">
              {product.ProductName}
            </h1>

            <p className="mt-3 text-sm text-gray-600">Seller Name</p>

            <p className="mt-5 text-3xl font-bold text-gray-950">
              ${product.Price.toLocaleString()}
            </p>

            <p className="mt-2 text-xs font-semibold text-green-700">
              Buy It Now · Razorpay secure checkout
            </p>

            <button
              type="button"
              onClick={() => onBuyNow(product)}
              disabled={isOwnListing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0064d2] px-5 py-3 text-sm font-black text-white shadow-xs hover:bg-[#0051ab] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOwnListing ? "Cannot buy your own listing" : "Buy It Now"}
            </button>
        </aside>
      </div>

      <section className="p-6">
          <h2 className="text-lg font-bold text-gray-950">About this item</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
            {product.ProductDescription}
          </p>

          {attributes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-900">
                Item specifics
              </h3>
              <dl className="mt-3 space-y-1 text-sm text-gray-800">
                {attributes.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex gap-1"
                  >
                    <dt className="font-bold">
                      {key}:
                    </dt>
                    <dd>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
      </section>
    </div>
  );
}
