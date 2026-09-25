import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

/**
 * Route-level auth guard. Wraps all product routes so that unauthenticated
 * users are always bounced to `/login` — this is the router-level protection
 * the assignment requires (as opposed to just hiding links).
 *
 * Uses React Router's `<Outlet />` to render the matched child route.
 */
export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    // `replace` prevents the login page from appearing in the back-button
    // history, which would create an annoying redirect loop.
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </>
  );
}
