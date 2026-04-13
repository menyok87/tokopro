const API_BASE_URL = 'https://tokopro.keuangan99.com/api';

class ApiService {
  static getAuthToken() {
    return localStorage.getItem('token');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Products
  static async getProducts() {
    return this.request('/products');
  }

  static async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  static async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  static async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  static async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  static async updateProductStock(id, stockData) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: stockData,
    });
  }

  static async getLowStockProducts() {
    return this.request('/products/alerts/low-stock');
  }

  // Sales
  static async getSales(limit = 100, offset = 0) {
    return this.request(`/sales?limit=${limit}&offset=${offset}`);
  }

  static async getSale(id) {
    return this.request(`/sales/${id}`);
  }

  static async createSale(saleData) {
    return this.request('/sales', {
      method: 'POST',
      body: saleData,
    });
  }

  static async getSalesByDateRange(startDate, endDate) {
    return this.request(`/sales/reports/date-range?start_date=${startDate}&end_date=${endDate}`);
  }

  static async getSalesStats(startDate, endDate) {
    return this.request(`/sales/reports/stats?start_date=${startDate}&end_date=${endDate}`);
  }

  // Customers
  static async getCustomers() {
    return this.request('/customers');
  }

  static async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  static async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: customerData,
    });
  }

  static async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: customerData,
    });
  }

  static async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  static async findCustomerByPhone(phone) {
    return this.request(`/customers/search/phone/${phone}`);
  }

  static async getCustomerSales(id) {
    return this.request(`/customers/${id}/sales`);
  }

  // Suppliers
  static async getSuppliers() {
    return this.request('/suppliers');
  }

  static async getSupplier(id) {
    return this.request(`/suppliers/${id}`);
  }

  static async createSupplier(supplierData) {
    return this.request('/suppliers', {
      method: 'POST',
      body: supplierData,
    });
  }

  static async updateSupplier(id, supplierData) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: supplierData,
    });
  }

  static async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  static async getSupplierProducts(id) {
    return this.request(`/suppliers/${id}/products`);
  }

  // Expenses
  static async getExpenses() {
    return this.request('/expenses');
  }

  static async getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  static async createExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      body: expenseData,
    });
  }

  static async updateExpense(id, expenseData) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: expenseData,
    });
  }

  static async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  static async getExpensesByDateRange(startDate, endDate) {
    return this.request(`/expenses/reports/date-range?start_date=${startDate}&end_date=${endDate}`);
  }

  static async getExpensesStats(startDate, endDate) {
    return this.request(`/expenses/reports/stats?start_date=${startDate}&end_date=${endDate}`);
  }

  static async getExpenseCategories() {
    return this.request('/expenses/categories/all');
  }

  // Categories
  static async getCategories() {
    return this.request('/categories');
  }

  // Health check
  static async healthCheck() {
    return this.request('/health');
  }
}

export default ApiService;