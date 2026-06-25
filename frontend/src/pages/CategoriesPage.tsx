import type { ChangeEvent } from "react";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Layers, Plus } from "lucide-react";
import {createCategory, getParentCategories, getSubCategories, type Category } from "../services/categories";
import { getFormString } from "../utils/helpers";
import SubmitListingButton from "../components/sell/SubmitListingButton";
import { getPresignedUrl } from "../services/auth";
import axios from "axios";

interface CategoryFormState {
  error: string;
  success: string;
}

const initialCategoryFormState: CategoryFormState = {
  error: "",
  success: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState<
    Record<number, Category[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [file, setFile] = useState<File>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const inputFileRef = useRef(null)
  let imageUrl = "";

  const refreshCategories = useCallback(async () => {
    setLoadError("");
    setLoading(true);

    try {
      const parentCategories = await getParentCategories();
      setCategories(parentCategories);

      const subcategoryEntries = await Promise.all(
        parentCategories.map(async (category) => [
          category.ID,
          await getSubCategories(category.ID),
        ] as const),
      );

      setSubcategoriesByParent(Object.fromEntries(subcategoryEntries));
    } catch {
      setLoadError("Unable to load categories right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialCategories() {
      await Promise.resolve();

      if (!ignore) {
        await refreshCategories();
      }
    }

    loadInitialCategories();

    return () => {
      ignore = true;
    };
  }, [refreshCategories]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>){
    setFile(e.target.files[0])
    setPreviewUrl(URL.createObjectURL(e.target.files[0]))
  }

  async function uploadImage() {
    const presignUrl = await getPresignedUrl(file.name)
    const uploadUrl = presignUrl.data.url

    try{
      const response = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type" : file.type
        }
      })
      imageUrl = uploadUrl.split("?")[0]
      console.log(uploadUrl.split("?")[0])
    }catch(error){
      console.log(error)
    }
  }

  async function handleParentCategorySubmit(_: CategoryFormState,formData: FormData): Promise<CategoryFormState> {
    const categoryName = getFormString(formData, "categoryName");
    let parentId = getFormString(formData, "parent")
    if(parentId == ""){
      parentId = "0"
    }
    if (!categoryName) {
      return {
        error: "Category name is required.",
        success: "",
      };
    }

    try {
      if(file){
        await uploadImage()
      }
      
      await createCategory({CategoryName:categoryName, ImageUrl:imageUrl, ParentID: Number(parentId)});
      await refreshCategories();
      inputFileRef.current = null
      return {
        error: "",
        success: "Category added.",
      };
    } catch {
      return {
        error: "Unable to add this category.",
        success: "",
      };
    }
  }

  const [parentFormState, parentFormAction] = useActionState(
    handleParentCategorySubmit,
    initialCategoryFormState,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <Layers className="h-5 w-5 text-[#0064d2]" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Category Management
            </h1>
            <p className="text-xs text-gray-500">
              Add parent categories and nested subcategories for product
              listings.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form action={parentFormAction} className="space-y-4">
            <h2 className="text-sm font-bold text-gray-900">
              Add Category
            </h2>

            <select name="parent" id="parent" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-hidden focus:ring-1 focus:ring-[#0064d2">
              <option value="">Select Category</option>
              {categories.length > 0 && categories.map((category)=>(
                <option key={category.ID} value={category.ID}>{category.CategoryName}</option>
              ))}
            </select>

            <input
              type="text"
              name="categoryName"
              required
              placeholder="Category name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-hidden focus:ring-1 focus:ring-[#0064d2]"
            />

            <input
              ref = {inputFileRef}
              type="file"
              name="file"
              accept="img/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-hidden focus:ring-1 focus:ring-[#0064d2]"
            />
            {file &&
            <img src={previewUrl} alt={file.name} className="h-32 w-32 object-cover" />
            }


            {parentFormState.error && (
              <p className="text-xs font-semibold text-red-600">
                {parentFormState.error}
              </p>
            )}
            {parentFormState.success && (
              <p className="text-xs font-semibold text-green-700">
                {parentFormState.success}
              </p>
            )}

            <SubmitListingButton idleText="Add Category" pendingText="Adding..." />
          </form>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <Plus className="h-4 w-4 text-[#86b817]" />
          <h2 className="text-sm font-bold text-gray-900">
            Current Category Tree
          </h2>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-gray-500">Loading categories...</p>
        )}
        {loadError && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            {loadError}
          </p>
        )}

        {!loading && !loadError && categories.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No categories have been added yet.
          </p>
        )}

        {!loading && !loadError && categories.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <article
                key={category.ID}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="text-sm font-bold text-gray-900">
                  {category.CategoryName}
                </h3>
                {category.ImageUrl && (
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {category.ImageUrl}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {(subcategoriesByParent[category.ID] ?? []).length > 0 ? (
                    subcategoriesByParent[category.ID].map((subcategory) => (
                      <span
                        key={subcategory.ID}
                        className="rounded-full bg-[#0064d2]/10 px-3 py-1 text-xs font-semibold text-[#0064d2]"
                      >
                        {subcategory.CategoryName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">
                      No subcategories yet
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
