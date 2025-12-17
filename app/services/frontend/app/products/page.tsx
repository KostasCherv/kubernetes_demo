'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { productsAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | string | null; // Can be string from API or number
  created_at: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '' });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
        });
      } else {
        await productsAPI.create({
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Product
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.description || 'No description'}
                          </div>
                          {product.price != null && (
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                              ${Number(product.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold mb-4">
                  {editingProduct ? 'Edit Product' : 'Create Product'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {editingProduct ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

