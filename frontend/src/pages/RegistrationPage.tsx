import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import Input from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../services/auth';
import type { CreateUserPayload } from '../services/auth';

function getFormValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '');
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string') return data;
    if (data && typeof data === 'object' && 'error' in data) {
      return String(data.error);
    }

    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { setUserSession } = useAuth();

  const registerMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: (response) => {
      setUserSession(response.data);
      navigate('/');
    },
  });

  const syncPasswordMatchValidity = (form: HTMLFormElement | null) => {
    const password = form?.elements.namedItem(
      'register_password',
    ) as HTMLInputElement | null;
    const confirmPassword = form?.elements.namedItem(
      'register_confirm_password',
    ) as HTMLInputElement | null;

    if (!password || !confirmPassword) return;

    confirmPassword.setCustomValidity(
      confirmPassword.value && confirmPassword.value !== password.value
        ? 'Password must match.'
        : '',
    );
  };

  const handleRegisterPasswordInput = (event: FormEvent<HTMLInputElement>) => {
    syncPasswordMatchValidity(event.currentTarget.form);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    syncPasswordMatchValidity(event.currentTarget);

    if (!event.currentTarget.reportValidity()) return;

    const formData = new FormData(event.currentTarget);
    const password = getFormValue(formData, 'register_password');
    const confirmPassword = getFormValue(formData, 'register_confirm_password');

    if (password !== confirmPassword) return;

    registerMutation.mutate({
      full_name: getFormValue(formData, 'register_full_name'),
      email: getFormValue(formData, 'register_email'),
      password,
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 text-sm text-slate-600">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </div>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Sign up</h1>
            <p className="mt-2 text-sm text-slate-600">
              Get access to one of the best Eshopping services in the world.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <Input
              placeholder="Full Name"
              type="text"
              name="register_full_name"
              autoComplete="name"
              minLength={2}
              maxLength={16}
              pattern="[A-Za-z ]+"
              title="Numbers and special characters are not allowed."
              required
            />
            <Input
              placeholder="Email Address"
              type="email"
              name="register_email"
              autoComplete="email"
              required
            />
            <Input
              placeholder="Password"
              type="password"
              name="register_password"
              autoComplete="new-password"
              minLength={6}
              maxLength={36}
              onInput={handleRegisterPasswordInput}
              required
            />
            <Input
              placeholder="Re-Type Password"
              type="password"
              name="register_confirm_password"
              autoComplete="new-password"
              minLength={6}
              maxLength={36}
              onInput={handleRegisterPasswordInput}
              required
            />
            <button
              className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Signing up...' : 'Sign up'}
            </button>
            {registerMutation.isError && (
              <span className="block text-sm text-red-600">
                {getErrorMessage(registerMutation.error)}
              </span>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
