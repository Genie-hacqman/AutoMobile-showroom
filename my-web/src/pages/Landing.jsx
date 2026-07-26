// File: src/pages/Landing.jsx — Marketing landing page composed of sections (hero, products, gallery).
import Hero from "../components/sections/Hero";
import BrandStrip from "../components/sections/BrandStrip";
import LandingProducts from "../components/sections/LandingProduct";
import Gallary from "../components/sections/Gallery";
import Footer from "../components/sections/Footer";

export default function Landing() {
  return (
    <div>
      <Hero/>
      <BrandStrip />
      <LandingProducts/>
      <Gallary/>
      <Footer/>
    </div>
  );
}