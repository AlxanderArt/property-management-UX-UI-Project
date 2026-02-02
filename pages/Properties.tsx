
import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '../types';

interface PropertiesProps {
  properties: Property[];
  onAdd: (p: Omit<Property, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Property>) => void;
}

const ITEMS_PER_PAGE = 9;
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800';

const Properties: React.FC<PropertiesProps> = ({ properties, onAdd, onDelete, onUpdate }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [newProp, setNewProp] = useState<Omit<Property, 'id'>>({
    address: '',
    unitCount: 1,
    monthlyRent: 1500,
    status: PropertyStatus.VACANT,
    type: 'Residential'
  });

  const filtered = properties.filter(p => {
    const matchesSearch = p.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : p.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProperties = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd(newProp);
      setNewProp({ address: '', unitCount: 1, monthlyRent: 1500, status: PropertyStatus.VACANT, type: 'Residential' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add property', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = (propertyId: string) => {
    setImageErrors(prev => new Set(prev).add(propertyId));
  };

  const getImageSrc = (prop: Property) => {
    if (imageErrors.has(prop.id)) return DEFAULT_IMAGE;
    return prop.imageUrl || DEFAULT_IMAGE;
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Real Estate Assets</h2>
          <p className="text-slate-500 mt-2 font-medium">Managing high-performance properties across your portfolio.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
          aria-label="Add new property"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
          New Acquisition
        </button>
      </div>

      {/* Modern Filter System */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex-1 relative group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search properties by location or name..."
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search properties"
          />
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Filter properties by status">
          {['all', PropertyStatus.OCCUPIED, PropertyStatus.VACANT].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-4 rounded-2xl font-bold text-sm transition-all capitalize border-2 ${
                filter === s
                ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg'
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
              aria-pressed={filter === s}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedProperties.map((prop) => (
          <div key={prop.id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:-translate-y-2">
            <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-slate-100">
              <img
                src={getImageSrc(prop)}
                alt={`${prop.address} - ${prop.type} property`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => handleImageError(prop.id)}
                loading="lazy"
              />
              <div className="absolute top-5 left-5">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                  prop.status === PropertyStatus.OCCUPIED
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 text-white'
                }`}>
                  {prop.status}
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Starting Rent</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">${prop.monthlyRent.toLocaleString()}</p>
                </div>
                <div className="bg-[#0F172A]/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">{prop.type}</span>
                <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">{prop.unitCount} Units</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{prop.address}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">Metropolitan District, Region 1</p>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(prop.id, { status: prop.status === PropertyStatus.OCCUPIED ? PropertyStatus.VACANT : PropertyStatus.OCCUPIED })}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={`Change status to ${prop.status === PropertyStatus.OCCUPIED ? 'vacant' : 'occupied'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </button>
                  <button
                    onClick={() => onDelete(prop.id)}
                    className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Delete property"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <button className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group/btn focus:outline-none focus:underline">
                  Edit Portfolio
                  <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-xl font-black text-slate-900">No assets found</h4>
            <p className="text-slate-400 mt-2 font-medium">Try adjusting your search filters or add a new property.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      {/* Modern Acquisition Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-xl shadow-2xl animate-scaleUp overflow-hidden">
            <div className="relative h-24 sm:h-32 bg-[#0F172A] p-6 sm:p-10 flex items-center justify-between">
              <div>
                <h3 id="modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">New Acquisition</h3>
                <p className="text-indigo-300 text-xs sm:text-sm font-bold uppercase tracking-widest mt-1">Asset Intake Form</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="property-address" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Property Address</label>
                  <input
                    id="property-address"
                    required
                    type="text"
                    maxLength={100}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                    value={newProp.address}
                    onChange={(e) => setNewProp({...newProp, address: e.target.value})}
                    placeholder="e.g. 101 Skyline Boulevard"
                  />
                </div>
                <div>
                  <label htmlFor="unit-count" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit Count</label>
                  <input
                    id="unit-count"
                    type="number"
                    min="1"
                    max="1000"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                    value={newProp.unitCount}
                    onChange={(e) => setNewProp({...newProp, unitCount: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label htmlFor="monthly-rent" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Target ($)</label>
                  <input
                    id="monthly-rent"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                    value={newProp.monthlyRent}
                    onChange={(e) => setNewProp({...newProp, monthlyRent: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registering...
                    </>
                  ) : (
                    'Register Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
