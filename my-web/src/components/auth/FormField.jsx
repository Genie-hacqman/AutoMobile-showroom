export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <label className="grid gap-2 text-sm" htmlFor={htmlFor}>
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? (
        <span className="text-xs text-rose-600" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const inputClasses =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900';
