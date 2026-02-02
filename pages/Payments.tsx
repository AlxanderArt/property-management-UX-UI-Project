
import React, { useState } from 'react';
import { Payment, Property, Tenant } from '../types';

interface PaymentsProps {
  payments: Payment[];
  properties: Property[];
  tenants: Tenant[];
  onAdd: (p: Omit<Payment, 'id'>) => void;
}

const Payments: React.FC<PaymentsProps> = ({ payments, properties, tenants, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ propertyId: '', tenantId: '', amount: 0, date: '', status: 'paid' as 'paid' | 'pending' });

  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.name || 'Unknown';
  const getPropertyAddress = (id: string) => properties.find(p => p.id === id)?.address || 'Unknown';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newPayment);
    setIsModalOpen(false);
    setNewPayment({ propertyId: '', tenantId: '', amount: 0, date: '', status: 'paid' });
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>💵</span> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tenant</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Property</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{getTenantName(p.tenantId)}</td>
                <td className="px-6 py-4 text-slate-600">{getPropertyAddress(p.propertyId)}</td>
                <td className="px-6 py-4 text-slate-600">{p.date}</td>
                <td className="px-6 py-4 font-bold text-slate-800">${p.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Record Rent Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
                <select required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                  value={newPayment.tenantId} onChange={(e) => {
                    const tId = e.target.value;
                    const tenant = tenants.find(t => t.id === tId);
                    const prop = properties.find(pr => pr.id === tenant?.propertyId);
                    setNewPayment({
                      ...newPayment, 
                      tenantId: tId, 
                      propertyId: tenant?.propertyId || '',
                      amount: prop?.monthlyRent || 0
                    });
                  }}>
                  <option value="">Select a tenant</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input required type="number" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                  <input required type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={newPayment.date} onChange={(e) => setNewPayment({...newPayment, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={newPayment.status === 'paid'} onChange={() => setNewPayment({...newPayment, status: 'paid'})} />
                    Paid
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={newPayment.status === 'pending'} onChange={() => setNewPayment({...newPayment, status: 'pending'})} />
                    Pending
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Confirm Payment
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
