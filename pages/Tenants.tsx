
import React, { useState } from 'react';
import { Tenant, Property } from '../types';

interface TenantsProps {
  tenants: Tenant[];
  properties: Property[];
  onAdd: (t: Omit<Tenant, 'id'>) => void;
}

const Tenants: React.FC<TenantsProps> = ({ tenants, properties, onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newTenant);
    setNewTenant({ name: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '' });
    setIsModalOpen(false);
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>👤</span> Add Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                {tenant.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{tenant.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lease Ends: {tenant.leaseEnd}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>🏠</span>
                <span className="font-medium">{getPropertyName(tenant.propertyId)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📧</span>
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📅</span>
                <span>Started {tenant.leaseStart}</span>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors">
              Manage Lease
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Tenant</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  value={newTenant.email} onChange={(e) => setNewTenant({...newTenant, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Property</label>
                <select required className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                  value={newTenant.propertyId} onChange={(e) => setNewTenant({...newTenant, propertyId: e.target.value})}>
                  <option value="">Select a property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address} ({p.status})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lease Start</label>
                  <input required type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={newTenant.leaseStart} onChange={(e) => setNewTenant({...newTenant, leaseStart: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lease End</label>
                  <input required type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    value={newTenant.leaseEnd} onChange={(e) => setNewTenant({...newTenant, leaseEnd: e.target.value})} />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Assign Lease
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
