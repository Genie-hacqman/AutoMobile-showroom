import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import FormField from '../components/auth/FormField';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { ErrorMessage, SubmitButton, SuccessMessage } from '../components/auth/Feedback';
import api from '../api/client';
import { evaluatePassword } from '../utils/passwordStrength';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldError('');

    if (!evaluatePassword(password).isValid) {
      setFieldError('Please satisfy every password requirement');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.resetPassword(token, password);
      setMessage(response.message);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Reset password"
        footer={
          <Link to="/forgot-password" className="font-medium text-slate-900 underline">
            Request a new link
          </Link>
        }
      >
        <ErrorMessage>This reset link is missing its token. Please request a new one.</ErrorMessage>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Your new password must satisfy every requirement below.">
      <ErrorMessage>{error}</ErrorMessage>
      <SuccessMessage>{message}</SuccessMessage>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="New password" htmlFor="password" error={fieldError}>
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <PasswordStrength password={password} />
        <FormField label="Confirm new password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <SubmitButton isLoading={isLoading}>{isLoading ? 'Updating password' : 'Update password'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
