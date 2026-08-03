import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField, { inputClasses } from '../components/auth/FormField';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import { ErrorMessage, SubmitButton, SuccessMessage } from '../components/auth/Feedback';
import { useAuth } from '../context/authContext';
import api from '../api/client';
import { evaluatePassword } from '../utils/passwordStrength';

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-6 grid gap-4">{children}</div>
    </section>
  );
}

export default function Profile() {
  const { user, isAdmin, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || '',
  });
  const [profileState, setProfileState] = useState({ error: '', success: '', loading: false, fields: {} });

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordState, setPasswordState] = useState({ error: '', success: '', loading: false });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileState({ error: '', success: '', loading: true, fields: {} });
    try {
      await updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone || null,
        profile_image: profileForm.profile_image || null,
      });
      setProfileState({ error: '', success: 'Profile updated', loading: false, fields: {} });
    } catch (error) {
      setProfileState({
        error: error.message,
        success: '',
        loading: false,
        fields: error.fieldErrors || {},
      });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!evaluatePassword(passwordForm.next).isValid) {
      setPasswordState({ error: 'Please satisfy every password requirement', success: '', loading: false });
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordState({ error: 'Passwords do not match', success: '', loading: false });
      return;
    }

    setPasswordState({ error: '', success: '', loading: true });
    try {
      await api.changePassword(passwordForm.current, passwordForm.next);
      setPasswordState({
        error: '',
        success: 'Password updated. Please sign in again.',
        loading: false,
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error) {
      setPasswordState({ error: error.message, success: '', loading: false });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(error.message);
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900 sm:px-10 sm:py-20">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={`${user.first_name} ${user.last_name}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-semibold">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {user?.role} {user?.is_verified ? '· verified' : '· email not verified'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Link
                to="/admin/users"
                className="rounded-full border border-slate-200 px-5 py-2 text-sm transition hover:bg-slate-100"
              >
                Admin dashboard
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white transition hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
        </header>

        {!user?.is_verified ? (
          <SuccessMessage>
            Your email is not verified yet. Check your inbox for the verification link.
          </SuccessMessage>
        ) : null}

        <Card title="Profile details" description="Update the information shown across your garage.">
          <ErrorMessage>{profileState.error}</ErrorMessage>
          <SuccessMessage>{profileState.success}</SuccessMessage>
          <form onSubmit={handleProfileSubmit} className="grid gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="first_name" error={profileState.fields.first_name}>
                <input
                  id="first_name"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Last name" htmlFor="last_name" error={profileState.fields.last_name}>
                <input
                  id="last_name"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className={inputClasses}
                />
              </FormField>
            </div>
            <FormField label="Phone" htmlFor="phone" error={profileState.fields.phone}>
              <input
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="+234 801 234 5678"
                className={inputClasses}
              />
            </FormField>
            <FormField
              label="Profile image URL"
              htmlFor="profile_image"
              hint="Must be an absolute https link to an image."
              error={profileState.fields.profile_image}
            >
              <input
                id="profile_image"
                name="profile_image"
                value={profileForm.profile_image}
                onChange={handleProfileChange}
                placeholder="https://..."
                className={inputClasses}
              />
            </FormField>
            <SubmitButton isLoading={profileState.loading}>
              {profileState.loading ? 'Saving' : 'Save changes'}
            </SubmitButton>
          </form>
        </Card>

        <Card title="Change password" description="You will be signed out of every device afterwards.">
          <ErrorMessage>{passwordState.error}</ErrorMessage>
          <SuccessMessage>{passwordState.success}</SuccessMessage>
          <form onSubmit={handlePasswordSubmit} className="grid gap-4" noValidate>
            <FormField label="Current password" htmlFor="current">
              <PasswordInput
                id="current"
                name="current"
                value={passwordForm.current}
                onChange={(event) => setPasswordForm((previous) => ({ ...previous, current: event.target.value }))}
                autoComplete="current-password"
              />
            </FormField>
            <FormField label="New password" htmlFor="next">
              <PasswordInput
                id="next"
                name="next"
                value={passwordForm.next}
                onChange={(event) => setPasswordForm((previous) => ({ ...previous, next: event.target.value }))}
                autoComplete="new-password"
              />
            </FormField>
            <PasswordStrength password={passwordForm.next} />
            <FormField label="Confirm new password" htmlFor="confirm">
              <PasswordInput
                id="confirm"
                name="confirm"
                value={passwordForm.confirm}
                onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirm: event.target.value }))}
                autoComplete="new-password"
              />
            </FormField>
            <SubmitButton isLoading={passwordState.loading}>
              {passwordState.loading ? 'Updating' : 'Update password'}
            </SubmitButton>
          </form>
        </Card>

        <Card title="Delete account" description="This removes your account and personal data permanently.">
          <ErrorMessage>{deleteError}</ErrorMessage>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="justify-self-start rounded-full border border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            {isDeleting ? 'Deleting account...' : 'Delete my account'}
          </button>
        </Card>
      </div>
    </main>
  );
}
