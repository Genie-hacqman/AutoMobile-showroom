// File: src/components/dashboard/OwnerInventoryTable.jsx — Table-like list showing current inventory for the owner.
export default function OwnerInventoryTable({ products, editingId, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Live inventory</h3>
      </div>

      <div className="divide-y divide-slate-200">
        {products.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-600">
            No cars are listed yet. Add the first vehicle to open the showroom.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 gap-4 px-5 py-4 items-center md:grid-cols-3 lg:grid-cols-4"
            >
              <div className="flex items-start gap-4 md:col-span-2 lg:col-span-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                  {product.category?.slice(0, 2).toUpperCase() || 'VE'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-600 truncate">{product.category} • ${Number(product.price || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 md:justify-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="whitespace-nowrap rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {editingId === product.id ? 'Editing' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="whitespace-nowrap rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
