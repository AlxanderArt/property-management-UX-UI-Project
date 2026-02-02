
import React, { useState, useEffect } from 'react';
import { Payment, Property, Tenant } from '../types';

interface PaymentsProps {
  payments: Payment[];
  properties: Property[];
  tenants: Tenant[];
  onAdd: (p: Omit<Payment, 'id'>) => void;
}

const ITEMS_PER_PAGE = 10;

const Payments: React.FC<PaymentsProps> = ({ payments, properties, tenants, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newPayment, setNewPayment] = useState({ propertyId: '', tenantId: '', amount: 0, date: '', status: 'paid' as 'paid' | 'pending' });

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.name || 'Unknown';
  const getPropertyAddress = (id: string) => properties.find(p => p.id === id)?.address || 'Unknown';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Pagination
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = sortedPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      await onAdd(newPayment);
      setIsModalOpen(false);
      setNewPayment({ propertyId: '', tenantId: '', amount: 0, date: '', status: 'paid' });
    } catch (err) {
      console.error('Failed to add payment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Rent Payments</h2>
          <p className="text-slate-500">Track transactions and upcoming collections.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          aria-label="Record new payment"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Record Payment
        </button>
      </div>

      {/* Empty State */}
      {payments.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-black text-slate-900">No payments recorded</h4>
          <p className="text-slate-400 mt-2 font-medium">Start tracking rent payments by recording your first transaction.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Record First Payment
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table" aria-label="Payment history">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-600">Tenant</th>
                    <th className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-600">Property</th>
                    <th className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 font-medium text-slate-800">{getTenantName(p.tenantId)}</td>
                      <td className="px-4 lg:px-6 py-4 text-slate-600 truncate max-w-[200px]">{getPropertyAddress(p.propertyId)}</td>
                      <td className="px-4 lg:px-6 py-4 text-slate-600">{formatDate(p.date)}</td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-slate-800">${p.amount.toLocaleString()}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedPayments.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{getTenantName(p.tenantId)}</h4>
                    <p className="text-sm text-slate-500 truncate max-w-[200px]">{getPropertyAddress(p.propertyId)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500">{formatDate(p.date)}</span>
                  <span className="text-lg font-bold text-slate-900">${p.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
              <h3 id="modal-title" className="text-xl font-bold">Record Rent Payment</h3>
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
                <label htmlFor="tenant-select" className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select
                  id="tenant-select"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={newPayment.tenantId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    const tenant = tenants.find(t => t.id === tId);
                    const prop = properties.find(pr => pr.id === tenant?.propertyId);
                    setNewPayment({
                      ...newPayment,
                      tenantId: tId,
                      propertyId: tenant?.propertyId || '',
                      amount: prop?.monthlyRent || 0
                    });
                  }}
                >
                  <option value="">Select a tenant</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount-input" className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input
                    id="amount-input"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label htmlFor="date-input" className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                  <input
                    id="date-input"
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                  />
                </div>
              </div>
              <fieldset>
                <legend className="block text-sm font-medium text-slate-700 mb-2">Status</legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-status"
                      checked={newPayment.status === 'paid'}
                      onChange={() => setNewPayment({...newPayment, status: 'paid'})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    Paid
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-status"
                      checked={newPayment.status === 'pending'}
                      onChange={() => setNewPayment({...newPayment, status: 'pending'})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    Pending
                  </label>
                </div>
              </fieldset>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
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

export default Payments;
