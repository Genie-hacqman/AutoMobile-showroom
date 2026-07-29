import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductBrand, getProducts } from '../data/productsStore';

export default function Products() {
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');
  const [products, setProducts] = useState(() => getProducts());

  useEffect(() => {
    const syncProducts = () => setProducts(getProducts());

    syncProducts();
    window.addEventListener('products-updated', syncProducts);

    return () => window.removeEventListener('products-updated', syncProducts);
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const rawBrands = [...new Set(products.map((product) => getProductBrand(product)))];
  const featuredBrands = ['Toyota', 'Mercedes-Benz', 'BMW', 'Lexus', 'Honda', 'Audi', 'Ford'];
  const brands = [
    'All',
    ...featuredBrands.filter((name) => rawBrands.includes(name)),
    ...rawBrands.filter((name) => !featuredBrands.includes(name)).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredProducts = useMemo(() => {
    const byCategory = category === 'All' ? products : products.filter((product) => product.category === category);
    const byBrand = brand === 'All' ? byCategory : byCategory.filter((product) => getProductBrand(product) === brand);

    return [...byBrand].sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
  }, [brand, category, products, sortOrder]);

  return (
    <main className="bg-slate-50 min-h-screen py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="mb-8 rounded-4xl border border-yellow-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] xl:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">Inventory</p>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Browse Our Collection</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300">
                Find the perfect performance vehicle from our curated selection of premium cars.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {brands.map((brandName) => (
                <button
                  type="button"
                  key={brandName}
                  onClick={() => setBrand(brandName)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${brand === brandName ? 'border-yellow-400 bg-yellow-400 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  {brandName === 'All' ? 'All Cars' : brandName}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm text-slate-900">
                <label className="mr-3 text-sm text-slate-600">Category</label>
                <select
                  id="product-category"
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  {categories.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm text-slate-900">
                <label className="mr-3 text-sm text-slate-600">Sort</label>
                <select
                  id="product-sort"
                  name="sort"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No vehicles found.</p>
            <p className="mt-3 text-slate-600">Try another search term or clear the filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-linear-to-b from-white to-slate-50 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-12px_rgba(15,23,42,0.24)] hover:ring-2 hover:ring-yellow-400/70">
                <div className="overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
                  <img src={product.image} alt={product.name} className="h-72 w-full object-contain p-4 transition duration-500 group-hover:scale-105" />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600">
                      {product.category}
                    </p>
                    <span className="text-base font-bold text-slate-900">${product.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>
                  </div>
                  <Link to={`/products/${product.id}`} className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
