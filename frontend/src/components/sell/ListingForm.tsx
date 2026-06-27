import { useEffect, useState, type RefObject, type ChangeEvent } from "react";
import { Check, Plus, Tag, Trash2 } from "lucide-react";
import { type ListingFormState, type SelectedImage } from "./types";
import SubmitListingButton from "./SubmitListingButton";
import SelectedImagePreviewGrid from "./SelectedImagePreviewGrid";
import {
  getParentCategories,
  getSubCategories,
  type Category,
} from "../../services/categories";

interface AttributeRow {
  id: string;
}

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
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([]);

  function createAttributeRow() {
    const randomId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    return { id: randomId };
  }

  function addAttributeRow() {
    setAttributeRows((currentRows) => [...currentRows, createAttributeRow()]);
  }

  function removeAttributeRow(attributeId: string) {
    setAttributeRows((currentRows) =>
      currentRows.filter((row) => row.id !== attributeId),
    );
  }

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

          <textarea
            name="description"
            required
            rows={4}
            placeholder="Describe item condition and details..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
          />

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

          <input
            ref={fileInputRef}
            type="file"
            name="productImages"
            accept="image/*"
            onChange={onFileChange}
            multiple
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Product Attributes
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Add details like CPU_CORES, RAM, SSD, HDD, or Graphics Card.
                </p>
              </div>

              <button
                type="button"
                onClick={addAttributeRow}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0064d2]/25 bg-white px-3 py-2 text-xs font-bold text-[#0064d2] hover:bg-[#0064d2]/5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add attributes
              </button>
            </div>

            {attributeRows.length > 0 && (
              <div className="mt-4 space-y-3">
                {attributeRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <input
                      type="text"
                      name="attribute_keys"
                      placeholder="Attribute name, e.g. RAM"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                    />
                    <input
                      type="text"
                      name="attribute_values"
                      placeholder="Value, e.g. 16GB"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-[#0064d2] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttributeRow(row.id)}
                      aria-label="Remove attribute"
                      className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-white px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
