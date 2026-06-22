import { AlertTriangle } from "lucide-react";

interface EligibilityWarningBannerProps {
  message: string;
  onGoToProfile: () => void;
  onDismiss: () => void;
}

export default function EligibilityWarningBanner({
  message,
  onGoToProfile,
  onDismiss,
}: EligibilityWarningBannerProps) {
  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-3 animate-fade-in animate-pulse">
      <AlertTriangle className="h-10 w-10 text-[#e53238]" />
      <h3 className="text-sm font-black text-red-950 uppercase tracking-tight">Requirement Checklist Failed</h3>
      <p className="text-xs text-red-800 leading-normal max-w-md">
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onGoToProfile}
          className="rounded bg-[#0064d2] px-4 py-2 text-xs font-bold text-white hover:bg-[#0051ab] cursor-pointer"
        >
          Go to Profile Setup
        </button>
        <button
          onClick={onDismiss}
          className="rounded bg-white border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          Dismiss Notice
        </button>
      </div>
    </div>
  );
}
