import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import NavLinks from '../ui/NavLinks';
import MobileMenu from '../ui/MobileMenu';

function SearchField({ value, onValueChange }) {
  return (
    <input
      name="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      type="search"
      placeholder="Search cars"
      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
    />
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') || '');
  const urlSearch = new URLSearchParams(location.search).get('search') || '';

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    }

    const nextSearch = params.toString() ? `?${params.toString()}` : '';
    setSearchTerm(trimmedSearch);
    navigate(`/products${nextSearch}`);
  };

  return (
    <nav className="bg-white text-slate-900 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-10 sm:py-5">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <img src="https://ik.imagekit.io/genescreative/logo%20image.png" alt="Obolo Motors logo" className="h-10 w-auto" />
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">OBOLO MOTORS</h1>
            </button>
          </div>

          <div className="hidden lg:flex lg:justify-center lg:gap-10">
            <NavLinks to="/landing" label="Marketplace" />
            <NavLinks to="/products" label="Inventory" />
            <NavLinks to="/about" label="Heritage" />
            <NavLinks to="/contact" label="Support" />
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-end lg:gap-4">
            <form
              className="flex w-full max-w-xs items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 shadow-sm sm:max-w-sm"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearchSubmit();
              }}
            >
              <SearchField value={searchTerm || urlSearch} onValueChange={setSearchTerm} />
              <button
                type="submit"
                aria-label="Search inventory"
                className="rounded-full p-2 text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <FaSearch className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              My Garage
            </button>
            <FaShoppingCart className="h-5 w-5 text-slate-900 sm:h-6 sm:w-6" />
          </div>

          <MobileMenu
            pathname={location.pathname}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onNavigateToProducts={handleSearchSubmit}
          />
        </div>
      </div>
    </nav>
  );
}
