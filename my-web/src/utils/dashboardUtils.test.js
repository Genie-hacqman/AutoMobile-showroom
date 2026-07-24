import { describe, expect, it } from 'vitest';
import { formatCurrency, getOwnerDashboardStats } from './dashboardUtils';

describe('dashboard utils', () => {
  it('formats prices as US currency', () => {
    expect(formatCurrency(12500)).toBe('$12,500');
  });

  it('builds dashboard stats from inventory', () => {
    const stats = getOwnerDashboardStats([
      { name: 'A', price: 12000, category: 'Luxury' },
      { name: 'B', price: 20000, category: 'Sport' },
    ]);

    expect(stats.totalVehicles).toBe(2);
    expect(stats.averageValue).toBe(16000);
    expect(stats.categories).toEqual(['Luxury', 'Sport']);
    expect(stats.featuredVehicle.name).toBe('B');
  });
});
