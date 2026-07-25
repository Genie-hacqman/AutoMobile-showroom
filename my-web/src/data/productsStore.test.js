// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  addProduct,
  deleteProduct,
  getProductBrand,
  getProducts,
  resetProducts,
  searchProducts,
  updateProduct,
} from './productsStore';

describe('productsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProducts();
  });

  it('returns the default inventory when storage is empty', () => {
    expect(getProducts()).toHaveLength(8);
  });

  it('adds a new product to the store', () => {
    const created = addProduct({
      name: 'Porsche Taycan',
      category: 'Electric Sedan',
      price: 108000,
      image: '/images/porsche.png',
      description: 'A sleek electric grand tourer with instant torque.',
      specs: {
        engine: 'Dual electric motors',
        transmission: 'Single-speed auto',
        mileage: 'N/A',
        power: '402 hp',
      },
    });

    const products = getProducts();
    expect(products).toHaveLength(9);
    expect(created.id).toBeTruthy();
    expect(products[0]).toMatchObject({ name: 'Porsche Taycan' });
  });

  it('updates an existing product and keeps its id', () => {
    const updated = updateProduct('bmw-m3-g80', {
      price: 82000,
      description: 'Updated description',
    });

    expect(updated).toMatchObject({ id: 'bmw-m3-g80', price: 82000, description: 'Updated description' });
  });

  it('deletes a product from the store', () => {
    const removed = deleteProduct('bmw-m3-g80');
    const products = getProducts();

    expect(removed).toBe(true);
    expect(products.some((product) => product.id === 'bmw-m3-g80')).toBe(false);
  });

  it('matches car names and related terms even when punctuation differs', () => {
    const results = searchProducts(getProducts(), 'mercedes amg');

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('2021 Mercedes-AMG GLE 53');
  });

  it('classifies vehicles by their make from the name', () => {
    const bmw = getProductBrand({ name: 'BMW M3 G80' });
    const toyota = getProductBrand({ name: 'Toyota Land Cruiser' });
    const other = getProductBrand({ name: 'A unique custom coupe' });

    expect(bmw).toBe('BMW');
    expect(toyota).toBe('Toyota');
    expect(other).toBe('Other');
  });
});
