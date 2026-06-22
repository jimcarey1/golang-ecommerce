import LoginModal from "./LoginModal.tsx";
import RegisterModal from "./RegisterModal.tsx";
import type { AuthFormAction } from "./authFormTypes.ts";

export type { AuthFormAction, AuthFormMode, AuthFormState } from "./authFormTypes.ts";

interface AuthModalProps {
  isSignUpMode: boolean;
  setIsSignUpMode: (value: boolean) => void;
  onSubmitAction: AuthFormAction;
  onClose: () => void;
}

export default function AuthModal({
  isSignUpMode,
  setIsSignUpMode,
  onSubmitAction,
  onClose,
}: AuthModalProps) {
  if (isSignUpMode) {
    return (
      <RegisterModal
        onSubmitAction={onSubmitAction}
        onSwitchToLogin={() => setIsSignUpMode(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <LoginModal
      onSubmitAction={onSubmitAction}
      onSwitchToRegister={() => setIsSignUpMode(true)}
      onClose={onClose}
    />
  );
}
