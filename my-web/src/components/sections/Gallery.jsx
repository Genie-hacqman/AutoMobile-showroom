import { Link } from "react-router-dom";

// This gallery showcases a few signature vehicles in a way that feels like flipping through a curated showroom wall.
const galleryItems = [
  {
    title: "Precision Performance",
    image: "/images/BMW_M3_G80.png",
  },
  {
    title: "Luxury Comfort",
    image: "/images/2021_Mercedes-AMG_GLE_53.png",
  },
  {
    title: "Bold Styling",
    image: "/images/LAMBORGHINI_URUS_PERFORMANTE_2024.png",
  },
  {
    title: "Modern Heritage",
    image: "/images/BMW_M4_2024.png",
  },
];

// This section gives visitors a polished snapshot of the collection and nudges them toward the full inventory.
export default function Gallery() {
  return (
    <section className="bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="uppercase tracking-[0.35em] text-sm text-yellow-400">Showroom Highlights</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The collection that defines modern luxury.</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300"
          >
            See All Models
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {galleryItems.map((item) => (
            <article key={item.title} className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl shadow-black/20 transition hover:-translate-y-1">
              <img
                src={item.image}
                alt={item.title}
                className="h-72 w-full bg-slate-900/70 object-contain p-4 transition duration-300 group-hover:scale-105"
              />
              <div className="p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-yellow-400">Featured</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
