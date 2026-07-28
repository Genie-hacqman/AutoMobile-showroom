import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../data/productsStore';
import OwnerDashboardHeader from '../components/dashboard/OwnerDashboardHeader';
import OwnerMetrics from '../components/dashboard/OwnerMetrics';
import OwnerInventoryTable from '../components/dashboard/OwnerInventoryTable';
import OwnerVehicleForm from '../components/dashboard/OwnerVehicleForm';
import { getOwnerDashboardStats } from '../utils/dashboardUtils';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  image: '',
  description: '',
  specs: {
    engine: '',
    transmission: '',
    mileage: '',
    power: '',
  },
};

export default function ProductManager() {
  const [products, setProducts] = useState(getProducts());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const previewImage = form.image || '';

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const dashboardStats = useMemo(() => getOwnerDashboardStats(products), [products]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('specs.')) {
      const key = name.split('.')[1];
      setForm((current) => ({
        ...current,
        specs: { ...current.specs, [key]: value },
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((current) => ({ ...current, image: reader.result }));
      setMessage('Image selected from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.category || !form.description) {
      setMessage('Please fill in the name, category, and description.');
      return;
    }

    if (editingId) {
      updateProduct(editingId, {
        name: form.name,
        brand: form.brand || 'Other',
        category: form.category,
        price: Number(form.price) || 0,
        image: form.image || '',
        description: form.description,
        specs: {
          engine: form.specs.engine,
          transmission: form.specs.transmission,
          mileage: form.specs.mileage,
          power: form.specs.power,
        },
      });
      setMessage('Vehicle updated successfully.');
    } else {
      addProduct({
        name: form.name,
        brand: form.brand || 'Other',
        category: form.category,
        price: Number(form.price) || 0,
        image: form.image || '',
        description: form.description,
        specs: {
          engine: form.specs.engine,
          transmission: form.specs.transmission,
          mileage: form.specs.mileage,
          power: form.specs.power,
        },
      });
      setMessage('Vehicle added successfully.');
    }

    setProducts(getProducts());
    resetForm();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      brand: product.brand || '',
      category: product.category,
      price: String(product.price),
      image: product.image,
      description: product.description,
      specs: {
        engine: product.specs?.engine || '',
        transmission: product.specs?.transmission || '',
        mileage: product.specs?.mileage || '',
        power: product.specs?.power || '',
      },
    });
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setProducts(getProducts());
    if (editingId === id) resetForm();
    setMessage('Vehicle removed.');
  };

  return (
    <main className="min-h-screen bg-slate-50 py-16 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:px-16">
        <OwnerDashboardHeader
          badge="Owner command center"
          title="Showcase your collection with confidence"
          subtitle="Manage every listing, update the showroom instantly, and keep your web presence polished for serious buyers."
        />

        <OwnerMetrics stats={dashboardStats} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-yellow-500">Inventory workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create, refine, and publish your vehicles</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View showroom
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <OwnerVehicleForm
            form={form}
            editingId={editingId}
            message={message}
            previewImage={previewImage}
            onChange={handleChange}
            onImageUpload={handleImageUpload}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />

          <div className="space-y-6">
            <OwnerInventoryTable
              products={sortedProducts}
              editingId={editingId}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
