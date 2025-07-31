import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getPeriodData = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const sales = state.sales.filter(sale => new Date(sale.date) >= startDate);
    const expenses = state.expenses.filter(expense => new Date(expense.date) >= startDate);
    
    return { sales, expenses };
  };

  const { sales, expenses } = getPeriodData();

  // Financial calculations
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossProfit = totalRevenue - totalExpenses;
  const totalCOGS = sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      const product = state.products.find(p => p.id === item.productId);
      return itemSum + ((product?.cost || 0) * item.quantity);
    }, 0);
  }, 0);
  const netProfit = totalRevenue - totalCOGS - totalExpenses;

  // Category breakdown
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const salesByCategory = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      if (product) {
        acc[product.category] = (acc[product.category] || 0) + item.total;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Top performing products
  const productPerformance = state.products.map(product => {
    const soldQuantity = sales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.productId === product.id);
      return sum + (item?.quantity || 0);
    }, 0);
    
    const revenue = sales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.productId === product.id);
      return sum + (item?.total || 0);
    }, 0);
    
    const profit = revenue - (product.cost * soldQuantity);
    
    return {
      ...product,
      soldQuantity,
      revenue,
      profit
    };
  }).sort((a, b) => b.profit - a.profit);

  // Monthly trend data (last 12 months)
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthSales = state.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === year && saleDate.getMonth() === month;
    });
    
    const monthExpenses = state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
    
    const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    const expenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      revenue,
      expenses,
      profit: revenue - expenses
    };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-600">Analisis kinerja keuangan dan bisnis</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode Laporan
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">Tahun Ini</option>
              <option value="all">Semua Waktu</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Ringkasan Umum</option>
              <option value="profit-loss">Laba Rugi</option>
              <option value="products">Kinerja Produk</option>
              <option value="trends">Tren Bulanan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">12.5%</span>
            <span className="text-gray-500 ml-1">vs periode sebelumnya</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
            <Activity className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600 font-medium">5.2%</span>
            <span className="text-gray-500 ml-1">vs periode sebelumnya</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Laba Kotor</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(grossProfit)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium">
              {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-gray-500 ml-1">margin laba</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(netProfit)}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">
              {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-gray-500 ml-1">margin bersih</span>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Kategori</h3>
            <div className="space-y-3">
              {Object.entries(salesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</div>
                    <div className="text-xs text-gray-500">
                      {totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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
        </div>
      )}

      {selectedReport === 'profit-loss' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Laba Rugi</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">PENDAPATAN</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalRevenue)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 pl-4">Penjualan</span>
              <span className="text-gray-700">{formatCurrency(totalRevenue)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">HARGA POKOK PENJUALAN</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalCOGS)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">LABA KOTOR</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalRevenue - totalCOGS)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">BEBAN OPERASIONAL</span>
              <span className="font-medium text-gray-900">{formatCurrency(totalExpenses)}</span>
            </div>
            
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center py-1">
                <span className="text-gray-700 pl-4">{category}</span>
                <span className="text-gray-700">{formatCurrency(amount)}</span>
              </div>
            ))}
            
            <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
              <span className="font-bold text-gray-900">LABA BERSIH</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'products' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kinerja Produk</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendapatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keuntungan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPerformance.slice(0, 10).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.soldQuantity} pcs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'trends' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Bulanan (12 Bulan Terakhir)</h3>
          <div className="space-y-4">
            {monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{month.month}</span>
                </div>
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Pendapatan</div>
                    <div className="font-medium text-green-600">{formatCurrency(month.revenue)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Pengeluaran</div>
                    <div className="font-medium text-red-600">{formatCurrency(month.expenses)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Keuntungan</div>
                    <div className={`font-medium ${month.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(month.profit)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};