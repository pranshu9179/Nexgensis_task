import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductFormPage from './pages/ProductFormPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
