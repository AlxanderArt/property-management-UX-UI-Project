import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { DashboardStats } from '../types';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  Cell: () => null
}));

describe('Dashboard Component', () => {
  const mockStats: DashboardStats = {
    totalProperties: 10,
    occupiedProperties: 7,
    vacantProperties: 3,
    totalMonthlyRevenue: 25000,
    pendingPayments: 2
  };

  it('renders dashboard with stats', () => {
    render(<Dashboard stats={mockStats} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // total properties
    expect(screen.getByText('$25,000')).toBeInTheDocument(); // revenue
  });

  it('displays occupancy percentage correctly', () => {
    render(<Dashboard stats={mockStats} />);

    // 7/10 = 70%
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('shows pending payments count', () => {
    render(<Dashboard stats={mockStats} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders charts', () => {
    render(<Dashboard stats={mockStats} />);

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
