import { useFormStatus } from "react-dom";

interface SubmitListingButtonProps {
  idleText?: string;
  pendingText?: string;
}

export default function SubmitListingButton({
  idleText = "List Item For Sale",
  pendingText = "Publishing Catalog...",
}: SubmitListingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#86b817] px-8 py-3 text-xs font-black text-white hover:bg-[#729c13] transition shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingText : idleText}
    </button>
  );
}
