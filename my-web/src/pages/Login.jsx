import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import FormField, { inputClasses } from '../components/auth/FormField';
import PasswordInput from '../components/auth/PasswordInput';
import { ErrorMessage, SubmitButton, SuccessMessage } from '../components/auth/Feedback';
import { useAuth } from '../context/authContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/profile';

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your garage, saved vehicles and account settings."
      footer={
        <span>
          New to Obolo Motors?{' '}
          <Link to="/register" className="font-medium text-slate-900 underline">
            Create an account
          </Link>
        </span>
      }
    >
      {location.state?.registered ? (
        <SuccessMessage>Account created. Check your inbox to verify your email address.</SuccessMessage>
      ) : null}
      <ErrorMessage>{error}</ErrorMessage>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="Email address" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600" htmlFor="rememberMe">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={form.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-slate-600 underline transition hover:text-slate-900">
            Forgot password?
          </Link>
        </div>

        <SubmitButton isLoading={isLoading}>{isLoading ? 'Signing in' : 'Sign in'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
