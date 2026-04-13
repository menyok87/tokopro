import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  PieChart,
  Activity,
  Loader,
  RefreshCw
} from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, expensesData, productsData] = await Promise.all([
        ApiService.getSales(),
        ApiService.getExpenses(),
        ApiService.getProducts()
      ]);
      setAllSales(salesData);
      setAllExpenses(expensesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Date filter ──────────────────────────────────────────────
  const getStartDate = (): Date => {
    const now = new Date();
    if (selectedPeriod === 'today')  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (selectedPeriod === 'week')   return new Date(now.getTime() - 7 * 86400000);
    if (selectedPeriod === 'month')  return new Date(now.getTime() - 30 * 86400000);
    if (selectedPeriod === 'year')   return new Date(now.getFullYear(), 0, 1);
    if (selectedPeriod === 'custom' && customStart) return new Date(customStart);
    return new Date(0);
  };

  const getEndDate = (): Date => {
    if (selectedPeriod === 'custom' && customEnd) {
      const d = new Date(customEnd);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const startDate = getStartDate();
  const endDate   = getEndDate();

  const sales    = allSales.filter(s => {
    const d = new Date(s.sale_date);
    return d >= startDate && d <= endDate;
  });
  const expenses = allExpenses.filter(e => {
    const d = new Date(e.expense_date);
    return d >= startDate && d <= endDate;
  });

  // ── Core financial calculations ──────────────────────────────
  const totalRevenue  = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalCOGS     = sales.reduce((sum, s) =>
    sum + (s.items || []).reduce((is: number, item: any) =>
      is + (Number(item.cost_price) || 0) * Number(item.quantity), 0), 0);
  const grossProfit   = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit     = grossProfit - totalExpenses;

  // ── Sales by category ────────────────────────────────────────
  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]));
  const salesByCategory: Record<string, number> = {};
  sales.forEach(s => {
    (s.items || []).forEach((item: any) => {
      const cat = productMap[item.product_id]?.category_name || 'Lainnya';
      salesByCategory[cat] = (salesByCategory[cat] || 0) + Number(item.total_price);
    });
  });

  // ── Expenses by category ─────────────────────────────────────
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    const cat = e.category_name || 'Lainnya';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
  });

  // ── Product performance ──────────────────────────────────────
  const productPerf: Record<number, { name: string; category: string; qty: number; revenue: number; cogs: number }> = {};
  sales.forEach(s => {
    (s.items || []).forEach((item: any) => {
      const pid = item.product_id;
      if (!pid) return;
      if (!productPerf[pid]) {
        const p = productMap[pid];
        productPerf[pid] = { name: item.product_name || p?.name || `#${pid}`, category: p?.category_name || '-', qty: 0, revenue: 0, cogs: 0 };
      }
      productPerf[pid].qty     += Number(item.quantity);
      productPerf[pid].revenue += Number(item.total_price);
      productPerf[pid].cogs    += (Number(item.cost_price) || 0) * Number(item.quantity);
    });
  });
  const productPerformance = Object.values(productPerf)
    .map(p => ({ ...p, profit: p.revenue - p.cogs }))
    .sort((a, b) => b.profit - a.profit);

  // ── Monthly trend (12 months) ────────────────────────────────
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const yr = d.getFullYear();
    const mo = d.getMonth();

    const mSales = allSales.filter(s => {
      const sd = new Date(s.sale_date);
      return sd.getFullYear() === yr && sd.getMonth() === mo;
    });
    const mExpenses = allExpenses.filter(e => {
      const ed = new Date(e.expense_date);
      return ed.getFullYear() === yr && ed.getMonth() === mo;
    });

    const rev  = mSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const cogs = mSales.reduce((sum, s) =>
      sum + (s.items || []).reduce((is: number, item: any) =>
        is + (Number(item.cost_price) || 0) * Number(item.quantity), 0), 0);
    const exp  = mExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      revenue: rev,
      cogs,
      grossProfit: rev - cogs,
      expenses: exp,
      netProfit: rev - cogs - exp
    };
  }).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat laporan keuangan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h1>
          <p className="text-gray-600 dark:text-gray-400">Analisis kinerja keuangan dan bisnis</p>
        </div>
        <button
          onClick={loadData}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periode</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            >
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">Tahun Ini</option>
              <option value="all">Semua Waktu</option>
              <option value="custom">Kustom</option>
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dari Tanggal</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sampai Tanggal</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
              </div>
            </>
          )}

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Laporan</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            >
              <option value="overview">Ringkasan Umum</option>
              <option value="profit-loss">Laba Rugi</option>
              <option value="products">Kinerja Produk</option>
              <option value="trends">Tren Bulanan</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 text-sm text-gray-500">{sales.length} transaksi</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Beban Operasional</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
            </div>
            <Activity className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-4 text-sm text-gray-500">{expenses.length} pengeluaran</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Kotor</p>
              <p className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(grossProfit)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Margin: {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Bersih</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Margin: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* ── Overview ─────────────────────────────────── */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Penjualan per Kategori</h3>
            {Object.keys(salesByCategory).length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada data penjualan</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(salesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-700">{cat}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</div>
                        <div className="text-xs text-gray-500">
                          {totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pengeluaran per Kategori</h3>
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada data pengeluaran</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expensesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-700">{cat}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</div>
                        <div className="text-xs text-gray-500">
                          {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Laba Rugi ─────────────────────────────────── */}
      {selectedReport === 'profit-loss' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Laporan Laba Rugi</h3>
          <div className="space-y-2 max-w-2xl">
            <Row label="PENDAPATAN" value={totalRevenue} bold />
            <Row label="Penjualan" value={totalRevenue} indent />

            <div className="pt-2" />
            <Row label="HARGA POKOK PENJUALAN (HPP)" value={totalCOGS} bold />

            <div className="pt-2 border-t border-gray-200" />
            <Row label="LABA KOTOR" value={grossProfit} bold color={grossProfit >= 0 ? 'text-blue-600' : 'text-red-600'} />

            <div className="pt-2" />
            <Row label="BEBAN OPERASIONAL" value={totalExpenses} bold />
            {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <Row key={cat} label={cat} value={amt} indent />
            ))}

            <div className="pt-2 border-t-2 border-gray-400" />
            <Row label="LABA BERSIH" value={netProfit} bold
              color={netProfit >= 0 ? 'text-green-600' : 'text-red-600'} large />
          </div>
        </div>
      )}

      {/* ── Kinerja Produk ─────────────────────────────── */}
      {selectedReport === 'products' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Kinerja Produk</h3>
            <p className="text-sm text-gray-500 mt-1">{productPerformance.length} produk terjual dalam periode ini</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Produk', 'Kategori', 'Terjual', 'Pendapatan', 'HPP', 'Laba', 'Margin'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {productPerformance.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Tidak ada data penjualan produk</td></tr>
                ) : productPerformance.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.qty} pcs</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(p.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(p.cogs)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(p.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tren Bulanan ─────────────────────────────── */}
      {selectedReport === 'trends' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tren Bulanan (12 Bulan Terakhir)</h3>
          <div className="space-y-3">
            {monthlyTrend.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 w-28">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">{m.label}</span>
                </div>
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Pendapatan</div>
                    <div className="font-medium text-green-600">{formatCurrency(m.revenue)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">HPP</div>
                    <div className="font-medium text-orange-500">{formatCurrency(m.cogs)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Laba Kotor</div>
                    <div className={`font-medium ${m.grossProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(m.grossProfit)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Beban</div>
                    <div className="font-medium text-red-500">{formatCurrency(m.expenses)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Laba Bersih</div>
                    <div className={`font-medium ${m.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.netProfit)}
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

// Helper row component for profit-loss table
const Row: React.FC<{
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  color?: string;
  large?: boolean;
}> = ({ label, value, indent, bold, color, large }) => {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
  return (
    <div className={`flex justify-between items-center py-1.5 ${bold ? 'border-b border-gray-200' : ''}`}>
      <span className={`${bold ? 'font-semibold' : 'font-normal'} ${indent ? 'pl-6 text-gray-600' : 'text-gray-900'} ${large ? 'text-base' : 'text-sm'}`}>
        {label}
      </span>
      <span className={`${bold ? 'font-semibold' : ''} ${color || 'text-gray-900'} ${large ? 'text-base' : 'text-sm'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
};
