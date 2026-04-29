import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  CheckSquare,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  UserCircle2,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function Layout({ children, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Contacts', href: '/contacts', icon: UserCircle2 },
    { name: 'Accounts', href: '/accounts', icon: Building2 },
    { name: 'Deals', href: '/deals', icon: TrendingUp },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut(auth);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">CRM Pro</span>
            </div>
          ) : (
            <Building2 className="w-8 h-8 text-blue-600 mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={sidebarOpen ? undefined : item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || 'https://via.placeholder.com/40'}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
