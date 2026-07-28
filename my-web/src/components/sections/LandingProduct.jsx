


const testimonials = [
  {
    id: "testimonial-1",
    quote: "Obolo Motors delivered my dream car faster than expected. The process was seamless and the communication was outstanding.",
    author: "Odonti",
    role: "Private Buyer",
    initials: "O",
  },
  {
    id: "testimonial-2",
    quote: "The team helped me source a rare model and managed shipping with zero surprises. Highly recommend for international purchases.",
    author: "Marcus",
    role: "Customer",
    initials: "M",
  },
  {
    id: "testimonial-3",
    quote: "Everything arrived exactly as promised. The import paperwork was handled professionally, and the car looked perfect.",
    author: "Kennedy",
    role: "Import Client",
    initials: "K",
  },
];



const productHighlights = [
  {
    id: "highlight-1",
    title: "Curated premium engine choices",
    subtitle: "From sports sedans to luxury SUVs, every car is handpicked for performance and quality.",
  },
  {
    id: "highlight-2",
    title: "Transparent sourcing and shipping",
    subtitle: "We handle inspection, paperwork, and delivery so you get a seamless import experience.",
  },
  {
    id: "highlight-3",
    title: "Global delivery for international buyers",
    subtitle: "Customer-first logistics with real-time updates and secure transport worldwide.",
  },
];

export default function LandingProducts() {
  return (
    <section className="bg-white py-16 text-slate-900">


      {/* Main layout container for the landing product section */}


      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            {/* Intro heading and summary text */}
            <p className="uppercase tracking-[0.35em] text-sm text-yellow-500">Quality Assurance</p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Premium models ready for delivery</h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Obolo Motors connects international buyers with premium U.S. vehicles. We source the finest sports cars, luxury SUVs, and performance sedans, inspecting and shipping each model with care so your purchase arrives ready to drive.
            </p>

            {/* Highlight cards for key selling points */}


            <div className="grid gap-4 sm:grid-cols-2">
              {productHighlights.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">Featured</p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Render each testimonial as a customer story card */}

            
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`relative overflow-hidden rounded-4xl border border-slate-200 p-8 shadow-sm transition ${
                  index === 1 ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
                }`}
              >
                <div className="absolute -left-3 -top-3 h-16 w-16 rounded-full bg-yellow-400/90 blur-xl" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.author}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="relative mt-6 rounded-3xl border border-current p-6 text-base leading-7">
                  <span className="absolute left-6 top-3 text-4xl text-yellow-400/90">“</span>
                  <p className={index === 1 ? "text-slate-100" : "text-slate-700"}>{testimonial.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
