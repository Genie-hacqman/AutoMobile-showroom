import { Link } from 'react-router-dom';

// Shared card used by every auth screen so they inherit the showroom look and feel.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900 sm:px-10 sm:py-24">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <Link to="/" className="text-sm text-slate-500 transition hover:text-slate-900">
            &larr; Back to showroom
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">{footer}</div> : null}
      </div>
    </main>
  );
}
