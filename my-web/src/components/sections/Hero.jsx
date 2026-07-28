import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



const videos = [
  "https://ik.imagekit.io/genescreative/15530969_1080_1920_60fps.mp4",
  "https://ik.imagekit.io/genescreative/15530945_1080_1920_60fps.mp4",
  "https://ik.imagekit.io/genescreative/14228183-hd_1920_1080_60fps.mp4",
];



export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();



  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0">


        {/* Each video is layered in and faded in or out depending on which one is currently active. */}


        {videos.map((src, index) => (
          <video
            key={src}
            src={src}
            muted
            autoPlay
            loop
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* This dark overlay helps the text stay readable over the motion background. */}


        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 py-12 sm:px-8 lg:px-16">
        <div className="w-full max-w-3xl">
          <p className="uppercase tracking-[0.35em] text-sm text-yellow-400 sm:text-base">
            THE ART OF PERFORMANCE
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
            ELEVATING THE LUXURY DRIVING EXPERIENCE
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-100 sm:text-2xl">
            Connecting buyers with premium automobiles through trusted dealerships, exceptional quality, and outstanding service.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">


            {/* This button sends visitors straight into the inventory. */}


            <button
              onClick={() => navigate("/products")}
              className="inline-flex w-full items-center justify-center rounded bg-yellow-400 px-6 py-3 text-black transition hover:bg-yellow-300 sm:w-auto"
            >
              Get Yours Now
            </button>


            {/* This button invites people to start a conversation with the team. */}


            <button
              onClick={() => navigate("/contact")}
              className="inline-flex w-full items-center justify-center rounded border border-white bg-white/10 px-6 py-3 text-white transition hover:bg-white/20 sm:w-auto"
            >
              Experience It Firsthand
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}