// frontend/src/components/LeadForm.js
import React, { useState } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    interest: 'Reach Truck',
    source: 'website'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/api/leads', {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        source: formData.source,
        interest: [formData.interest]
      });

      setSuccess(true);
      addToast('Lead submitted successfully!', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        interest: 'Reach Truck',
        source: 'website'
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit lead. Please try again.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-5 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800">Get Started</h2>

      {success && (
        <div className="mb-5 p-4 bg-green-50 border-l-4 border-green-500 text-green-700" aria-live="polite">
          <p className="font-semibold">Success!</p>
          <p className="text-sm">We've received your information and will be in touch shortly.</p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700" aria-live="polite">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Your full name"
            required
            aria-required="true"
            aria-invalid={!!error && error === 'Name is required'}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5" htmlFor="phone">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5" htmlFor="company">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1.5" htmlFor="interest">
            I'm interested in
          </label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Reach Truck">Reach Truck</option>
            <option value="Order Picker">Order Picker</option>
            <option value="Sit-Down Forklift">Sit-Down Forklift</option>
            <option value="Swing Reach">Swing Reach</option>
            <option value="Pallet Jack">Pallet Jack</option>
            <option value="Other">Other Equipment</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 lg:py-3 px-4 rounded-lg font-semibold text-white text-base transition-colors min-h-[48px] flex items-center justify-center ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-500'
          }`}
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-label="Loading">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 text-center">
        We respect your privacy. Your information will never be shared.
      </p>
    </div>
  );
};

export default LeadForm;
