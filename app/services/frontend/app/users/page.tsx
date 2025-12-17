'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { usersAPI } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string | null;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email || '', password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, { email: formData.email });
      } else {
        await usersAPI.create({
          username: formData.username,
          email: formData.email || undefined,
          password: formData.password || undefined,
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
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
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create User
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                  {editingUser ? 'Edit User' : 'Create User'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required={!editingUser}
                      disabled={!!editingUser}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  )}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingUser ? 'Update' : 'Create'}
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

