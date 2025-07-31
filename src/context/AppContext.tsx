import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import ApiService from '../services/api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  barcode?: string;
  description?: string;
  createdAt: Date;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date: Date;
  invoiceNumber: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchase?: Date;
  createdAt: Date;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  products: string[];
  createdAt: Date;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  receipt?: string;
}

interface AppState {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
}

type AppAction = 
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; newStock: number } };

const initialState: AppState = {
  products: [
    {
      id: '1',
      name: 'Sabun Mandi Lifebuoy',
      category: 'Sabun & Deterjen',
      price: 5000,
      cost: 3500,
      stock: 150,
      minStock: 20,
      supplier: 'PT Unilever Indonesia',
      barcode: '8999999001234',
      description: 'Sabun mandi antibakteri dengan perlindungan 10x',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Mie Instan Indomie Goreng',
      category: 'Makanan Instan',
      price: 3000,
      cost: 2100,
      stock: 200,
      minStock: 30,
      supplier: 'PT Indofood Sukses Makmur',
      barcode: '8999999005678',
      description: 'Mie instan goreng rasa original',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Kopi Kapal Api Special',
      category: 'Minuman',
      price: 2500,
      cost: 1800,
      stock: 80,
      minStock: 15,
      supplier: 'PT Santos Jaya Abadi',
      barcode: '8999999009012',
      description: 'Kopi bubuk premium kualitas terbaik',
      createdAt: new Date('2024-01-12')
    },
    {
      id: '4',
      name: 'Beras Premium 5kg',
      category: 'Beras & Tepung',
      price: 65000,
      cost: 55000,
      stock: 25,
      minStock: 5,
      supplier: 'CV Beras Nusantara',
      barcode: '8999999013456',
      description: 'Beras premium kualitas super',
      createdAt: new Date('2024-01-08')
    },
    {
      id: '5',
      name: 'Aqua Botol 600ml',
      category: 'Minuman',
      price: 3500,
      cost: 2500,
      stock: 12,
      minStock: 24,
      supplier: 'PT Aqua Golden Mississippi',
      barcode: '8999999017890',
      description: 'Air mineral dalam kemasan botol',
      createdAt: new Date('2024-01-20')
    }
  ],
  sales: [
    {
      id: 'S001',
      customerName: 'Ibu Sari',
      customerPhone: '081234567890',
      items: [
        { productId: '1', productName: 'Sabun Mandi Lifebuoy', quantity: 2, price: 5000, total: 10000 },
        { productId: '2', productName: 'Mie Instan Indomie Goreng', quantity: 5, price: 3000, total: 15000 }
      ],
      subtotal: 25000,
      tax: 2500,
      total: 27500,
      paymentMethod: 'Tunai',
      date: new Date('2024-01-22'),
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: 'S002',
      customerName: 'Bapak Andi',
      customerPhone: '081234567891',
      items: [
        { productId: '4', productName: 'Beras Premium 5kg', quantity: 1, price: 65000, total: 65000 },
        { productId: '3', productName: 'Kopi Kapal Api Special', quantity: 3, price: 2500, total: 7500 }
      ],
      subtotal: 72500,
      tax: 7250,
      total: 79750,
      paymentMethod: 'Transfer Bank',
      date: new Date('2024-01-21'),
      invoiceNumber: 'INV-2024-002'
    }
  ],
  customers: [
    {
      id: 'C001',
      name: 'Ibu Sari',
      phone: '081234567890',
      email: 'sari@email.com',
      address: 'Jl. Merdeka No. 123',
      totalPurchases: 127500,
      lastPurchase: new Date('2024-01-22'),
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'C002',
      name: 'Bapak Andi',
      phone: '081234567891',
      email: 'andi@email.com',
      address: 'Jl. Sudirman No. 456',
      totalPurchases: 79750,
      lastPurchase: new Date('2024-01-21'),
      createdAt: new Date('2024-01-10')
    }
  ],
  suppliers: [
    {
      id: 'SUP001',
      name: 'PT Unilever Indonesia',
      phone: '02154321000',
      email: 'contact@unilever.com',
      address: 'Jl. BSD Boulevard Barat, Tangerang',
      products: ['Sabun Mandi Lifebuoy'],
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'SUP002',
      name: 'PT Indofood Sukses Makmur',
      phone: '02154321001',
      email: 'info@indofood.com',
      address: 'Jl. Sudirman Kav. 76-78, Jakarta',
      products: ['Mie Instan Indomie Goreng'],
      createdAt: new Date('2024-01-01')
    }
  ],
  expenses: [
    {
      id: 'E001',
      description: 'Listrik Bulanan',
      amount: 850000,
      category: 'Utilitas',
      date: new Date('2024-01-15')
    },
    {
      id: 'E002',
      description: 'Sewa Toko',
      amount: 3000000,
      category: 'Sewa',
      date: new Date('2024-01-01')
    },
    {
      id: 'E003',
      description: 'Gaji Karyawan',
      amount: 4500000,
      category: 'Gaji',
      date: new Date('2024-01-01')
    }
  ]
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload)
      };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s)
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.payload)
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e)
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload)
      };
    case 'UPDATE_STOCK':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.productId 
            ? { ...p, stock: action.payload.newStock }
            : p
        )
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  api: typeof ApiService;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch, api: ApiService }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type { Product, Sale, Customer, Supplier, Expense };