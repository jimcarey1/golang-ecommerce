import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Tag, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Check } from "lucide-react";
import { getUserAddresses, type Address } from "../services/addresses.ts";
import { useAuthContext } from "../context/AuthContext.tsx";
import { getFormString } from "../utils/helpers.ts";

interface SellViewProps {
  onSwitchTab: (tab: string) => void;
  onListItem: (itemDetails: { title: string; description: string; price: number; category: string; imageUrl?: string }) => Promise<void>;
}

const DEFAULT_CATEGORY = "Consumer Electronics";

const presets = [
  {
    title: "Apple iPad Pro M4 (11-inch)",
    category: "Consumer Electronics",
    price: "920",
    description: "Original box included, space gray. 256GB WiFi, includes apple pencil wrapper and magnetic foldable smart folio black cover.",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Leather Urban Backpack (Waterproof)",
    category: "Fashion & Apparel",
    price: "72",
    description: "Crafted in heavy vintage leather with multiple accessory zipper pockets, padded sleeve fitting laptops up to 16. Comfortable mesh shoulder straps.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Fujifilm X-T5 Mirrorless Camera with 18-55mm lens",
    category: "Consumer Electronics",
    price: "1650",
    description: "Like-new condition. 40.2MP high speed BSI CMOS sensor, retro dials. Kept in humidor bag, includes charger, custom strap, and original lens caps.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"
  }
] as const;

type ListingPreset = (typeof presets)[number];

interface ListingFormState {
  error: string;
  success: boolean;
}

const initialListingFormState: ListingFormState = {
  error: "",
  success: false,
};

function SubmitListingButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#86b817] px-8 py-3 text-xs font-black text-white hover:bg-[#729c13] transition shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Publishing Catalog..." : "List Item For Sale"}
    </button>
  );
}

function setFormValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);

  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  ) {
    field.value = value;
  }
}

export default function SellPage({ onSwitchTab, onListItem }: SellViewProps) {
  const { user } = useAuthContext();
  const listingFormRef = useRef<HTMLFormElement>(null);
  const [ addresses, setAddresses ] = useState<Address[]>([]);

  useEffect(()=>{
    async function fetchAddresses() {
      if (!user) return;
      const addresses = await getUserAddresses(user.ID)
      setAddresses(addresses);
    }

    fetchAddresses();
  }, [user]);
  const hasProfileAddress = user && addresses.length > 0;

  const isEligibleToSell = hasProfileAddress;

  function fillPreset(preset: ListingPreset) {
    const form = listingFormRef.current;
    if (!form) return;

    setFormValue(form, "title", preset.title);
    setFormValue(form, "category", preset.category);
    setFormValue(form, "price", preset.price);
    setFormValue(form, "description", preset.description);
    setFormValue(form, "imageUrl", preset.imageUrl);
  }

  async function handleListingSubmit(
    _: ListingFormState,
    formData: FormData,
  ): Promise<ListingFormState> {
    const title = getFormString(formData, "title");
    const description = getFormString(formData, "description");
    const price = getFormString(formData, "price");
    const category = getFormString(formData, "category") || DEFAULT_CATEGORY;
    const imageUrl = getFormString(formData, "imageUrl");

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return {
        error: "Price must be a valid positive number.",
        success: false,
      };
    }

    try {
      await onListItem({
        title,
        description,
        price: priceNum,
        category,
        imageUrl: imageUrl.trim() || undefined
      });

      listingFormRef.current?.reset();

      return {
        error: "",
        success: true,
      };
    } catch (e: unknown) {
      return {
        error: e instanceof Error ? e.message : "Failed to list item. Please try again.",
        success: false,
      };
    }
  }

  const [formState, formAction] = useActionState(
    handleListingSubmit,
    initialListingFormState,
  );

  useEffect(() => {
    if (!formState.success) return;

    const timer = window.setTimeout(() => {
      onSwitchTab("marketplace");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [formState.success, onSwitchTab]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <ShieldAlert className="h-14 w-14 text-amber-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-800">Authorization Required</h3>
        <p className="text-gray-500 mt-2 max-w-sm">You must log in to list, publish, or sell products. Register or sign in first.</p>
        <button
          onClick={() => onSwitchTab("profile")}
          className="mt-5 rounded-lg bg-black px-6 py-2 text-xs font-bold text-white hover:bg-gray-800 cursor-pointer"
        >
          Go to Sign In / Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Absolute Guard Condition Check */}
      {!isEligibleToSell ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-xs text-center">
          <AlertTriangle className="h-12 w-12 text-[#e53238] mx-auto mb-4" />
          <h2 className="text-lg font-black text-red-950">Active Action Denied (Security Lock)</h2>
          <p className="text-sm text-red-800 mt-2 max-w-xl mx-auto">
            Our rules mandate that before putting any item up for sale, you must fill out your **Shipping Address** and **Razorpay billing details** to verify tax and transaction payouts.
          </p>
          
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onSwitchTab("profile")}
              className="flex items-center gap-2 rounded-lg bg-[#0064d2] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0051ab] transition shadow-xs cursor-pointer"
            >
              <span>Update Profile Info Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onSwitchTab("marketplace")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Listing Panel */}
          <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
              <Tag className="h-5 w-5 text-[#86b817]" />
              <h1 className="text-lg font-bold text-gray-900 font-sans">List a New Item on eBay</h1>
            </div>

            {formState.error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                {formState.error}
              </div>
            )}

            {formState.success ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-green-900">Listing Created Successfully!</h3>
                <p className="text-xs text-gray-500 mt-1">Authorized database entry successfully stored. Opening your catalog view...</p>
              </div>
            ) : (
              <form ref={listingFormRef} action={formAction} className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    What are you selling? (Title)
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Brand New Sony WH-1000XM5 Sealed"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                  />
                </div>

                {/* Categories & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      defaultValue={DEFAULT_CATEGORY}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white"
                    >
                      <option value="Consumer Electronics">Consumer Electronics</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Watches & Jewelry">Watches & Jewelry</option>
                      <option value="Books & Media">Books & Media</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Listing Price ($ USD)
                    </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 299"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                  />
                </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Describe Item Condition & details
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Include key details like model details, wear and tear, shipping package sizes and original box packaging accessories included..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                  />
                </div>

                {/* Image URL with Preview */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Product Image URL (Optional Preset)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    placeholder="https://images.unsplash.com/your-image-url"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end">
                  <SubmitListingButton />
                </div>

              </form>
            )}
          </div>

          {/* Quick-Fill UI Presets Panel */}
          <div className="space-y-4">
            
            <div className="rounded-xl border border-gray-150 bg-gray-50 p-4 shadow-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200 mb-3">
                <Sparkles className="h-4 w-4 text-[#f5af02]" />
                <h3 className="text-xs font-extrabold uppercase text-gray-700 tracking-wider">
                  UX Quick-Templates
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal mb-3">
                Click any layout template below to automatically fill the form fields with high-quality descriptions and hosted HD photographic images for instant selling test!
              </p>

              <div className="space-y-3">
                {presets.map((p, index) => (
                  <div
                    key={index}
                    onClick={() => fillPreset(p)}
                    className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white p-2 text-left cursor-pointer hover:border-blue-400 hover:shadow-xs transition duration-150"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-10 w-10 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{p.title}</h4>
                      <span className="text-[10px] font-black text-[#0064d2]">${p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note on traditional setup */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-[11px] text-gray-500 leading-relaxed shadow-xs">
              <strong>Security Protocol Notice:</strong> Listed assets will accept only verified <strong>Simulated Razorpay payments</strong>, which requires credit credentials matching either the item buyer or systemic OTP protocols.
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
