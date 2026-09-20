import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Hostel } from '../types/database.types';
import { getRecentlyViewed, addRecentlyViewed, clearRecentlyViewed } from '../lib/recentlyViewed';

export function useRecentlyViewed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['recently-viewed', user?.id],
    queryFn: () => getRecentlyViewed(user?.id),
    staleTime: 1000 * 30, // 30s
  });

  const recordView = useMutation({
    mutationFn: async (hostel: Hostel) => {
      await addRecentlyViewed(hostel, user?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      await clearRecentlyViewed(user?.id);
    },
    onSuccess: () => {
      queryClient.setQueryData(['recently-viewed', user?.id], []);
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  return {
    recentlyViewed: query.data || [],
    isLoading: query.isLoading,
    recordView: recordView.mutate,
    clearHistory: clearHistory.mutate,
    isClearing: clearHistory.isPending,
  };
}
