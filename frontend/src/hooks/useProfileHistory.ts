import { useCallback, useEffect, useState } from "react";
import type { Item, Order } from "../types";
import type { AuthUser } from "../services/auth";

export function useProfileHistory(user: AuthUser) {
  const [listings, setListings] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);

    try {
      const listRes = await fetch("/api/items", {
        headers: {
          Authorization: `Bearer ${user.ID}`,
        },
      });

      if (listRes.ok) {
        const allItems: Item[] = await listRes.json();
        setListings(allItems.filter((item) => item.sellerId === user.ID));
      }

      const purchRes = await fetch("/api/buyer/orders", {
        headers: {
          Authorization: `Bearer ${user.ID}`,
        },
      });

      if (purchRes.ok) {
        const orderHistory: Order[] = await purchRes.json();
        setPurchases(orderHistory);
      }
    } catch (error) {
      console.error("Error loading profile history datasets:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [user.ID]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialHistory() {
      await Promise.resolve();

      if (!ignore) {
        await fetchHistory();
      }
    }

    loadInitialHistory();

    return () => {
      ignore = true;
    };
  }, [fetchHistory]);

  return {
    listings,
    purchases,
    loadingHistory,
    fetchHistory,
  };
}
