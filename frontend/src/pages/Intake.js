import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import { useToast } from '../context/ToastContext';

const Intake = () => {
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', serial: '', hours: '',
    capacity_lbs: '', mast_type: '', lift_height_inches: '',
    power_type: '', battery_info: '', condition_notes: '',
    purchase_price: '', additional_context: ''
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const analyzePhotos = async (files) => {
    if (files.length === 0) return;

    setAnalyzing(true);
    try {
      const firstPhoto = files[0];
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(firstPhoto);
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Error reading file'));
      });

      const response = await api.post('/api/vision/analyze', {
        imageBase64: base64Image
      });

      const { make, model, year, condition_notes } = response.data;

      setFormData(prev => ({
        ...prev,
        make: make || prev.make,
        model: model || prev.model,
        year: year || prev.year,
        condition_notes: condition_notes || prev.condition_notes
      }));

      setSuccess('Photo analyzed! Form auto-filled.');
      addToast('Photo analyzed! Form auto-filled.', 'success');
    } catch (err) {
      console.error('Vision AI error:', err);
      setError('Vision AI failed, please fill form manually');
      addToast('Vision AI failed, please fill form manually', 'warning');
    } finally {
      setAnalyzing(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    setPhotos([...photos, ...acceptedFiles]);
    analyzePhotos(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        images: photos.map(p => p.name)
      };

      const response = await api.post('/api/inventory', payload);

      if (response.status === 201) {
        setSuccess('Inventory added successfully!');
        addToast('Equipment added to inventory!', 'success');
        setFormData({
          make: '', model: '', year: '', serial: '', hours: '',
          capacity_lbs: '', mast_type: '', lift_height_inches: '',
          power_type: '', battery_info: '', condition_notes: '',
          purchase_price: '', additional_context: ''
        });
        setPhotos([]);
      }
    } catch (err) {
      setError('Failed to add inventory. Please try again.');
      addToast('Failed to add inventory', 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Intake</h2>
          <p className="mt-1 text-sm text-gray-500">Add new equipment to your inventory</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 lg:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" aria-live="polite">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm" aria-live="polite">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Photo Upload */}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 lg:p-8 mb-6 text-center cursor-pointer transition-colors min-h-[120px] flex items-center justify-center ${
              isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-500'
            }`}>
              <input {...getInputProps()} />
              {analyzing ? (
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-brand-500 mb-2" fill="none" viewBox="0 0 24 24" aria-label="Loading">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-base text-brand-600 font-medium">Analyzing photo with AI...</p>
                </div>
              ) : isDragActive ? (
                <p className="text-base text-brand-600 font-medium">Drop photos here...</p>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-base text-gray-600">Drag & drop photos, or tap to select</p>
                  <p className="text-sm text-gray-500 mt-1">{photos.length} uploaded</p>
                </div>
              )}
            </div>

            {/* Form Fields — stacked labels, full-width on mobile */}
            <div className="space-y-4 lg:space-y-5">
              {/* Make / Model / Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1.5">Make *</label>
                  <input id="make" name="make" placeholder="e.g. Raymond" value={formData.make} onChange={handleChange} required
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1.5">Model *</label>
                  <input id="model" name="model" placeholder="e.g. 7500" value={formData.model} onChange={handleChange} required
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                  <input id="year" name="year" type="number" placeholder="e.g. 2019" value={formData.year} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              {/* Serial / Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1.5">Serial Number</label>
                  <input id="serial" name="serial" placeholder="Serial Number" value={formData.serial} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1.5">Hour Meter</label>
                  <input id="hours" name="hours" type="number" placeholder="Hours" value={formData.hours} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              {/* Capacity / Mast / Lift Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="capacity_lbs" className="block text-sm font-medium text-gray-700 mb-1.5">Capacity (lbs)</label>
                  <input id="capacity_lbs" name="capacity_lbs" type="number" placeholder="e.g. 5000" value={formData.capacity_lbs} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="mast_type" className="block text-sm font-medium text-gray-700 mb-1.5">Mast Type</label>
                  <input id="mast_type" name="mast_type" placeholder="e.g. Triple" value={formData.mast_type} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="lift_height_inches" className="block text-sm font-medium text-gray-700 mb-1.5">Lift Height (in)</label>
                  <input id="lift_height_inches" name="lift_height_inches" type="number" placeholder="e.g. 240" value={formData.lift_height_inches} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              {/* Power Type / Battery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="power_type" className="block text-sm font-medium text-gray-700 mb-1.5">Power Type</label>
                  <select id="power_type" name="power_type" value={formData.power_type} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                    <option value="">Select Power Type</option>
                    <option value="electric">Electric</option>
                    <option value="propane">Propane</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="battery_info" className="block text-sm font-medium text-gray-700 mb-1.5">Battery Info</label>
                  <input id="battery_info" name="battery_info" placeholder="If electric" value={formData.battery_info} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              {/* Condition Notes */}
              <div>
                <label htmlFor="condition_notes" className="block text-sm font-medium text-gray-700 mb-1.5">Condition Notes</label>
                <textarea id="condition_notes" name="condition_notes" placeholder="Describe the condition..." value={formData.condition_notes} onChange={handleChange} rows="3"
                  className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"></textarea>
              </div>

              {/* Purchase Price / Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Price</label>
                  <input id="purchase_price" name="purchase_price" type="number" placeholder="$0" value={formData.purchase_price} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="additional_context" className="block text-sm font-medium text-gray-700 mb-1.5">Additional Context</label>
                  <input id="additional_context" name="additional_context" placeholder="e.g. Maryland lot" value={formData.additional_context} onChange={handleChange}
                    className="w-full px-4 py-3 lg:py-2.5 border border-gray-300 rounded-lg text-base lg:text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 text-white py-3.5 lg:py-3 px-6 rounded-lg font-semibold hover:bg-brand-500 transition-colors text-base min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-label="Loading">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {submitting ? 'Submitting...' : 'Submit Inventory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Intake;
