
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import { mockApi } from './services/mockApi';
import { Property, Tenant, Payment, DashboardStats, PropertyStatus } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [props, tens, pays] = await Promise.all([
        mockApi.getProperties(),
        mockApi.getTenants(),
        mockApi.getPayments()
      ]);
      setProperties(props);
      setTenants(tens);
      setPayments(pays);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats for dashboard
  const stats: DashboardStats = useMemo(() => {
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.status === PropertyStatus.OCCUPIED).length;
    const vacantProperties = properties.filter(p => p.status === PropertyStatus.VACANT).length;
    const totalMonthlyRevenue = properties
      .filter(p => p.status === PropertyStatus.OCCUPIED)
      .reduce((sum, p) => sum + p.monthlyRent, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    return {
      totalProperties,
      occupiedProperties,
      vacantProperties,
      totalMonthlyRevenue,
      pendingPayments
    };
  }, [properties, payments]);

  // Handlers
  const handleAddProperty = async (p: Omit<Property, 'id'>) => {
    await mockApi.createProperty(p);
    fetchData();
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm("Are you sure? This will delete the property record.")) {
      await mockApi.deleteProperty(id);
      fetchData();
    }
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    await mockApi.updateProperty(id, updates);
    fetchData();
  };

  const handleAddTenant = async (t: Omit<Tenant, 'id'>) => {
    await mockApi.createTenant(t);
    fetchData();
  };

  const handleAddPayment = async (p: Omit<Payment, 'id'>) => {
    await mockApi.createPayment(p);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-500 font-medium">Loading PropManager...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard stats={stats} />}
      {activeTab === 'properties' && (
        <Properties 
          properties={properties} 
          onAdd={handleAddProperty} 
          onDelete={handleDeleteProperty} 
          onUpdate={handleUpdateProperty} 
        />
      )}
      {activeTab === 'tenants' && (
        <Tenants tenants={tenants} properties={properties} onAdd={handleAddTenant} />
      )}
      {activeTab === 'payments' && (
        <Payments payments={payments} tenants={tenants} properties={properties} onAdd={handleAddPayment} />
      )}
    </Layout>
  );
};

export default App;
