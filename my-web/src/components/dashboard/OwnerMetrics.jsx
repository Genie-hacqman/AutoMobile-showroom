import { formatCurrency } from '../../utils/dashboardUtils';

export default function OwnerMetrics({ stats }) {
  const cards = [
    {
      key: 'totalVehicles',
      value: stats.totalVehicles,
      label: 'Active listings',
      accent: 'from-amber-400 to-yellow-300',
    },
    {
      key: 'averageValue',
      value: formatCurrency(stats.averageValue),
      label: 'Average value',
      accent: 'from-slate-700 to-slate-900',
    },
    {
      key: 'categories',
      value: stats.categories.length,
      label: 'Categories',
      accent: 'from-emerald-500 to-emerald-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`h-2 rounded-full bg-linear-to-r ${card.accent}`} />
          <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
          <p className="mt-2 text-sm text-slate-600">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
