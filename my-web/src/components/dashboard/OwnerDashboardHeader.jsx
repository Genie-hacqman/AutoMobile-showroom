// File: src/components/dashboard/OwnerDashboardHeader.jsx — Hero header used on the owner dashboard.


export default function OwnerDashboardHeader({ title, subtitle, badge }) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl shadow-slate-900/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-400">{badge}</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
          Local storage • fast and private management
        </div>
      </div>
    </div>
  );
}
