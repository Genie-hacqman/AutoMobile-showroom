import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage, SuccessMessage } from '../components/auth/Feedback';
import { inputClasses } from '../components/auth/FormField';
import api from '../api/client';
import { useAuth } from '../context/authContext';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await api.adminListUsers({ page, page_size: PAGE_SIZE, search });
        if (cancelled) return;
        setUsers(response.items);
        setTotal(response.total);
        setError('');
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, search, reloadKey]);

  const reload = () => {
    setIsLoading(true);
    setReloadKey((previous) => previous + 1);
  };

  const mutate = async (action, successMessage) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      reload();
    } catch (mutationError) {
      setError(mutationError.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900 sm:px-10 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">User accounts</h1>
            <p className="mt-1 text-sm text-slate-600">{total} registered account(s)</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setIsLoading(true);
                setSearch(event.target.value);
              }}
              placeholder="Search name or email"
              className={`${inputClasses} sm:w-72`}
            />
            <Link
              to="/profile"
              className="rounded-full border border-slate-200 px-5 py-2 text-sm transition hover:bg-slate-100"
            >
              Back to profile
            </Link>
          </div>
        </header>

        <ErrorMessage>{error}</ErrorMessage>
        <SuccessMessage>{message}</SuccessMessage>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading accounts...
                  </td>
                </tr>
              ) : null}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No accounts match this search.
                  </td>
                </tr>
              ) : null}
              {!isLoading
                ? users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-medium">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 uppercase text-xs tracking-wide text-slate-500">{user.role}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.id === currentUser?.id ? (
                          <span className="text-xs text-slate-400">This is you</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                mutate(
                                  () => api.adminUpdateUser(user.id, { is_active: !user.is_active }),
                                  user.is_active ? 'User deactivated' : 'User reactivated',
                                )
                              }
                              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs transition hover:bg-slate-100"
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                mutate(
                                  () =>
                                    api.adminUpdateUser(user.id, {
                                      role: user.role === 'admin' ? 'user' : 'admin',
                                    }),
                                  'Role updated',
                                )
                              }
                              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs transition hover:bg-slate-100"
                            >
                              {user.role === 'admin' ? 'Make user' : 'Make admin'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!window.confirm(`Delete ${user.email}?`)) return;
                                mutate(() => api.adminDeleteUser(user.id), 'User deleted');
                              }}
                              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            className="rounded-full border border-slate-200 px-5 py-2 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((previous) => previous + 1)}
            className="rounded-full border border-slate-200 px-5 py-2 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
