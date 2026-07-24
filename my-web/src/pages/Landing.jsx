// File: src/pages/Landing.jsx — Marketing landing page composed of sections (hero, products, gallery).
import Hero from "../components/sections/Hero";
import LandingProducts from "../components/sections/LandingProduct";
import Gallary from "../components/sections/Gallery";
import Footer from "../components/sections/Footer";

export default function Landing() {
  return (
    <div>
      <Hero/>
      <LandingProducts/>
      <Gallary/>
      <Footer/>
    </div>
  );
}