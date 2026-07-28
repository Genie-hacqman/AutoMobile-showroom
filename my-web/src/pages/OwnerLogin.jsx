import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../utils/ownerAuth';

export default function OwnerLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = signIn(password);
    if (ok) {
      navigate('/products/manage', { replace: true });
    } else {
      setError('Invalid password');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-24 text-slate-900">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-semibold">Owner sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the owner passphrase to access the dashboard (demo only).</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            name="password"
            type="password"
            placeholder="Owner passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          {error ? <div className="text-rose-600">{error}</div> : null}
          <div className="flex gap-3">
            <button className="rounded-full bg-slate-900 px-6 py-3 text-white">Sign in</button>
          </div>
        </form>
      </div>
    </main>
  );
}
