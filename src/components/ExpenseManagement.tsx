import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Receipt,
  X,
  Loader
} from 'lucide-react';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category_name: string;
  category_id: number;
  receipt_number?: string;
  expense_date: string;
  created_at: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
}

export const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      alert('Gagal memuat data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await ApiService.getExpenseCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || expense.category_name === selectedCategory;
    
    const expenseDate = new Date(expense.expense_date);
    const today = new Date();
    
    let matchesDate = true;
    if (selectedDateRange === 'today') {
      matchesDate = expenseDate.toDateString() === today.toDateString();
    } else if (selectedDateRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = expenseDate >= weekAgo;
    } else if (selectedDateRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = expenseDate >= monthAgo;
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  }).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = categories.map(category => ({
    category: category.name,
    amount: filteredExpenses.filter(e => e.category_name === category.name).reduce((sum, e) => sum + e.amount, 0)
  }));

  const handleAddExpense = async (expenseData: any) => {
    try {
      await ApiService.createExpense({
        description: expenseData.description,
        amount: expenseData.amount,
        category_id: expenseData.category_id,
        receipt_number: expenseData.receipt,
        expense_date: expenseData.date
      });
      await loadExpenses();
      setShowAddModal(false);
      alert('Pengeluaran berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Gagal menambahkan pengeluaran');
    }
  };

  const handleUpdateExpense = async (expense: Expense, expenseData: any) => {
    try {
      await ApiService.updateExpense(expense.id, {
        description: expenseData.description,
        amount: expenseData.amount,
        category_id: expenseData.category_id,
        receipt_number: expenseData.receipt,
        expense_date: expenseData.date
      });
      await loadExpenses();
      setEditingExpense(null);
      alert('Pengeluaran berhasil diperbarui');
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Gagal memperbarui pengeluaran');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      try {
        await ApiService.deleteExpense(id);
        await loadExpenses();
        alert('Pengeluaran berhasil dihapus');
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Gagal menghapus pengeluaran');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data pengeluaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengeluaran</h1>
          <p className="text-gray-600">Kelola dan pantau pengeluaran operasional toko</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600 font-medium">2.1%</span>
            <span className="text-gray-500 ml-1">dari periode sebelumnya</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Dalam {categories.length} kategori</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Harian</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredExpenses.length > 0 ? totalExpenses / 30 : 0)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Estimasi bulanan</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kategori Terbesar</p>
              <p className="text-2xl font-bold text-gray-900">
                {expensesByCategory.length > 0 ? 
                  formatCurrency(Math.max(...expensesByCategory.map(c => c.amount))) : 
                  formatCurrency(0)
                }
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {expensesByCategory.length > 0 ? 
                expensesByCategory.reduce((max, cat) => cat.amount > max.amount ? cat : max, expensesByCategory[0]).category :
                'Tidak ada data'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
        <div className="space-y-3">
          {expensesByCategory.map(({ category, amount }) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</div>
                <div className="text-xs text-gray-500">
                  {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengeluaran berdasarkan deskripsi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    {expense.receipt_number && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Receipt className="h-3 w-3 mr-1" />
                        {expense.receipt_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(expense.expense_date).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {(showAddModal || editingExpense) && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories}
          onSave={editingExpense ? 
            (data) => handleUpdateExpense(editingExpense, data) : 
            handleAddExpense
          }
          onCancel={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

const ExpenseModal: React.FC<{
  expense?: Expense | null;
  categories: ExpenseCategory[];
  onSave: (expense: any) => void;
  onCancel: () => void;
}> = ({ expense, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category_id: expense?.category_id || (categories[0]?.id || 1),
    date: expense?.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receipt: expense?.receipt_number || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {expense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bukti/Keterangan
              </label>
              <input
                type="text"
                value={formData.receipt}
                onChange={(e) => setFormData({...formData, receipt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nomor invoice, keterangan tambahan, dll"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {expense ? 'Update' : 'Tambah'}
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