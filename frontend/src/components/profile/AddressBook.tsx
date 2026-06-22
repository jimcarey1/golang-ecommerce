import { useEffect, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import type { AuthUser } from "../../services/auth";
import { getUserAddresses, type Address } from "../../services/addresses";
import AddressForm from "./AddressForm";

interface AddressBookProps {
  user: AuthUser;
}

export default function AddressBook({ user }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadAddresses() {
      setLoading(true);
      setError("");

      try {
        const userAddresses = await getUserAddresses(user.ID);

        if (!ignore) {
          setAddresses(userAddresses);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load your saved addresses right now.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [user.ID]);

  function handleAddressSaved(address: Address) {
    setAddresses((currentAddresses) => [address, ...currentAddresses]);
    setIsModalOpen(false);
  }

  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Saved Addresses
            </h2>
            <p className="text-xs text-gray-500">
              Manage shipping destinations for checkout and seller fulfillment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0064d2] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0052ad]"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>

        <div className="mt-5">
          {loading && (
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Loading saved addresses...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && addresses.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-250 bg-gray-50 px-4 py-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-semibold text-gray-700">
                No saved addresses yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add an address to make checkout faster.
              </p>
            </div>
          )}

          {!loading && !error && addresses.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {addresses.map((address, index) => (
                <article
                  key={address.id ?? `${address.line1}-${address.postalCode}-${index}`}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#e53238]" />
                      <h3 className="text-sm font-bold text-gray-900">
                        Address {index + 1}
                      </h3>
                    </div>

                    {address.isPrimary && (
                      <span className="rounded-full bg-[#86b817]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4d7a0f]">
                        Primary
                      </span>
                    )}
                  </div>

                  <address className="mt-3 space-y-1 text-sm not-italic text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {address.line1}
                    </p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.stateName} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </address>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add Address
                </h2>
                <p className="text-xs text-gray-500">
                  Save a destination to use during checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close address modal"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AddressForm
              user={user}
              onAddressSaved={handleAddressSaved}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
