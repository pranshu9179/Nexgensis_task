import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductFormPage from './pages/ProductFormPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * App root — sets up the router and auth provider.
 *
 * Route structure:
 *   /login            → public
 *   /products         → protected (list)
 *   /products/new     → protected (add)
 *   /products/:id     → protected (details)
 *   /products/:id/edit → protected (edit)
 *   *                  → 404
 *
 * The root path `/` redirects to `/products` so there's always a
 * meaningful landing page (ProtectedRoute will bounce to login if needed).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all product routes live under ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<ProductListPage />} />
            {/* /products/new must come before /products/:id so React Router
                doesn't treat "new" as a product id */}
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
