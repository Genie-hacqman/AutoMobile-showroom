import { Link } from 'react-router-dom';


export default function About() {
  return (
    <main className="bg-slate-50 min-h-screen py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="mb-12 rounded-3xl bg-white p-8 shadow-lg sm:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">About Obolo Motors</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Luxury cars, trusted service, timeless experiences.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Obolo Motors connects premium buyers with exceptional automobiles through transparent sourcing, personalized support, and a curated showroom experience. Our team makes every step of ownership feel effortless, from first inquiry through vehicle delivery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Curated Selection</h2>
            <p className="mt-4 text-slate-600">
              Every vehicle is handpicked for quality, performance, and prestige. We focus on the models that define the driving experience.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Expert Guidance</h2>
            <p className="mt-4 text-slate-600">
              Our specialists help you find the right car, understand financing options, and arrange delivery with confidence.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Dedicated Support</h2>
            <p className="mt-4 text-slate-600">
              Enjoy premium service before and after purchase, including inspection assistance, trade-in support, and concierge scheduling.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-3xl bg-slate-900 p-10 text-white shadow-xl sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">Our promise</p>
              <h2 className="mt-3 text-3xl font-bold">Explore the finest luxury vehicles with confidence.</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
            >
              Browse Inventory
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
