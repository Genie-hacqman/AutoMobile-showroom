import { useState } from "react";
import { FaBars, FaShoppingCart, FaTimes } from "react-icons/fa";
import NavLinks from "./NavLinks";

// This mobile menu gives smaller screens a compact way to browse the site without crowding the layout.
export default function MobileMenu({ searchTerm, setSearchTerm, onNavigateToProducts }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMenuOpen((current) => !current);
  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      {/* This button toggles the compact navigation panel on small screens. */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {menuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
      </button>

      {/* The panel slides in and out with a gentle transition so it feels light and responsive. */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? "max-h-155 opacity-100" : "max-h-0 opacity-0"
        } lg:hidden`}
      >
        <div className="flex flex-col gap-6 border-t border-slate-200 pt-4 text-slate-600">
          <div className="flex flex-col gap-4">
            <NavLinks to="/landing" label="Marketplace" onClick={closeMobileMenu} />
            <NavLinks to="/products" label="Inventory" onClick={closeMobileMenu} />
            <NavLinks to="/about" label="Heritage" onClick={closeMobileMenu} />
            <NavLinks to="/contact" label="Support" onClick={closeMobileMenu} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 shadow-sm">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                type="search"
                placeholder="Search cars"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onNavigateToProducts();
              }}
              className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              My Garage
            </button>
            <FaShoppingCart className="h-5 w-5 text-slate-900 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>
    </>
  );
}
