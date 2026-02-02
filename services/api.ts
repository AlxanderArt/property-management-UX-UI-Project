import { Property, Tenant, Payment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Properties
  getProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Property[]>(response);
  },

  createProperty: async (property: Omit<Property, 'id'>): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(property)
    });
    return handleResponse<Property>(response);
  },

  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Property>(response);
  },

  deleteProperty: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  // Tenants
  getTenants: async (): Promise<Tenant[]> => {
    const response = await fetch(`${API_BASE_URL}/tenants`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Tenant[]>(response);
  },

  createTenant: async (tenant: Omit<Tenant, 'id'>): Promise<Tenant> => {
    const response = await fetch(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tenant)
    });
    return handleResponse<Tenant>(response);
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Payment[]>(response);
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment)
    });
    return handleResponse<Payment>(response);
  }
};
