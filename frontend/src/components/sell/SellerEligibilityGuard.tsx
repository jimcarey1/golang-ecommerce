import { AlertTriangle, ArrowRight } from "lucide-react";

interface SellerEligibilityGuardProps {
  onSwitchTab: (tab: string) => void;
}

export default function SellerEligibilityGuard({
  onSwitchTab,
}: SellerEligibilityGuardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-xs text-center">
        <AlertTriangle className="h-12 w-12 text-[#e53238] mx-auto mb-4" />

        <h2 className="text-lg font-black text-red-950">
          Active Action Denied (Security Lock)
        </h2>

        <p className="text-sm text-red-800 mt-2 max-w-xl mx-auto">
          Our rules mandate that before putting any item up for sale, you must
          fill out your Shipping Address and Razorpay billing details to verify
          tax and transaction payouts.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onSwitchTab("profile")}
            className="flex items-center gap-2 rounded-lg bg-[#0064d2] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0051ab] transition shadow-xs cursor-pointer"
          >
            <span>Update Profile Info Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onSwitchTab("marketplace")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
}