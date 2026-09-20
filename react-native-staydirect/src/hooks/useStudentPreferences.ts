import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StudentPreferences } from '../types/database.types';

const PREFERENCES_STORAGE_KEY = '@staydirect_student_preferences';

export const DEFAULT_STUDENT_PREFERENCES: Partial<StudentPreferences> = {
  preferred_areas: ['Kothrud', 'Hinjewadi'],
  min_budget: 6000,
  max_budget: 14000,
  preferred_room_types: ['Double Sharing', 'Single Room'],
  preferred_occupancy: ['Double', 'Single'],
  food_preference: 'any',
  gender_preference: 'any',
  required_amenities: ['High-speed Wi-Fi', '24/7 CCTV & Security Guard'],
  personalization_enabled: true,
};

export function useStudentPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['student-preferences', user?.id],
    queryFn: async (): Promise<StudentPreferences | null> => {
      // 1. Check local AsyncStorage first
      let localPrefs: StudentPreferences | null = null;
      try {
        const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (stored) {
          localPrefs = JSON.parse(stored);
        }
      } catch (e) {
        console.debug('Error reading local prefs:', e);
      }

      // If user is authenticated, query Supabase
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('student_preferences')
            .select('*')
            .eq('student_id', user.id)
            .maybeSingle();

          if (!error && data) {
            // Sync to local storage
            await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
            return data as StudentPreferences;
          }
        } catch (err) {
          console.debug('Remote preferences fetch error:', err);
        }
      }

      return localPrefs;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const savePreferences = useMutation({
    mutationFn: async (prefs: Partial<StudentPreferences>) => {
      const updatedData: Partial<StudentPreferences> = {
        ...DEFAULT_STUDENT_PREFERENCES,
        ...query.data,
        ...prefs,
        updated_at: new Date().toISOString(),
      };

      // Always save locally
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedData));

      // If logged in, upsert into Supabase
      if (user?.id) {
        const payload = {
          student_id: user.id,
          preferred_areas: updatedData.preferred_areas || [],
          min_budget: updatedData.min_budget || 5000,
          max_budget: updatedData.max_budget || 15000,
          preferred_room_types: updatedData.preferred_room_types || [],
          preferred_occupancy: updatedData.preferred_occupancy || [],
          food_preference: updatedData.food_preference || 'any',
          gender_preference: updatedData.gender_preference || 'any',
          required_amenities: updatedData.required_amenities || [],
          move_in_date: updatedData.move_in_date || null,
          personalization_enabled: updatedData.personalization_enabled ?? true,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('student_preferences')
          .upsert(payload, { onConflict: 'student_id' })
          .select()
          .single();

        if (error) {
          console.warn('Could not save preferences to Supabase, saved locally:', error.message);
        } else if (data) {
          return data as StudentPreferences;
        }
      }

      return updatedData as StudentPreferences;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['student-preferences', user?.id], saved);
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    savePreferences,
  };
}
