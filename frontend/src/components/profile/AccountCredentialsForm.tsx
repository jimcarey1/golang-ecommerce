import SaveButton from "./SaveButton";
import type { AuthUser } from "../../services/auth";

interface AccountCredentialsFormProps {
  user: AuthUser;
}

export default function AccountCredentialsForm({
  user,
}: AccountCredentialsFormProps) {
  function handleAccountCredentialsSave() {
    return;
  }

  return (
    <form action={handleAccountCredentialsSave} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            required
            defaultValue={user.FullName || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:ring-1 focus:ring-[#0064d2] focus:border-[#0064d2] outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
            Registered Email (Immutable)
          </label>
          <input
            type="email"
            disabled
            defaultValue={user.Email}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 font-medium cursor-not-allowed select-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <SaveButton idleText="Save User" pendingText="Saving User..." />
      </div>
    </form>
  );
}
