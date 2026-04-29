import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserProfile } from './UserProfile';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Archive,
  CreditCard,
  BarChart3,
  Store,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  UserCog
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const allMenuItems = [
  { id: 'dashboard',  label: 'Dashboard',    icon: Home,        roles: ['admin', 'manager', 'cashier'] },
  { id: 'sales',      label: 'Penjualan',    icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { id: 'products',   label: 'Produk',       icon: Package,     roles: ['admin', 'manager', 'cashier'] },
  { id: 'customers',  label: 'Pelanggan',    icon: Users,       roles: ['admin', 'manager', 'cashier'] },
  { id: 'inventory',  label: 'Inventory',    icon: Archive,     roles: ['admin', 'manager'] },
  { id: 'suppliers',  label: 'Supplier',     icon: Truck,       roles: ['admin', 'manager'] },
  { id: 'expenses',   label: 'Pengeluaran',  icon: CreditCard,  roles: ['admin', 'manager'] },
  { id: 'reports',    label: 'Laporan',      icon: BarChart3,   roles: ['admin', 'manager'] },
  { id: 'users',      label: 'Kelola User',  icon: UserCog,     roles: ['admin'] },
];

const roleBadge: Record<string, string> = {
  admin:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  manager: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  cashier: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};
const roleLabel: Record<string, string> = {
  admin: 'Admin', manager: 'Manager', cashier: 'Kasir',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { state, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const role = state.user?.role ?? 'cashier';
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Sidebar ───────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0`}>

        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">TokoPro</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Role badge in sidebar */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{state.user?.username}</p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[role]}`}>
                {roleLabel[role]}
              </span>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors duration-200
                  ${activeTab === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3 ml-auto">
              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{state.user?.username}</div>
                    <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-full inline-block ${roleBadge[role]}`}>
                      {roleLabel[role]}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{state.user?.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{state.user?.email}</div>
                    </div>
                    <button
                      onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Pengaturan Profil
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* Click outside user menu */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </div>
  );
};
