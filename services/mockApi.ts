
import { Property, Tenant, Payment, PropertyStatus } from '../types';

let properties: Property[] = [
  { 
    id: '1', 
    address: 'Highland Manor, Unit 4B', 
    unitCount: 4, 
    monthlyRent: 3200, 
    status: PropertyStatus.OCCUPIED,
    type: 'Residential',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '2', 
    address: 'Oakwood Executive Suites', 
    unitCount: 1, 
    monthlyRent: 1850, 
    status: PropertyStatus.VACANT,
    type: 'Commercial',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '3', 
    address: 'Pinecrest Luxury Villa', 
    unitCount: 1, 
    monthlyRent: 5100, 
    status: PropertyStatus.OCCUPIED,
    type: 'Residential',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: '4', 
    address: 'The Brick Lofts #202', 
    unitCount: 2, 
    monthlyRent: 2400, 
    status: PropertyStatus.VACANT,
    type: 'Residential',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  },
];

let tenants: Tenant[] = [
  { id: 't1', name: 'John Doe', propertyId: '1', leaseStart: '2023-01-01', leaseEnd: '2024-01-01', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?u=t1' },
  { id: 't2', name: 'Jane Smith', propertyId: '3', leaseStart: '2023-06-15', leaseEnd: '2024-06-15', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/150?u=t2' },
];

let payments: Payment[] = [
  { id: 'p1', propertyId: '1', tenantId: 't1', amount: 3200, date: '2024-03-01', status: 'paid' },
  { id: 'p2', propertyId: '3', tenantId: 't2', amount: 5100, date: '2024-03-05', status: 'paid' },
  { id: 'p3', propertyId: '1', tenantId: 't1', amount: 3200, date: '2024-04-01', status: 'pending' },
];

export const mockApi = {
  getProperties: async () => [...properties],
  createProperty: async (property: Omit<Property, 'id'>) => {
    const newProperty = { 
      ...property, 
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: property.imageUrl || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800'
    };
    properties.push(newProperty);
    return newProperty;
  },
  updateProperty: async (id: string, updates: Partial<Property>) => {
    properties = properties.map(p => p.id === id ? { ...p, ...updates } : p);
    return properties.find(p => p.id === id);
  },
  deleteProperty: async (id: string) => {
    properties = properties.filter(p => p.id !== id);
    return { success: true };
  },
  getTenants: async () => [...tenants],
  createTenant: async (tenant: Omit<Tenant, 'id'>) => {
    const newTenant = { ...tenant, id: Math.random().toString(36).substr(2, 9) };
    tenants.push(newTenant);
    if (newTenant.propertyId) {
        properties = properties.map(p => p.id === newTenant.propertyId ? { ...p, status: PropertyStatus.OCCUPIED } : p);
    }
    return newTenant;
  },
  getPayments: async () => [...payments],
  createPayment: async (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: Math.random().toString(36).substr(2, 9) };
    payments.push(newPayment);
    return newPayment;
  },
};
