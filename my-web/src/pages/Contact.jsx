import { useState } from 'react';
import { Link } from 'react-router-dom';

// This page gives visitors a simple way to get in touch while keeping the experience warm and polished.
export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  // This updates the form state as the visitor types so the submission payload stays current.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  // This sends the contact form to the API endpoint and updates the page with a friendly status message.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('pending');

    const endpoint = import.meta.env.VITE_CONTACT_API_URL || '/api/contact';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('submitted');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      console.error('Contact submission failed:', error);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-10 shadow-lg sm:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">Get in touch</p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Start your premium purchase journey.</h1>
            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
              We are here to answer your questions, arrange viewings, and help you choose the perfect vehicle. Reach out and a specialist will respond quickly.
            </p>

            <div className="mt-10 space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Email</p>
                <p className="mt-2 text-lg text-slate-900">sales@obolomotors.com</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Phone</p>
                <p className="mt-2 text-lg text-slate-900">+233 208 9249 35</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Location</p>
                <p className="mt-2 text-lg text-slate-900">Ghana, GH • Nationwide shipping available</p>
              </div>
            </div>

            <Link
              to="/products"
              className="mt-10 inline-flex rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View Available Cars
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-10 shadow-lg sm:p-12">
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Your name"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@email.com"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tell us what you’re looking for"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                />
              </div>
              {status === 'submitted' && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  Thank you! Your message has been received. We’ll follow up soon.
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                  Something went wrong while sending your message. Please try again.
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'pending'}
                className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'pending' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
