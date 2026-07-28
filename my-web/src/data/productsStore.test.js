
import { beforeEach, describe, expect, it, vi } from 'vitest';
import products from './products';
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
    expect(getProducts()).toHaveLength(products.length);
  });

  it('includes existing inventory from storage alongside the defaults', async () => {
    localStorage.setItem('obolo-products', JSON.stringify([
      { id: 'bmw-m3-g80', name: 'BMW M3 G80', image: '/images/BMW_M3_G80.png' },
    ]));

    vi.resetModules();
    const { getProducts: getStoredProducts } = await import('./productsStore');
    const storedProducts = getStoredProducts();

    expect(storedProducts.some((product) => product.id === 'amg-e63s')).toBe(true);
    expect(storedProducts.some((product) => product.id === 'bmw-m3-g80')).toBe(true);
  });

  it('adds a new product to the store', () => {
    const created = addProduct({
      name: 'Test Coupe',
      category: 'Coupe',
      price: 90000,
      image: '/images/test-coupe.png',
      description: 'A test coupe for inventory coverage.',
      specs: {
        engine: 'V6',
        transmission: 'Automatic',
        mileage: 'N/A',
        power: '300 hp',
      },
    });

    const inventory = getProducts();

    expect(inventory).toHaveLength(products.length + 1);
    expect(created.id).toBeTruthy();
    expect(inventory[0]).toMatchObject({ name: 'Test Coupe' });
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
    const inventory = getProducts();

    expect(removed).toBe(true);
    expect(inventory.some((product) => product.id === 'bmw-m3-g80')).toBe(false);
  });

  it('replaces legacy local image paths from storage with the hosted image URL', async () => {
    localStorage.setItem('obolo-products', JSON.stringify([
      {
        id: 'bmw-m3-g80',
        name: 'BMW M3 G80',
        image: '/images/BMW_M3_G80.png',
      },
    ]));

    vi.resetModules();
    const { getProducts: getStoredProducts } = await import('./productsStore');

    const restoredProducts = getStoredProducts();
    const restoredBmw = restoredProducts.find((product) => product.id === 'bmw-m3-g80');
    const expectedBmw = products.find((product) => product.id === 'bmw-m3-g80');

    expect(restoredBmw?.image).toBe(expectedBmw?.image);
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
