import Hero from "../components/sections/Hero";
import BrandStrip from "../components/sections/BrandStrip";
import LandingProducts from "../components/sections/LandingProduct";
import Gallary from "../components/sections/Gallery";
import Footer from "../components/sections/Footer";

export default function Landing() {
  return (
    <div>
      <Hero />
      <LandingProducts />
      <BrandStrip />
      <Gallary />
      <Footer />
    </div>
  );
}