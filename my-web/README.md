# AutoMobile Showroom

Welcome — this repository is a lightweight, modern showroom web app for listing and browsing vehicles. It’s built with React + Vite and styled with utility classes. The app doubles as a friendly demo for an owner/admin dashboard where vehicle listings (including technical specs) are managed.

Whether you’re evaluating the UI patterns or using this as a starting point for a real inventory site, this README will help you get started and understand where to add vehicle specifications.

**Quick snapshot**

- Purpose: Showcase a curated vehicle inventory with detail pages and an owner dashboard for adding/editing listings.
- Stack: Vite, React, React Router, Tailwind-style utility classes (class names indicate a utility-first approach), vanilla JS for a simple local-storage-backed data store.

## What’s in this project

- `src/pages/Products.jsx` — inventory listing (browse and filter by brand/category, sort by price).
- `src/pages/ProductDetail.jsx` — full vehicle page that displays `specs` (engine, transmission, mileage, power).
- `src/components/dashboard/OwnerVehicleForm.jsx` — form used in the dashboard to create or update listings (includes fields for the specs).
- `src/data/products.js` — canonical list of vehicle objects (add default entries and their specs here).
- `src/data/productsStore.js` — local-storage backed store that normalizes and persists `specs` and other product fields.

## Add or update vehicle specs

To add technical specifications for a vehicle, edit the corresponding object inside `src/data/products.js` and add a `specs` block with these fields:

```js
specs: {
	engine: "3.0L Twin‑Turbo",
	transmission: "9‑Speed Automatic",
	mileage: "12,000 km",
	power: "375 hp",
}
```

The app will show these values on the product detail page. The owner dashboard form (`src/components/dashboard/OwnerVehicleForm.jsx`) already exposes inputs for the same `specs` keys so admin users can update listings at runtime.

## Getting started (development)

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

3. Open your browser at the URL printed by Vite (usually `http://localhost:5173`).

Build for production

```bash
npm run build
npm run preview
```

## Tests

There are a couple of simple tests in the `src/data` and `src/utils` directories. Run the test suite with:

```bash
npm test
```

## Contributing

I value small, focused changes. If you want to add more specs fields, UI polish, or a backend, please open a PR with:

- a short description of the change
- before/after screenshots for visual updates
- any migration notes for data shape changes (e.g., new `specs` keys)

If you prefer I implement a small enhancement (example: add horsepower sorting or export inventory CSV), tell me what you want and I’ll draft the change.

## License

This project is provided as-is for demo and learning purposes. If you want a permissive license applied (e.g., MIT), say so and I’ll add it.

## Contact / Notes

If anything in the app is unclear, or you want me to populate `specs` for all vehicles, I can update `src/data/products.js` directly. Happy to help make this showroom feel more real — just tell me which cars to enrich or what tone you prefer for descriptions.

— a friendly pair-programmer
