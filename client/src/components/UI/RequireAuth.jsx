import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function RequireAuth() {
  const { status, authError } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingSpinner />;

  if (status === 'error') {
    return (
      <div role="alert" className="mx-auto my-16 max-w-xl rounded-xl bg-white p-8 text-center shadow-card">
        <h1 className="font-['Playfair_Display'] text-2xl font-semibold">Hisob tekshirilmadi</h1>
        <p className="mt-3 font-['Inter'] text-sm text-[#6B6B6B]">{authError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-[#8A9A5B] px-5 py-3 font-['Inter'] text-sm font-semibold text-white"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/kirish" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
