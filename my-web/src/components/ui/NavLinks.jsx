import { Link } from "react-router-dom";

// This small link component keeps the navigation styling consistent wherever it shows up.

export default function NavLinks({ to, link, label, onClick }) {
  return (
    <Link
      to={to || link}
      onClick={onClick}
      className="text-slate-600 hover:text-slate-900 transition duration-300 ease-out transform hover:-translate-y-0.5 hover:scale-105"
    >
      {label}
    </Link>
  );
}
