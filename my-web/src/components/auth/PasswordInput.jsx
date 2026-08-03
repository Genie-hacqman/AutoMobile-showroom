import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { inputClasses } from './FormField';

export default function PasswordInput({ id, name, value, onChange, placeholder, autoComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClasses} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((previous) => !previous)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition hover:text-slate-900"
      >
        {isVisible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
