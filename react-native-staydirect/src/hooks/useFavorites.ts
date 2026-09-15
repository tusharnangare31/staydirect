import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Hostel } from '../types/database.types';

export interface FavoriteItem {
  id: string;
  user_id: string;
  hostel_id: string;
  created_at: string;
  hostel?: Hostel;
}

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          hostel_id,
          created_at,
          hostel:hostels(
            id,
            name,
            area,
            city,
            monthly_rent,
            security_deposit,
            gender_preference,
            verification_status,
            latitude,
            longitude,
            images:hostel_images(storage_path, sort_order),
            rooms:rooms(room_type, monthly_rent, available_beds)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch favorites warning:', error.message);
        return [];
      }
      return (data || []) as FavoriteItem[];
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (hostelId: string) => {
      if (!user?.id) {
        throw new Error('Please sign in to save favorite hostels.');
      }

      // Check if already in favorites
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('hostel_id', hostelId)
        .maybeSingle();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('hostel_id', hostelId);

        if (error) throw error;
        return { action: 'removed', hostelId };
      } else {
        // Insert into favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            hostel_id: hostelId,
          });

        if (error) throw error;
        return { action: 'added', hostelId };
      }
    },
    // Optimistic Update
    onMutate: async (hostelId: string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData<FavoriteItem[]>(['favorites', user?.id]);

      if (previousFavorites) {
        const isCurrentlyFavorited = previousFavorites.some((f) => f.hostel_id === hostelId);
        if (isCurrentlyFavorited) {
          queryClient.setQueryData<FavoriteItem[]>(
            ['favorites', user?.id],
            previousFavorites.filter((f) => f.hostel_id !== hostelId)
          );
        } else {
          const optimisticItem: FavoriteItem = {
            id: `temp-${Date.now()}`,
            user_id: user?.id || '',
            hostel_id: hostelId,
            created_at: new Date().toISOString(),
          };
          queryClient.setQueryData<FavoriteItem[]>(
            ['favorites', user?.id],
            [optimisticItem, ...previousFavorites]
          );
        }
      }

      return { previousFavorites };
    },
    onError: (err, hostelId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const favoriteIds = new Set(favoritesQuery.data?.map((f) => f.hostel_id) || []);

  const isFavorite = (hostelId: string) => favoriteIds.has(hostelId);

  return {
    favorites: favoritesQuery.data || [],
    favoriteIds,
    isLoading: favoritesQuery.isLoading,
    isFavorite,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    refetch: favoritesQuery.refetch,
    isRefetching: favoritesQuery.isRefetching,
  };
}
