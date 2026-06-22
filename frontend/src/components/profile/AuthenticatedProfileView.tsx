import type { AuthenticatedProfileViewProps } from "../../types";
import { useProfileHistory } from "../../hooks/useProfileHistory";
import AccountCredentialsForm from "./AccountCredentialsForm";
import AddressBook from "./AddressBook";
import ProfileSummaryCard from "./ProfileSummaryCard";
import PurchaseHistoryCard from "./PurchaseHistoryCard";

export default function AuthenticatedProfileView({
  currentUser,
  onSwitchTab,
  onSelectChatForOrder,
}: AuthenticatedProfileViewProps) {
  const user = currentUser;

  const {
    listings,
    purchases,
    loadingHistory,
    fetchHistory,
  } = useProfileHistory(user);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Account Credentials & Verification
              </h2>
              <p className="text-xs text-gray-500">
                Edit billing descriptors and physical destination settings.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <AccountCredentialsForm user={user} />
          </div>
        </div>

        <AddressBook user={user} />
      </div>

      <div className="space-y-6">
        <ProfileSummaryCard
          user={user}
          listingsCount={listings.length}
          purchasesCount={purchases.length}
        />

        <PurchaseHistoryCard
          purchases={purchases}
          loadingHistory={loadingHistory}
          onRefresh={fetchHistory}
          onSwitchTab={onSwitchTab}
          onSelectChatForOrder={onSelectChatForOrder}
        />
      </div>
    </div>
  );
}
