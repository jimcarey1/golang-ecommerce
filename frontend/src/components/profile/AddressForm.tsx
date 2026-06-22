import { useActionState } from "react";
import { MapPin } from "lucide-react";
import type { AuthUser } from "../../services/auth";
import { createAddress, type Address } from "../../services/addresses";
import { getAddressFieldsFromFormData } from "../../utils/addressForm";
import SaveButton from "./SaveButton";

interface AddressFormProps {
  user: AuthUser;
  onAddressSaved: (address: Address) => void;
  onCancel: () => void;
}

interface AddressFormState {
  error: string;
}

const initialAddressFormState: AddressFormState = {
  error: "",
};

export default function AddressForm({
  user,
  onAddressSaved,
  onCancel,
}: AddressFormProps) {
  async function handleAddressSave(_: unknown, formData: FormData) {
    try {
      const addressPayload = getAddressFieldsFromFormData(formData);
      const address = await createAddress(addressPayload, user.ID);
      onAddressSaved(address);

      return initialAddressFormState;
    } catch {
      return {
        error: "Unable to save this address right now. Please try again.",
      };
    }
  }

  const [state, addressSaveAction] = useActionState(
    handleAddressSave,
    initialAddressFormState,
  );

  return (
    <form action={addressSaveAction} className="space-y-5">
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="h-4 w-4 text-[#e53238]" />
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Shipping Destination Address
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Line 1
          </label>
          <input
            type="text"
            name="line1"
            required
            placeholder="House number, street, building"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Line 2 <span className="text-gray-400 font-medium">(optional)</span>
          </label>
          <input
            type="text"
            name="line2"
            placeholder="Apartment, suite, landmark"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            required
            placeholder="City"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            State Name
          </label>
          <input
            type="text"
            name="state_name"
            required
            placeholder="State or province"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postal_code"
            required
            placeholder="Postal or ZIP code"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Country
          </label>
          <input
            type="text"
            name="country"
            required
            placeholder="Country"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden placeholder-gray-450"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <SaveButton
          idleText="Add Address"
          pendingText="Adding Address..."
          variant="outline"
        />
      </div>
    </form>
  );
}
