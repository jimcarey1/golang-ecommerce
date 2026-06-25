import { useEffect, useState, type RefObject, type ChangeEvent } from "react";
import { Check, Tag } from "lucide-react";
import { type ListingFormState, type SelectedImage } from "./types";
import SubmitListingButton from "./SubmitListingButton";
import SelectedImagePreviewGrid from "./SelectedImagePreviewGrid";
import {
  getParentCategories,
  getSubCategories,
  type Category,
} from "../../services/categories";

interface ListingFormProps {
  formRef: RefObject<HTMLFormElement | null>;
  formAction: (formData: FormData) => void;
  formState: ListingFormState;
  fileInputRef: RefObject<HTMLInputElement | null>;
  selectedImages: SelectedImage[];
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedImage: (imageId: string) => void;
}

export default function ListingForm({
  formRef,
  formAction,
  formState,
  fileInputRef,
  selectedImages,
  onFileChange,
  onRemoveSelectedImage,
}: ListingFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError("");

      try {
        const parentCategories = await getParentCategories();
        setCategories(parentCategories);
      } catch {
          setCategoryError("Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const categoryId = Number(selectedCategoryId);

    if (!categoryId) {
      return;
    }

    async function loadSubcategories() {
      try {
        const childCategories = await getSubCategories(categoryId);
        setSubcategories(childCategories);
      } catch {
          setSubcategories([]);
          setCategoryError("Unable to load subcategories.");
      }
    }

    loadSubcategories();
  }, [selectedCategoryId]);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
        <Tag className="h-5 w-5 text-[#86b817]" />
        <h1 className="text-lg font-bold text-gray-900 font-sans">
          List a New Item on eBay
        </h1>
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

          <h3 className="text-sm font-bold text-green-900">
            Listing Created Successfully!
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Authorized database entry successfully stored. Opening your catalog
            view...
          </p>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="category_id"
              required
              value={selectedCategoryId}
              onChange={(event) => {
                setSelectedCategoryId(event.target.value);
                setSubcategories([]);
                setCategoryError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white"
            >
              <option value="" disabled>
                {loadingCategories ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((category) => (
                <option key={category.ID} value={category.ID}>
                  {category.CategoryName}
                </option>
              ))}
            </select>

            <select
              name="subcategory_id"
              required
              defaultValue=""
              disabled={!selectedCategoryId || subcategories.length === 0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white"
            >
              <option value="" disabled>
                {selectedCategoryId
                  ? "Select subcategory"
                  : "Select category first"}
              </option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.ID} value={subcategory.ID}>
                  {subcategory.CategoryName}
                </option>
              ))}
            </select>
          </div>

          {categoryError && (
            <p className="text-xs font-semibold text-red-600">
              {categoryError}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="brand"
              required
              placeholder="Brand"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
            />

            <input
              type="number"
              name="price"
              required
              min="1"
              step="any"
              placeholder="Listing Price"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
            />
          </div>

          <textarea
            name="description"
            required
            rows={4}
            placeholder="Describe item condition and details..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
          />

          <input
            ref={fileInputRef}
            type="file"
            name="productImages"
            accept="image/*"
            onChange={onFileChange}
            multiple
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
          />

          {selectedImages.length > 0 && (
            <SelectedImagePreviewGrid
              images={selectedImages}
              onRemoveSelectedImage={onRemoveSelectedImage}
            />
          )}

          <div className="pt-4 flex justify-end">
            <SubmitListingButton />
          </div>
        </form>
      )}
    </div>
  );
}
