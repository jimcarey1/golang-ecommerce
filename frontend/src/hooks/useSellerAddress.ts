import { useEffect, useState } from "react";
import { getUserAddresses } from "../services/addresses";
import type { Address } from "../services/addresses";
import type { AuthUser } from "../services/auth";

export function useSellerAddresses(user: AuthUser | null) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;

      setLoadingAddresses(true);

      try {
        const userAddresses = await getUserAddresses(user.ID);
        setAddresses(userAddresses);
      } finally {
        setLoadingAddresses(false);
      }
    }

    fetchAddresses();
  }, [user]);

  return {
    addresses,
    loadingAddresses,
  };
}