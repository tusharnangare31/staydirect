import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SavedSearch } from '../types/database.types';

const LOCAL_SAVED_SEARCHES_KEY = '@staydirect_saved_searches';

export function useSavedSearches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async (): Promise<SavedSearch[]> => {
      let localSearches: SavedSearch[] = [];
      try {
        const raw = await AsyncStorage.getItem(LOCAL_SAVED_SEARCHES_KEY);
        if (raw) {
          localSearches = JSON.parse(raw);
        }
      } catch (e) {
        console.debug('Error reading local saved searches:', e);
      }

      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('saved_searches')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            await AsyncStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(data));
            return data as SavedSearch[];
          }
        } catch (err) {
          console.debug('Remote saved searches fetch error:', err);
        }
      }

      return localSearches;
    },
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  const saveSearch = useMutation({
    mutationFn: async ({
      name,
      query: searchQuery,
      filters,
      notificationEnabled = true,
    }: {
      name: string;
      query?: string;
      filters: Record<string, any>;
      notificationEnabled?: boolean;
    }) => {
      const newSearch: SavedSearch = {
        id: 'local-' + Date.now(),
        student_id: user?.id || 'guest',
        name,
        query: searchQuery || null,
        filters,
        notification_enabled: notificationEnabled,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (user?.id) {
        const { data, error } = await supabase
          .from('saved_searches')
          .insert([
            {
              student_id: user.id,
              name,
              query: searchQuery || null,
              filters,
              notification_enabled: notificationEnabled,
              active: true,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return data as SavedSearch;
        }
      }

      // Fallback local update
      const current = query.data || [];
      const updated = [newSearch, ...current];
      await AsyncStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(updated));
      return newSearch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const toggleNotification = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      if (user?.id && !id.startsWith('local-')) {
        await supabase
          .from('saved_searches')
          .update({ notification_enabled: enabled, updated_at: new Date().toISOString() })
          .eq('id', id);
      }

      const current = query.data || [];
      const updated = current.map((s) =>
        s.id === id ? { ...s, notification_enabled: enabled } : s
      );
      await AsyncStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['saved-searches', user?.id], updated);
    },
  });

  const deleteSavedSearch = useMutation({
    mutationFn: async (id: string) => {
      if (user?.id && !id.startsWith('local-')) {
        await supabase.from('saved_searches').delete().eq('id', id);
      }

      const current = query.data || [];
      const updated = current.filter((s) => s.id !== id);
      await AsyncStorage.setItem(LOCAL_SAVED_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['saved-searches', user?.id], updated);
    },
  });

  return {
    savedSearches: query.data || [],
    isLoading: query.isLoading,
    saveSearch,
    toggleNotification: toggleNotification.mutate,
    deleteSavedSearch: deleteSavedSearch.mutate,
  };
}
