import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import Input from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/auth';

type LoginPayload = {
  email: string;
  password: string;
};

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

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setUserSession } = useAuth();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      loginUser(payload.email, payload.password),
    onSuccess: (response) => {
      setUserSession(response.data);
      navigate('/');
    },
  });

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    loginMutation.mutate({
      email: getFormValue(formData, 'login_email'),
      password: getFormValue(formData, 'login_password'),
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 text-sm text-slate-600">
          We&apos;d be happy to join us! <Link to="/">Go Store</Link>
        </div>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Get access to one of the best Eshopping services in the world.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <Input
              placeholder="Email Address"
              type="email"
              name="login_email"
              autoComplete="email"
              required
            />
            <Input
              placeholder="Password"
              type="password"
              name="login_password"
              autoComplete="current-password"
              required
            />
            <button
              className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
            {loginMutation.isError && (
              <span className="block text-sm text-red-600">
                {getErrorMessage(loginMutation.error)}
              </span>
            )}
            <div className="flex justify-between text-sm">
              <Link to="/auth/forgot">Forgot password ?</Link>
              <Link to="/auth/register">Create account</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
