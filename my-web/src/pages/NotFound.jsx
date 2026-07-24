// File: src/pages/NotFound.jsx — 404 page shown when a route is not found.
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-6 py-24 text-white">
      <div className="w-full max-w-3xl rounded-4xl border border-slate-800 bg-slate-950/90 p-10 text-center shadow-2xl shadow-black/20 sm:p-16">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">Page not found</p>
        <h1 className="mt-6 text-6xl font-bold tracking-tight sm:text-7xl">404</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          The page you are looking for does not exist, but your next luxury ride is still waiting.
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex rounded-full bg-yellow-400 px-8 py-4 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
