import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Key, X } from "lucide-react";
import type { AuthFormAction, AuthFormState } from "./authFormTypes.ts";

const INITIAL_LOGIN_STATE: AuthFormState = {
  mode: "login",
  error: null,
  message: null,
};

interface LoginModalProps {
  onSubmitAction: AuthFormAction;
  onSwitchToRegister: () => void;
  onClose: () => void;
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-black text-white py-2.5 text-xs font-black uppercase hover:bg-gray-850 cursor-pointer shadow-xs transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Authorize Login credentials"}
    </button>
  );
}

export default function LoginModal({
  onSubmitAction,
  onSwitchToRegister,
  onClose,
}: LoginModalProps) {
  const [formState, formAction] = useActionState(onSubmitAction, INITIAL_LOGIN_STATE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-200 flex flex-col">
        <div className="bg-gray-50 py-4 px-5 border-b border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Key className="h-4.5 w-4.5 text-[#0064d2]" />
            <h4 className="text-sm font-black text-gray-900 uppercase">
              Traditional Sign In
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-1 rounded"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-4 text-xs font-sans">
          <input type="hidden" name="mode" value="login" />

          {formState.error && (
            <div className="rounded bg-red-50 p-2 text-center text-red-700 border border-red-200 font-semibold leading-relaxed">
              Error: {formState.error}
            </div>
          )}

          {formState.message && (
            <div className="rounded bg-green-50 p-2 text-center text-green-700 border border-green-200 font-semibold">
              Success: {formState.message}
            </div>
          )}

          <div>
            <label className="block text-gray-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. name@email.com"
              autoComplete="email"
              className="w-full rounded border border-gray-300 px-2.5 py-1.5 focus:border-[#0064d2] outline-hidden text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={4}
              placeholder="********"
              autoComplete="current-password"
              className="w-full rounded border border-gray-300 px-2.5 py-1.5 focus:border-[#0064d2] outline-hidden text-sm"
            />
          </div>

          <LoginSubmitButton />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">Or Switch Mode</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-500">
              New to eBay Clone?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#0064d2] font-semibold hover:underline"
              >
                Register Traditional Account
              </button>
            </p>
          </div>
        </form>

        <div className="bg-gray-50 p-3 text-center text-[9px] text-gray-400 leading-normal border-t border-gray-150 select-none">
          To start buying or putting items up for sale, make sure you configure Address details in your profile settings.
        </div>
      </div>
    </div>
  );
}
