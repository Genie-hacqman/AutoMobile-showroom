import { brandLogos } from "../../data/brands";



const brands = Object.entries(brandLogos);

export default function BrandStrip() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/80 py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="relative flex overflow-hidden rounded-3xl border border-slate-200 bg-white/70 py-4 shadow-sm">
          <div className="marquee-track flex min-w-max items-center gap-4 sm:gap-6 lg:gap-8">


            {/* Duplicate the brands so the marquee loops smoothly without a visible jump. */}


            {[...brands, ...brands].map(([brand, logo], index) => (
              <div
                key={`${brand}-${index}`}
                className="flex h-20 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={`${brand} logo`}
                    className="h-12 w-full object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-700">{brand}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
