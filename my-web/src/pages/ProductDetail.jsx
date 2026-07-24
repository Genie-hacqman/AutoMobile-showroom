// File: src/pages/ProductDetail.jsx — Detailed vehicle page showing specs and description.
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../data/productsStore";

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);

  useEffect(() => {
    if (!product) {
      document.title = "Product Not Found | Obolo Motors";
      return;
    }

    document.title = `${product.name} | Obolo Motors`;

    const existingMeta = document.querySelector('meta[name="description"]');
    const description = product.description;

    if (existingMeta) {
      existingMeta.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [product]);

  if (!product) {
    return (
      <main className="bg-slate-50 min-h-screen py-16 text-slate-900">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h1 className="text-5xl font-bold">Product Not Found</h1>
          <p className="mt-4 text-lg text-slate-600">We couldn't locate that vehicle. Please browse our available inventory.</p>
          <Link
            to="/products"
            className="mt-8 inline-flex rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
          >
            Back to Inventory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:items-start">
          <div className="rounded-4xl overflow-hidden bg-white shadow-xl">
            <img
              src={product.image}
              alt={product.name}
              className="h-105 w-full bg-white object-contain p-6 sm:h-130 lg:h-155"
            />
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">{product.category}</p>
              <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{product.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{product.description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-lg font-semibold text-slate-900">
                  ${product.price.toLocaleString()}
                </span>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
                >
                  Reserve Inquiry
                </Link>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-900">Performance</h2>
                <p className="mt-3 text-slate-600">Engineered to deliver exceptional power, control, and comfort for every drive.</p>
              </div>
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-900">Luxury Details</h2>
                <p className="mt-3 text-slate-600">A refined cabin and premium finishes ensure a premium ownership experience.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900">Vehicle specs</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Engine</p>
                  <p className="mt-2 text-slate-700">{product.specs?.engine || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Transmission</p>
                  <p className="mt-2 text-slate-700">{product.specs?.transmission || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Mileage</p>
                  <p className="mt-2 text-slate-700">{product.specs?.mileage || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Power</p>
                  <p className="mt-2 text-slate-700">{product.specs?.power || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
