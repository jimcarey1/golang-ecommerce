import { useFormStatus } from "react-dom";

interface SaveButtonProps {
  idleText: string;
  pendingText: string;
  variant?: "black" | "outline";
}

export default function SaveButton({
  idleText,
  pendingText,
  variant = "black",
}: SaveButtonProps) {
  const { pending } = useFormStatus();

  const className =
    variant === "black"
      ? "rounded-lg bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-850 active:scale-97 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
      : "rounded-lg border border-[#0064d2]/30 bg-[#0064d2]/5 px-3 py-2 text-xs font-bold text-[#0064d2] hover:bg-[#0064d2]/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : idleText}
    </button>
  );
}