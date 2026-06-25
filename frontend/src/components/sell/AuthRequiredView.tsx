import { ShieldAlert } from "lucide-react";

interface AuthRequiredViewProps {
  onSwitchTab: (tab: string) => void;
}

export default function AuthRequiredView({
  onSwitchTab,
}: AuthRequiredViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <ShieldAlert className="h-14 w-14 text-amber-500 mb-4 animate-bounce" />

      <h3 className="text-xl font-bold text-gray-800">
        Authorization Required
      </h3>

      <p className="text-gray-500 mt-2 max-w-sm">
        You must log in to list, publish, or sell products. Register or sign in
        first.
      </p>

      <button
        onClick={() => onSwitchTab("profile")}
        className="mt-5 rounded-lg bg-black px-6 py-2 text-xs font-bold text-white hover:bg-gray-800 cursor-pointer"
      >
        Go to Sign In / Profile
      </button>
    </div>
  );
}