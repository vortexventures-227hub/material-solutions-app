import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Layout, PageHeader } from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  ChevronRight,
  X
} from 'lucide-react';

const Intake = () => {
  const navigate = useNavigate();
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
      addToast('Please upload at least one photo', 'error');
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
        // Optional: redirect to inventory
        setTimeout(() => navigate('/inventory'), 1500);
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
    <Layout className="px-0 sm:px-4">
      <div className="lg:hidden px-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Intake</h1>
        <p className="text-xs text-gray-500">Add equipment to your inventory</p>
      </div>

      <div className="hidden lg:block">
        <PageHeader 
          title="Inventory Intake" 
          description="Add new equipment. Upload a photo and let AI fill the details."
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-none sm:border shadow-none sm:shadow-lg overflow-hidden rounded-none sm:rounded-2xl">
          <CardContent className="p-0">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 p-4 sticky top-0 z-10 flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle className="text-red-500 mr-3 shrink-0" size={20} />
                <span className="text-red-800 dark:text-red-300 text-sm font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 dark:bg-green-900/40 border-l-4 border-green-500 p-4 sticky top-0 z-10 flex items-center animate-in fade-in slide-in-from-top-4 duration-300">
                <CheckCircle2 className="text-green-500 mr-3 shrink-0" size={20} />
                <span className="text-green-800 dark:text-green-300 text-sm font-bold uppercase tracking-tight">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-slate-800">
              {/* Photo Upload Section */}
              <div className="p-4 sm:p-8 bg-gray-50/50 dark:bg-slate-900/50">
                <div {...getRootProps()} className={`
                  border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-300
                  flex flex-col items-center justify-center min-h-[220px]
                  ${isDragActive 
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 scale-[1.01]' 
                    : 'border-gray-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 bg-white dark:bg-slate-950'
                  }
                `}>
                  <input {...getInputProps()} />
                  
                  {analyzing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin h-12 w-12 text-brand-500 mb-4" />
                      <p className="text-xl text-brand-700 dark:text-brand-400 font-black uppercase tracking-tighter">AI Reading Machine...</p>
                      <p className="text-sm text-gray-500 mt-1 font-bold">Scanning make, model, year</p>
                    </div>
                  ) : (
                    <>
                      <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300
                        ${photos.length > 0 ? 'bg-green-100 text-green-600 shadow-sm' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm'}
                        ${isDragActive ? 'scale-110' : ''}
                      `}>
                        {photos.length > 0 ? <CheckCircle2 size={40} /> : <Camera size={40} />}
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        {isDragActive ? 'Release Now' : photos.length > 0 ? 'Add more photos' : 'Take or select photos'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 mb-8 font-bold uppercase tracking-widest">Spec plate photos work best</p>
                      
                      <Button type="button" variant="secondary" className="rounded-full shadow-md min-h-[50px] px-8 font-bold uppercase tracking-wider text-xs">
                        <Upload size={18} className="mr-2" />
                        Capture Machine
                      </Button>
                    </>
                  )}
                </div>
                
                {photos.length > 0 && (
                  <div className="mt-6 flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative group shrink-0 snap-center">
                        <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                          <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotos(photos.filter((_, idx) => idx !== i));
                          }}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="p-5 sm:p-8 space-y-10 bg-white dark:bg-slate-950">
                {/* Section 1: Core Details */}
                <section>
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-xs mr-3 shadow-md shadow-brand-500/20">1</div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Core Specifications</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <label htmlFor="make" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Make *</label>
                      <input id="make" name="make" placeholder="e.g. Raymond" value={formData.make} onChange={handleChange} required
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="model" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Model *</label>
                      <input id="model" name="model" placeholder="e.g. 7500" value={formData.model} onChange={handleChange} required
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="year" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Year</label>
                      <input id="year" name="year" type="number" placeholder="e.g. 2019" value={formData.year} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="serial" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Serial Number</label>
                      <input id="serial" name="serial" placeholder="Serial #" value={formData.serial} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="hours" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Hour Meter</label>
                      <input id="hours" name="hours" type="number" placeholder="Hours" value={formData.hours} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="capacity_lbs" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Capacity (lbs)</label>
                      <input id="capacity_lbs" name="capacity_lbs" type="number" placeholder="e.g. 5000" value={formData.capacity_lbs} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                  </div>
                </section>

                {/* Section 2: Technical Specs */}
                <section>
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-black text-xs mr-3 shadow-md shadow-green-500/20">2</div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Technical Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <label htmlFor="mast_type" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Mast Type</label>
                      <input id="mast_type" name="mast_type" placeholder="e.g. Triple" value={formData.mast_type} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lift_height_inches" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Lift Height (in)</label>
                      <input id="lift_height_inches" name="lift_height_inches" type="number" placeholder="Max height" value={formData.lift_height_inches} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="power_type" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Power Type</label>
                      <select id="power_type" name="power_type" value={formData.power_type} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat">
                        <option value="">Select</option>
                        <option value="electric">Electric</option>
                        <option value="propane">Propane</option>
                        <option value="diesel">Diesel</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label htmlFor="battery_info" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Battery Info</label>
                      <input id="battery_info" name="battery_info" placeholder="Voltage, AH, Brand, Year..." value={formData.battery_info} onChange={handleChange}
                        className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                    </div>
                  </div>
                </section>

                {/* Section 3: Condition & Price */}
                <section>
                  <div className="flex items-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-xs mr-3 shadow-md shadow-orange-500/20">3</div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Condition & Valuation</h3>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label htmlFor="condition_notes" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Condition Notes</label>
                      <textarea id="condition_notes" name="condition_notes" placeholder="Tires, battery, paint, major repairs needed..." value={formData.condition_notes} onChange={handleChange} rows="4"
                        className="w-full p-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300"></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-2">
                        <label htmlFor="purchase_price" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Purchase Price</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">$</span>
                          <input id="purchase_price" name="purchase_price" type="number" placeholder="0" value={formData.purchase_price} onChange={handleChange}
                            className="w-full h-14 pl-10 pr-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-black text-lg focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="additional_context" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Location / Source</label>
                        <input id="additional_context" name="additional_context" placeholder="e.g. Baltimore Yard" value={formData.additional_context} onChange={handleChange}
                          className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/50 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-gray-300" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={submitting || analyzing}
                    className="w-full h-16 rounded-3xl font-black text-lg uppercase tracking-wider shadow-xl shadow-brand-500/25 active:scale-[0.97] transition-all bg-brand-600 hover:bg-brand-500"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-3" size={24} />
                        Syncing...
                      </>
                    ) : (
                      <>
                        Add To Fleet
                        <ChevronRight className="ml-2" size={24} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Intake;
