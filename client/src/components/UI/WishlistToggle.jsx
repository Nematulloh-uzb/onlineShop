import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api, getApiErrorMessage } from '../../lib/api.js';

export default function WishlistToggle({ productId, className = '' }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data.data.wishlist;
    },
    enabled: Boolean(user),
  });
  const isSaved = wishlistQuery.data?.some((product) => product._id === productId) || false;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const { data } = isSaved
        ? await api.delete(`/wishlist/${productId}`)
        : await api.post(`/wishlist/${productId}`);
      return data.data.wishlist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const handleClick = () => {
    if (!user) {
      navigate('/kirish', { state: { from: location } });
      return;
    }
    toggleMutation.mutate();
  };

  return (
    <span className="relative inline-flex flex-col items-center">
      <button
        type="button"
        aria-label={isSaved ? 'Istaklardan olib tashlash' : 'Istaklarga qo‘shish'}
        aria-pressed={isSaved}
        disabled={toggleMutation.isPending || wishlistQuery.isError}
        onClick={handleClick}
        className={`inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <Heart
          size={19}
          fill={isSaved ? 'currentColor' : 'none'}
          aria-hidden="true"
          className={isSaved ? 'text-red-600' : ''}
        />
      </button>
      {toggleMutation.isError && (
        <span role="alert" className="absolute right-0 top-full z-30 mt-1 w-44 rounded-md bg-white p-2 font-['Inter'] text-[11px] text-red-700 shadow-card">
          {getApiErrorMessage(toggleMutation.error, 'Istaklar ro‘yxatini yangilab bo‘lmadi.')}
        </span>
      )}
      {wishlistQuery.isError && (
        <span role="alert" className="absolute right-0 top-full z-30 mt-1 w-44 rounded-md bg-white p-2 font-['Inter'] text-[11px] text-red-700 shadow-card">
          {getApiErrorMessage(wishlistQuery.error, 'Istaklar ro‘yxatini yuklab bo‘lmadi.')}
        </span>
      )}
    </span>
  );
}
