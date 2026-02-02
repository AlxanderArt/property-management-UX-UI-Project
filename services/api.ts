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

// Custom event for auth state changes
const dispatchAuthEvent = (type: 'logout' | 'error', message?: string) => {
  window.dispatchEvent(new CustomEvent('auth-state-change', { detail: { type, message } }));
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Clear tokens but don't hard reload - let the app handle the state change gracefully
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatchAuthEvent('logout', 'Session expired. Please log in again.');
    throw new Error('Session expired');
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      // Response wasn't JSON, use status code message
      if (response.status === 404) errorMessage = 'Resource not found';
      else if (response.status === 500) errorMessage = 'Server error. Please try again later.';
      else if (response.status === 503) errorMessage = 'Service unavailable. Please try again later.';
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Wrapper for fetch with timeout and better error handling
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return handleResponse<T>(response);
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

export const api = {
  // Properties
  getProperties: async (): Promise<Property[]> => {
    return fetchWithTimeout<Property[]>(`${API_BASE_URL}/properties`, {
      headers: getAuthHeaders()
    });
  },

  createProperty: async (property: Omit<Property, 'id'>): Promise<Property> => {
    return fetchWithTimeout<Property>(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(property)
    });
  },

  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    return fetchWithTimeout<Property>(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
  },

  deleteProperty: async (id: string): Promise<{ message: string }> => {
    return fetchWithTimeout<{ message: string }>(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Tenants
  getTenants: async (): Promise<Tenant[]> => {
    return fetchWithTimeout<Tenant[]>(`${API_BASE_URL}/tenants`, {
      headers: getAuthHeaders()
    });
  },

  createTenant: async (tenant: Omit<Tenant, 'id'>): Promise<Tenant> => {
    return fetchWithTimeout<Tenant>(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tenant)
    });
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    return fetchWithTimeout<Payment[]>(`${API_BASE_URL}/payments`, {
      headers: getAuthHeaders()
    });
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    return fetchWithTimeout<Payment>(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment)
    });
  }
};
