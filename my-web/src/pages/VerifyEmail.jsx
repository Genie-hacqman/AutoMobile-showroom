import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import FormField, { inputClasses } from '../components/auth/FormField';
import { ErrorMessage, SubmitButton, SuccessMessage } from '../components/auth/Feedback';
import api from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'missing-token');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;

    api
      .verifyEmail(token)
      .then((response) => {
        setMessage(response.message);
        setStatus('verified');
      })
      .catch((verificationError) => {
        setError(verificationError.message);
        setStatus('failed');
      });
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsResending(true);
    try {
      const response = await api.resendVerification(email);
      setMessage(response.message);
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Confirming your email address keeps your Obolo Motors account secure."
      footer={
        <Link to="/login" className="font-medium text-slate-900 underline">
          Go to sign in
        </Link>
      }
    >
      {status === 'verifying' ? (
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Verifying your email...
        </div>
      ) : null}

      <SuccessMessage>{message}</SuccessMessage>
      <ErrorMessage>{error}</ErrorMessage>

      {status !== 'verified' && status !== 'verifying' ? (
        <form onSubmit={handleResend} className="grid gap-4" noValidate>
          <FormField label="Send a new verification link" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </FormField>
          <SubmitButton isLoading={isResending}>
            {isResending ? 'Sending' : 'Resend verification email'}
          </SubmitButton>
        </form>
      ) : null}
    </AuthShell>
  );
}
