import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Loader
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: any[];
  todaySales: any[];
  topSellingProducts: any[];
  recentSales: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: [],
    todaySales: [],
    topSellingProducts: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [sales, expenses, products, customers] = await Promise.all([
        ApiService.getSales(),
        ApiService.getExpenses(),
        ApiService.getProducts(),
        ApiService.getCustomers()
      ]);

      // Calculate stats
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0);
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      
      // Today's sales
      const today = new Date();
      const todaySales = sales.filter((sale: any) => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.toDateString() === today.toDateString();
      });

      // Low stock products
      const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.min_stock_level);

      // Recent sales (last 5)
      const recentSales = sales
        .sort((a: any, b: any) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
        .slice(0, 5);

      // Top selling products (mock data for now)
      const topSellingProducts = products
        .sort((a: any, b: any) => b.stock_quantity - a.stock_quantity)
        .slice(0, 5)
        .map((product: any, index: number) => ({
          ...product,
          totalSold: Math.floor(Math.random() * 100) + 10 // Mock data
        }));

      setStats({
        totalRevenue,
        totalExpenses,
        totalProducts: products.length,
        totalCustomers: customers.length,
        lowStockProducts,
        todaySales,
        topSellingProducts,
        recentSales
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalProfit = stats.totalRevenue - stats.totalExpenses;
  const todayRevenue = stats.todaySales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">12.5%</span>
            <span className="text-gray-500 ml-1">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Keuntungan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalProfit)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">8.2%</span>
            <span className="text-gray-500 ml-1">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">{stats.lowStockProducts.length}</span>
            <span className="text-gray-500 ml-1">stok rendah</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">3.1%</span>
            <span className="text-gray-500 ml-1">dari bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan Hari Ini</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jumlah Transaksi</span>
              <span className="font-semibold">{stats.todaySales.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Penjualan</span>
              <span className="font-semibold text-green-600">{formatCurrency(todayRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rata-rata per Transaksi</span>
              <span className="font-semibold">
                {formatCurrency(stats.todaySales.length > 0 ? todayRevenue / stats.todaySales.length : 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peringatan Stok</h3>
          {stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Stok: {product.stock_quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-600">Stok Rendah</span>
                </div>
              ))}
              {stats.lowStockProducts.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{stats.lowStockProducts.length - 3} produk lainnya
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Semua produk stok aman</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <div className="space-y-4">
            {stats.topSellingProducts.map((product: any, index: number) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.totalSold} terjual</p>
                  <p className="text-sm text-gray-600">{formatCurrency(product.selling_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terakhir</h3>
          <div className="space-y-4">
            {stats.recentSales.map((sale: any) => (
              <div key={sale.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sale.customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.sale_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(sale.total_amount)}</p>
                  <p className="text-sm text-gray-600">{sale.payment_method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};