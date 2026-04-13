import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  X,
  Loader,
  AlertTriangle
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_purchases: number;
  last_purchase_date?: string;
  created_at: string;
  updated_at: string;
}

export const CustomerManagement: React.FC = () => {
  const { state } = useAuth();
  const role = state.user?.role ?? 'cashier';
  const canEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg: string; ok: boolean} | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      showToast('Gagal memuat data pelanggan', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async (customerData: any) => {
    try {
      await ApiService.createCustomer(customerData);
      await loadCustomers();
      setShowAddModal(false);
      showToast('Pelanggan berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding customer:', error);
      showToast('Gagal menambahkan pelanggan', false);
    }
  };

  const handleUpdateCustomer = async (customer: Customer, customerData: any) => {
    try {
      await ApiService.updateCustomer(customer.id, customerData);
      await loadCustomers();
      setEditingCustomer(null);
      showToast('Pelanggan berhasil diperbarui');
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast('Gagal memperbarui pelanggan', false);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      await ApiService.deleteCustomer(id);
      await loadCustomers();
      setConfirmDeleteId(null);
      showToast('Pelanggan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Gagal menghapus pelanggan', false);
    }
  };

  const totalCustomers = customers.length;
  const totalPurchases = customers.reduce((sum, customer) => sum + customer.total_purchases, 0);
  const avgPurchasePerCustomer = totalCustomers > 0 ? totalPurchases / totalCustomers : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data pelanggan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Konfirmasi Hapus</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Apakah Anda yakin ingin menghapus pelanggan ini?</p>
            <div className="flex space-x-3">
              <button onClick={() => handleDeleteCustomer(confirmDeleteId)} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Ya, Hapus</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Batal</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Pelanggan</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola data pelanggan dan riwayat pembelian</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pembelian</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPurchases)}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata per Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgPurchasePerCustomer)}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, telepon, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Pembelian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Terakhir Belanja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Bergabung: {new Date(customer.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center mb-1">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center mb-1">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-xs">
                            {customer.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(customer.total_purchases)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.last_purchase_date ? (
                      <div>
                        <div className="font-medium">
                          {new Date(customer.last_purchase_date).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-gray-500">
                          {Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24))} hari lalu
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Belum ada pembelian</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(customer.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {(showAddModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onSave={editingCustomer ? 
            (data) => handleUpdateCustomer(editingCustomer, data) : 
            handleAddCustomer
          }
          onCancel={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
};

const CustomerModal: React.FC<{
  customer?: Customer | null;
  onSave: (customer: any) => void;
  onCancel: () => void;
}> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {customer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {customer ? 'Update' : 'Tambah'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};