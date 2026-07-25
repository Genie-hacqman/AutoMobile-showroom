// File: src/components/dashboard/OwnerVehicleForm.jsx — Form for creating and editing vehicle listings in the dashboard.
export default function OwnerVehicleForm({
  form,
  editingId,
  message,
  previewImage,
  onChange,
  onImageUpload,
  onSubmit,
  onReset,
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">Owner panel</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {editingId ? 'Update vehicle profile' : 'Create a new listing'}
          </h2>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Vehicle name"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />
        <input
          name="brand"
          value={form.brand}
          onChange={onChange}
          placeholder="Brand (e.g., Mercedes-Benz, BMW, Toyota)"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />
        <input
          name="category"
          value={form.category}
          onChange={onChange}
          placeholder="Category"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="Price"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />

        <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="mb-2 block font-semibold text-slate-700">Upload a car image</span>
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={onImageUpload}
            className="w-full"
          />
        </label>

        <input
          name="image"
          value={form.image}
          onChange={onChange}
          placeholder="Or paste an image URL"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />

        {previewImage ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <img
              src={previewImage}
              alt="Selected vehicle preview"
              className="h-48 w-full rounded-xl object-contain bg-white"
            />
          </div>
        ) : null}

        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description"
          rows="4"
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="specs.engine"
            value={form.specs.engine}
            onChange={onChange}
            placeholder="Engine"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
          />
          <input
            name="specs.transmission"
            value={form.specs.transmission}
            onChange={onChange}
            placeholder="Transmission"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
          />
          <input
            name="specs.mileage"
            value={form.specs.mileage}
            onChange={onChange}
            placeholder="Mileage"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
          />
          <input
            name="specs.power"
            value={form.specs.power}
            onChange={onChange}
            placeholder="Power"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-slate-400"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          {editingId ? 'Save changes' : 'Publish vehicle'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Clear form
        </button>
      </div>
    </form>
  );
}
