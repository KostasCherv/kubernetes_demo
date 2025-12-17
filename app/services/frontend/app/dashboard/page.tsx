'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { usersAPI, productsAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const [users, products] = await Promise.all([
          usersAPI.getAll(),
          productsAPI.getAll(),
        ]);
        setStats({ users: users.length, products: products.length });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.users}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/users" className="font-medium text-blue-600 hover:text-blue-500">
                    View all users →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.products}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/products" className="font-medium text-green-600 hover:text-green-500">
                    View all products →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

