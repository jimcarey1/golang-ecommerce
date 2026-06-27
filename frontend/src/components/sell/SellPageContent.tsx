import { useActionState, useEffect, useRef } from "react";
import { getFormString } from "../../utils/helpers";
import { initialListingFormState, type ListingFormState } from "./types";
import { useImageUpload } from "../../hooks/useImageUpload";
import ListingForm from "./ListingForm";
import type { CreateProductPayload } from "../../services/products";
import { createProduct } from "../../services/products";
import { useAuthContext } from "../../context/AuthContext";
import { parseProductAttributes } from "../../utils/parseAttributes";

interface SellPageContentProps {
  onSwitchTab: (tab: string) => void;
}

export default function SellPageContent({
  onSwitchTab,
}: SellPageContentProps) {
  const { user } = useAuthContext()
  const listingFormRef = useRef<HTMLFormElement>(null);

  const {
    fileInputRef,
    selectedImages,
    handleFileChange,
    removeSelectedImage,
    clearSelectedImages,
    uploadFiles,
  } = useImageUpload();

  async function handleListingSubmit(
    _: ListingFormState,
    formData: FormData,
  ): Promise<ListingFormState> {
    const title = getFormString(formData, "title");
    const description = getFormString(formData, "description");
    const price = getFormString(formData, "price");
    const categoryId = Number(getFormString(formData, "category_id"));
    const subcategoryId = Number(getFormString(formData, "subcategory_id"));
    const mode = "fixed";
    const brand = getFormString(formData, "brand");
    const attributes = parseProductAttributes(description);
    const priceNum = parseFloat(price);

    if (!user) {
      return {
        error: "You must be signed in to list a product.",
        success: false,
      };
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      return {
        error: "Price must be a valid positive number.",
        success: false,
      };
    }

    if (!categoryId || !subcategoryId) {
      return {
        error: "Select a category and subcategory before listing.",
        success: false,
      };
    }

    try {
      const uploadedImageUrls = await uploadFiles();
      const data: CreateProductPayload = {
        ProductName: title,
        ProductDescription: description,
        Price: priceNum,
        CategoryID: categoryId,
        SubCategoryID: subcategoryId,
        Mode: mode,
        Brand: brand,
        Images: uploadedImageUrls,
        UserID: user.ID,
        Attributes: JSON.stringify(attributes),
      };

      await createProduct(data);
      listingFormRef.current?.reset();
      clearSelectedImages();

      return {
        error: "",
        success: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list item. Please try again.",
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

  return (
    <div className="max-w-4xl mx-auto">
      <ListingForm
        formRef={listingFormRef}
        formAction={formAction}
        formState={formState}
        fileInputRef={fileInputRef}
        selectedImages={selectedImages}
        onFileChange={handleFileChange}
        onRemoveSelectedImage={removeSelectedImage}
      />
    </div>
  );
}
