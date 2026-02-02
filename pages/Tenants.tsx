
import React, { useState, useEffect } from 'react';
import { Tenant, Property } from '../types';

interface TenantsProps {
  tenants: Tenant[];
  properties: Property[];
  onAdd: (t: Omit<Tenant, 'id'>) => void;
}

const ITEMS_PER_PAGE = 9;

const Tenants: React.FC<TenantsProps> = ({ tenants, properties, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newTenant, setNewTenant] = useState({ name: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '' });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Pagination
  const totalPages = Math.ceil(tenants.length / ITEMS_PER_PAGE);
  const paginatedTenants = tenants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      await onAdd(newTenant);
      setNewTenant({ name: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add tenant', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPropertyName = (id: string) => {
    return properties.find(p => p.id === id)?.address || 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Tenants</h2>
          <p className="text-slate-500">Track leases and communicate with residents.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          aria-label="Add new tenant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Tenant
        </button>
      </div>

      {/* Empty State */}
      {tenants.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-black text-slate-900">No tenants yet</h4>
          <p className="text-slate-400 mt-2 font-medium">Start managing your rentals by adding your first tenant.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Add First Tenant
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTenants.map((tenant) => (
              <div key={tenant.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 truncate">{tenant.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Lease Ends: {formatDate(tenant.leaseEnd)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium truncate">{getPropertyName(tenant.propertyId)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Started {formatDate(tenant.leaseStart)}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Manage Lease
                </button>
              </div>
            ))}
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
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 id="modal-title" className="text-xl font-bold">Add New Tenant</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="tenant-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  id="tenant-name"
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="tenant-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="tenant-email"
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="tenant-property" className="block text-sm font-medium text-slate-700 mb-1">Assign to Property</label>
                <select
                  id="tenant-property"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={newTenant.propertyId}
                  onChange={(e) => setNewTenant({...newTenant, propertyId: e.target.value})}
                >
                  <option value="">Select a property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address} ({p.status})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lease-start" className="block text-sm font-medium text-slate-700 mb-1">Lease Start</label>
                  <input
                    id="lease-start"
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTenant.leaseStart}
                    onChange={(e) => setNewTenant({...newTenant, leaseStart: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="lease-end" className="block text-sm font-medium text-slate-700 mb-1">Lease End</label>
                  <input
                    id="lease-end"
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTenant.leaseEnd}
                    onChange={(e) => setNewTenant({...newTenant, leaseEnd: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Tenant...
                    </>
                  ) : (
                    'Assign Lease'
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

export default Tenants;
