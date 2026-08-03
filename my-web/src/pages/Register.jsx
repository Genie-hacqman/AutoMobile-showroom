import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import FormField, { inputClasses } from '../components/auth/FormField';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { ErrorMessage, SubmitButton } from '../components/auth/Feedback';
import { useAuth } from '../context/authContext';
import { evaluatePassword } from '../utils/passwordStrength';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!evaluatePassword(form.password).isValid) {
      setFieldErrors({ password: 'Please satisfy every password requirement' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (submissionError) {
      setError(submissionError.message);
      setFieldErrors(submissionError.fieldErrors || {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save vehicles, track enquiries and manage your Obolo Motors profile."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Sign in
          </Link>
        </span>
      }
    >
      <ErrorMessage>{error}</ErrorMessage>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="first_name" error={fieldErrors.first_name}>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              autoComplete="given-name"
              className={inputClasses}
            />
          </FormField>
          <FormField label="Last name" htmlFor="last_name" error={fieldErrors.last_name}>
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              autoComplete="family-name"
              className={inputClasses}
            />
          </FormField>
        </div>

        <FormField label="Email address" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Phone (optional)" htmlFor="phone" error={fieldErrors.phone}>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
            placeholder="+234 801 234 5678"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </FormField>
        <PasswordStrength password={form.password} />

        <FormField label="Confirm password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </FormField>

        <SubmitButton isLoading={isLoading}>{isLoading ? 'Creating account' : 'Create account'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
