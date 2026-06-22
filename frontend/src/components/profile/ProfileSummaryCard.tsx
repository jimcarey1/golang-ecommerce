import type { AuthUser } from "../../services/auth";

interface ProfileSummaryCardProps {
  user: AuthUser;
  listingsCount: number;
  purchasesCount: number;
}

export default function ProfileSummaryCard({
  user,
  listingsCount,
  purchasesCount,
}: ProfileSummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs text-center">
      <div className="mx-auto h-16 w-16 bg-[#0064d2]/10 rounded-full flex items-center justify-center text-[#0064d2] text-xl font-black">
        {user.FullName.charAt(0).toUpperCase()}
      </div>

      <h3 className="text-base font-bold text-gray-900 mt-3">
        {user.FullName}
      </h3>

      <p className="text-xs text-gray-500 mt-0.5">{user.Email}</p>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-150">
        <div className="bg-gray-50 p-2.5 rounded-lg">
          <span className="block text-xs font-black text-gray-900">
            {listingsCount}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">
            Listed Items
          </span>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg">
          <span className="block text-xs font-black text-gray-900">
            {purchasesCount}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">
            Bought Items
          </span>
        </div>
      </div>
    </div>
  );
}