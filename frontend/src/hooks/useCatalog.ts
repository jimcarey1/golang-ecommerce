import { useCallback, useEffect, useState } from "react";
import type { Item, User } from "../types.ts";

export function useCatalog() {
  const [listings, setListings] = useState<Item[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  const fetchCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const items = await res.json();
        setListings(items);
      }
    } catch (err) {
      console.error("Disconnection loading product catalog:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const createListing = useCallback(
    async (
      itemDetails: {
        title: string;
        description: string;
        price: number;
        category: string;
        imageUrl?: string;
      },
      currentUser: User | null,
      onListingCreated: () => void,
    ) => {
      if (!currentUser) return;

      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify(itemDetails),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Listing failed.");
      }

      await fetchCatalog();
      onListingCreated();
    },
    [fetchCatalog],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    listings,
    loadingCatalog,
    fetchCatalog,
    createListing,
  };
}
