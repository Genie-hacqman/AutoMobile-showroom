import products from './products';

const STORAGE_KEY = 'obolo-products';

// Start from the built-in product list so the site always has a sensible default inventory.
const defaultProducts = products.map((product) => ({
  ...product,
  specs: product.specs || {
    engine: 'Not specified',
    transmission: 'Not specified',
    mileage: 'Not specified',
    power: 'Not specified',
  },
}));

// Load products from browser storage when available; otherwise fall back to the default list.
function loadProducts() {
  if (typeof window === 'undefined') return defaultProducts;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProducts;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultProducts;
  } catch (error) {
    console.error('Failed to load products from storage:', error);
    return defaultProducts;
  }
}

let productState = loadProducts();

// Save the current inventory back to local storage so changes survive a refresh.
function persistProducts(nextProducts) {
  productState = nextProducts;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
  }
  return nextProducts;
}

export function getProducts() {
  return productState;
}

// Search inventory by a user-entered term, normalizing punctuation and spacing so car names still match reliably.
export function searchProducts(productsToSearch, searchTerm) {
  const normalizedQuery = searchTerm.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

  if (!normalizedQuery) return productsToSearch;

  return productsToSearch.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.description,
      product.id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ');

    return searchableText.includes(normalizedQuery);
  });
}

// Reset the store back to the original inventory list.
export function resetProducts() {
  persistProducts(defaultProducts.map((product) => ({ ...product })));
  return getProducts();
}

// Create a new listing and give it a stable id based on the name and current time.
export function addProduct(productInput) {
  const created = {
    id: `${productInput.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    ...productInput,
    price: Number(productInput.price) || 0,
    specs: {
      engine: productInput.specs?.engine || 'Not specified',
      transmission: productInput.specs?.transmission || 'Not specified',
      mileage: productInput.specs?.mileage || 'Not specified',
      power: productInput.specs?.power || 'Not specified',
    },
  };

  persistProducts([created, ...productState]);
  return created;
}

// Update an existing listing while preserving its id and keeping the spec fields intact.
export function updateProduct(id, updates) {
  const nextProducts = productState.map((product) => {
    if (product.id !== id) return product;

    return {
      ...product,
      ...updates,
      specs: {
        engine: updates.specs?.engine ?? product.specs?.engine ?? 'Not specified',
        transmission: updates.specs?.transmission ?? product.specs?.transmission ?? 'Not specified',
        mileage: updates.specs?.mileage ?? product.specs?.mileage ?? 'Not specified',
        power: updates.specs?.power ?? product.specs?.power ?? 'Not specified',
      },
    };
  });

  persistProducts(nextProducts);
  return nextProducts.find((product) => product.id === id) || null;
}

// Remove a listing from the current in-memory state and storage.
export function deleteProduct(id) {
  const removed = productState.some((product) => product.id === id);
  if (!removed) return false;

  const nextProducts = productState.filter((product) => product.id !== id);
  persistProducts(nextProducts);
  return true;
}

// Fetch a single product by id for the detail page.
export function getProductById(id) {
  return productState.find((product) => product.id === id) || null;
}

// Extract the brand from a product's brand property.
export function getProductBrand(product) {
  return product.brand || 'Other';
}
