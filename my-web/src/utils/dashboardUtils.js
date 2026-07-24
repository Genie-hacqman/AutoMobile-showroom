// File: src/utils/dashboardUtils.js — Small helpers used by the owner dashboard and its tests.
export function formatCurrency(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getOwnerDashboardStats(products = []) {
  const totalVehicles = products.length;
  const averageValue = totalVehicles
    ? products.reduce((total, product) => total + (Number(product.price) || 0), 0) / totalVehicles
    : 0;

  const featuredVehicle = products.reduce((currentBest, product) => {
    const currentPrice = Number(product.price) || 0;
    const bestPrice = Number(currentBest?.price) || 0;
    return currentPrice > bestPrice ? product : currentBest;
  }, null);

  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort();

  return {
    totalVehicles,
    averageValue,
    featuredVehicle,
    categories,
  };
}
