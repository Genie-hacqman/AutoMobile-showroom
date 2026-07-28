import products from './products';

const STORAGE_KEY = 'obolo-products';

function normalizeSpecs(specs) {
  return {
    engine: specs?.engine || 'Not specified',
    transmission: specs?.transmission || 'Not specified',
    mileage: specs?.mileage || 'Not specified',
    power: specs?.power || 'Not specified',
  };
}

const defaultProducts = products.map((product) => ({
  ...product,
  specs: normalizeSpecs(product.specs),
}));

function normalizeStoredProducts(parsedProducts) {
  if (!Array.isArray(parsedProducts)) {
    return defaultProducts.map((product) => ({ ...product }));
  }

  const normalizedStoredProducts = parsedProducts.map((product) => {
    const fallbackProduct = defaultProducts.find(
      (candidate) => candidate.id === product.id || candidate.name === product.name,
    );

    const normalizedImage =
      typeof product.image === 'string' && product.image.startsWith('/images/')
        ? fallbackProduct?.image || ''
        : product.image || fallbackProduct?.image || '';

    return {
      ...product,
      id: product.id || fallbackProduct?.id || `product-${Date.now()}`,
      name: product.name || fallbackProduct?.name || 'Unnamed vehicle',
      image: normalizedImage,
      brand: product.brand || fallbackProduct?.brand || getProductBrand({ name: product.name || fallbackProduct?.name }),
      price: Number(product.price) || fallbackProduct?.price || 0,
      category: product.category || fallbackProduct?.category || 'Other',
      description: product.description || fallbackProduct?.description || '',
      specs: {
        ...normalizeSpecs(fallbackProduct?.specs),
        ...normalizeSpecs(product.specs),
      },
    };
  });

  const mergedProducts = defaultProducts.map((product) => ({ ...product }));

  normalizedStoredProducts.forEach((product) => {
    const matchIndex = mergedProducts.findIndex(
      (candidate) => candidate.id === product.id || candidate.name === product.name,
    );

    if (matchIndex >= 0) {
      mergedProducts[matchIndex] = {
        ...mergedProducts[matchIndex],
        ...product,
        id: mergedProducts[matchIndex].id,
        name: mergedProducts[matchIndex].name,
        image: product.image || mergedProducts[matchIndex].image,
        brand: product.brand || mergedProducts[matchIndex].brand || getProductBrand({ name: mergedProducts[matchIndex].name }),
        price: Number(product.price) || mergedProducts[matchIndex].price || 0,
        category: product.category || mergedProducts[matchIndex].category || 'Other',
        description: product.description || mergedProducts[matchIndex].description || '',
        specs: {
          ...normalizeSpecs(mergedProducts[matchIndex].specs),
          ...normalizeSpecs(product.specs),
        },
      };
      return;
    }

    mergedProducts.push(product);
  });

  return mergedProducts;
}

function loadProducts() {
  if (typeof window === 'undefined') return defaultProducts;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProducts;

    const parsed = JSON.parse(stored);
    const normalizedProducts = normalizeStoredProducts(parsed);
    persistProducts(normalizedProducts);
    return normalizedProducts;
  } catch (error) {
    console.error('Failed to load products from storage:', error);
    return defaultProducts;
  }
}

let productState = [];

function initializeProductState() {
  productState = loadProducts();
}

initializeProductState();

function persistProducts(nextProducts) {
  productState = nextProducts;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
    window.dispatchEvent(new CustomEvent('products-updated', { detail: nextProducts }));
  }

  return nextProducts;
}

export function getProducts() {
  return productState;
}

export function searchProducts(productsToSearch, searchTerm) {
  const normalizedQuery = String(searchTerm ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

  if (!normalizedQuery) return productsToSearch;

  return productsToSearch.filter((product) => {
    const searchableText = [product.name, product.category, product.description, product.id]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ');

    return searchableText.includes(normalizedQuery);
  });
}

export function resetProducts() {
  persistProducts(defaultProducts.map((product) => ({ ...product })));
  return getProducts();
}

export function addProduct(productInput) {
  const created = {
    id: `${String(productInput.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
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

export function deleteProduct(id) {
  const removed = productState.some((product) => product.id === id);
  if (!removed) return false;

  const nextProducts = productState.filter((product) => product.id !== id);
  persistProducts(nextProducts);
  return true;
}

export function getProductById(id) {
  return productState.find((product) => product.id === id) || null;
}

export function getProductBrand(product) {
  const explicitBrand = product?.brand?.trim();
  if (explicitBrand) return explicitBrand;

  const name = product?.name?.trim() || '';
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('brabus')) return 'Mercedes-Benz';

  const knownBrands = [
    'BMW',
    'Mercedes-Benz',
    'Mercedes',
    'Toyota',
    'Ford',
    'Audi',
    'Porsche',
    'Tesla',
    'Lexus',
    'Nissan',
    'Honda',
    'Volkswagen',
    'Changan',
    'Chevrolet',
    'Volvo',
    'Jaguar',
    'Land Rover',
    'Range Rover',
    'Mazda',
    'Subaru',
    'Hyundai',
    'Kia',
    'Mitsubishi',
    'Jeep',
    'Cadillac',
    'Lincoln',
    'Acura',
    'Genesis',
    'Mini',
    'Alfa Romeo',
    'Fiat',
    'Maserati',
    'Rolls-Royce',
    'Bentley',
    'McLaren',
    'Ferrari',
    'Lamborghini',
    'Aston Martin',
    'Bugatti',
    'Pagani',
    'GMC',
    'Ram',
    'Dodge',
  ];

  const matchedBrand = knownBrands.find((brand) => normalizedName.includes(brand.toLowerCase()));
  return matchedBrand || 'Other';
}
