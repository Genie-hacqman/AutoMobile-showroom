export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {children}
    </div>
  );
}

export function SuccessMessage({ children }) {
  if (!children) return null;
  return (
    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {children}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-white/40 border-t-white ${className}`}
    />
  );
}

export function SubmitButton({ isLoading, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={isLoading || props.disabled}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-900">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        {label}...
      </div>
    </main>
  );
}
