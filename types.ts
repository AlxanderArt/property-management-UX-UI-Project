
export enum PropertyStatus {
  OCCUPIED = 'occupied',
  VACANT = 'vacant'
}

export interface Property {
  id: string;
  address: string;
  unitCount: number;
  monthlyRent: number;
  status: PropertyStatus;
  imageUrl?: string;
  type: 'Residential' | 'Commercial' | 'Industrial';
}

export interface Tenant {
  id: string;
  name: string;
  propertyId: string;
  leaseStart: string;
  leaseEnd: string;
  email: string;
  avatar?: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalMonthlyRevenue: number;
  pendingPayments: number;
}
