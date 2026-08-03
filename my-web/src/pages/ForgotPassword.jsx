import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import FormField, { inputClasses } from '../components/auth/FormField';
import { ErrorMessage, SubmitButton, SuccessMessage } from '../components/auth/Feedback';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const response = await api.forgotPassword(email);
      setMessage(response.message);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email on your account and we will send you a reset link."
      footer={
        <Link to="/login" className="font-medium text-slate-900 underline">
          Back to sign in
        </Link>
      }
    >
      <ErrorMessage>{error}</ErrorMessage>
      <SuccessMessage>{message}</SuccessMessage>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="Email address" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </FormField>
        <SubmitButton isLoading={isLoading}>{isLoading ? 'Sending link' : 'Send reset link'}</SubmitButton>
      </form>
    </AuthShell>
  );
}
