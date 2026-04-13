import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  Receipt,
  X,
  Minus,
  Loader
} from 'lucide-react';

interface Sale {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  sale_date: string;
  items?: SaleItem[];
}

interface SaleItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price?: number;
}

interface Product {
  id: number;
  name: string;
  selling_price: number;
  stock_quantity: number;
  barcode?: string;
  category_name?: string;
}

export const SalesManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('today');
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

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getSales();
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
      showToast('Gagal memuat data penjualan', false);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const saleDate = new Date(sale.sale_date);
    const today = new Date();
    
    let matchesDate = true;
    if (selectedDateRange === 'today') {
      matchesDate = saleDate.toDateString() === today.toDateString();
    } else if (selectedDateRange === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = saleDate >= weekAgo;
    } else if (selectedDateRange === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = saleDate >= monthAgo;
    }
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const averageTransaction = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
  const totalProfit = filteredSales.reduce((sum, sale) => {
    const saleProfit = (sale.items || []).reduce((s, item) => {
      return s + (item.unit_price - (item.cost_price || 0)) * item.quantity;
    }, 0);
    return sum + saleProfit;
  }, 0);

  const handleCreateSale = async (saleData: any) => {
    try {
      await ApiService.createSale({
        invoice_number: `INV-${Date.now()}`,
        customer_name: saleData.customerName,
        customer_phone: saleData.customerPhone,
        subtotal: saleData.subtotal,
        tax_amount: saleData.tax,
        total_amount: saleData.total,
        payment_method: saleData.paymentMethod,
        items: saleData.items.map((item: any) => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total
        }))
      });
      
      await loadSales();
      await loadProducts(); // Refresh products to update stock
      setShowPOSModal(false);
      showToast('Penjualan berhasil disimpan');
    } catch (error) {
      console.error('Error creating sale:', error);
      showToast('Gagal menyimpan penjualan', false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data penjualan...</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Penjualan</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola transaksi dan penjualan toko Anda</p>
        </div>
        <button
          onClick={() => setShowPOSModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Transaksi Baru</span>
        </button>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSales)}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSales.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Transaksi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(averageTransaction)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Keuntungan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pelanggan atau nomor invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pembayaran
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada transaksi ditemukan
                  </td>
                </tr>
              )}
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sale.invoice_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{sale.customer_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{sale.customer_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(sale.sale_date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sale.sale_date).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {sale.items?.length || 0} item{(sale.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(sale.total_amount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Subtotal: {formatCurrency(sale.subtotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.payment_method === 'cash' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sale.payment_method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal */}
      {showPOSModal && (
        <POSModal
          onClose={() => setShowPOSModal(false)}
          onSale={handleCreateSale}
          products={products}
        />
      )}
    </div>
  );
};

const POSModal: React.FC<{
  onClose: () => void;
  onSale: (sale: any) => void;
  products: Product[];
}> = ({ onClose, onSale, products }) => {
  const [cart, setCart] = useState<Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    total: number;
  }>>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    if (product.stock_quantity === 0) return;
    const existingItem = cart.find(item => item.productId === product.id);
    const currentQty = existingItem?.quantity || 0;
    if (currentQty >= product.stock_quantity) return;
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.selling_price,
        quantity: 1,
        total: product.selling_price
      }]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      const maxQty = product?.stock_quantity ?? Infinity;
      const clamped = Math.min(newQuantity, maxQty);
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: clamped, total: clamped * item.price }
          : item
      ));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    onSale({
      customerName,
      customerPhone,
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Search */}
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk atau scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-6">Produk tidak ditemukan</p>
                ) : (
                  filteredProducts.map((product) => {
                    const cartItem = cart.find(i => i.productId === product.id);
                    const isOutOfStock = product.stock_quantity === 0;
                    const isMaxReached = cartItem !== undefined && cartItem.quantity >= product.stock_quantity;
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isOutOfStock || isMaxReached
                            ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                        }`}
                        onClick={() => !isOutOfStock && !isMaxReached && addToCart(product)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.category_name}</div>
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(product.selling_price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isOutOfStock ? 'Habis' : `Stok: ${product.stock_quantity}`}
                          </div>
                          {cartItem && !isOutOfStock && (
                            <div className="text-xs text-blue-600">Di keranjang: {cartItem.quantity}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cart and Checkout */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keranjang</h3>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto dark:bg-gray-700/30">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Keranjang kosong</p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(item.price)} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="ml-4 font-medium text-sm">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  >
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="card">Kartu Kredit</option>
                    <option value="ewallet">E-Wallet</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak (10%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Proses Pembayaran
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};