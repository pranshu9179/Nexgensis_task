import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Top navigation bar — always visible on authenticated pages.
 *
 * On mobile, the nav links collapse behind a hamburger menu
 * to keep the bar compact on small screens.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Brand ── */}
          <Link
            to="/products"
            className="flex items-center gap-2 text-brand-600 font-bold text-lg hover:text-brand-700"
          >
            <Package className="w-6 h-6" />
            <span className="hidden sm:inline">ProductHub</span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className="text-sm font-medium text-gray-600 hover:text-brand-600"
            >
              Products
            </Link>
            <Link
              to="/products/new"
              className="text-sm font-medium text-gray-600 hover:text-brand-600"
            >
              Add Product
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                           text-gray-600 hover:text-danger-500 rounded-md hover:bg-red-50
                           transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-brand-50"
            >
              Products
            </Link>
            <Link
              to="/products/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-brand-50"
            >
              Add Product
            </Link>
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="px-3 py-1 text-xs text-gray-400">
                Signed in as <span className="font-medium text-gray-600">{user?.username}</span>
              </p>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-danger-500
                           rounded-md hover:bg-red-50 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
