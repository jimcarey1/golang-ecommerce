export type AuthFormMode = "login" | "signup";

export interface AuthFormState {
  mode: AuthFormMode;
  error: string | null;
  message: string | null;
}

export type AuthFormAction = (
  previousState: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;
