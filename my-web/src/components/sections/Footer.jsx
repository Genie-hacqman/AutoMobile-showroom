import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";



export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 sm:px-8 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-3">


            {/* This intro helps visitors understand what the brand stands for. */}


            <h2 className="text-2xl font-bold">Obolo Motors</h2>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Premium car sourcing and international delivery made simple. Connect with us on social media for updates, featured models, and exclusive offers.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              {/* Quick links keep key legal and contact pages easy to reach. */}


              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Quick links</p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-300">
                <Link to="/privacy" className="transition hover:text-white">
                  Privacy
                </Link>
                <Link to="/terms" className="transition hover:text-white">
                  Terms
                </Link>
                <Link to="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              {/* Social links give visitors a few simple ways to keep in touch with the brand. */}


              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Follow us</p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-100 transition hover:bg-yellow-500 hover:text-slate-950"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-100 transition hover:bg-yellow-500 hover:text-slate-950"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-100 transition hover:bg-yellow-500 hover:text-slate-950"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-100 transition hover:bg-yellow-500 hover:text-slate-950"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* This bottom bar quietly closes the footer with a polished brand message and a helpful disclaimer. */}

      
      <div className="border-t border-slate-800 px-5 py-6 text-center text-sm text-slate-500 sm:px-8 lg:px-16">
        <p>
          © {new Date().getFullYear()} Obolo Motors. All rights reserved. Crafted for global car buyers with transparency, trust, and premium delivery.
        </p>
        <p className="mt-3 max-w-4xl mx-auto leading-6 text-slate-400">
          Disclaimer: All vehicle prices, specifications, availability, promotions, and financing offers are subject to change without prior notice. While Obolo Automobile strives for accuracy, we cannot guarantee that all information on this website is free from errors. Please contact our team to confirm the latest details before making a purchase decision.
        </p>
      </div>
    </footer>
  );
}
