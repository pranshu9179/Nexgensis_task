import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/authApi';
import { LogIn, Loader2, Package, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/products" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const data = await loginApi(username, password);
      login(data);
      navigate('/products', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-brand-500 text-white shadow-lg shadow-brand-500/25 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ProductHub</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your products</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 text-sm text-danger-500 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. emilys"
                required
                autoComplete="username"
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400
                           focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400
                             focus:bg-white transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400
                             hover:text-gray-600 focus:outline-none focus:text-brand-600
                             transition-colors rounded-lg cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold
                         text-white bg-brand-500 rounded-xl hover:bg-brand-600
                         active:scale-[0.98] transition-all shadow-md shadow-brand-500/20
                         disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Test credentials: <code className="text-brand-600">emilys</code> / <code className="text-brand-600">emilyspass</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
