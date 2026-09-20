import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hostel } from '../types/database.types';
import { supabase } from './supabase';
import { logSearchAnalytics } from './analytics';

const RECENTLY_VIEWED_KEY = '@staydirect_recently_viewed';
const MAX_RECENT = 20;

export async function addRecentlyViewed(hostel: Hostel, userId?: string | null): Promise<void> {
  try {
    // 1. Local Cache update
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: Hostel[] = raw ? JSON.parse(raw) : [];

    // Filter out if already in list to put it at the front
    list = list.filter((item) => item.id !== hostel.id);
    list.unshift(hostel);

    if (list.length > MAX_RECENT) {
      list = list.slice(0, MAX_RECENT);
    }

    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));

    // 2. Log analytics
    logSearchAnalytics({
      eventType: 'hostel_opened',
      hostelId: hostel.id,
      area: hostel.area,
      userId: userId || undefined,
    });

    // 3. If logged in, record in Supabase database
    if (userId) {
      // Call RPC or upsert
      supabase
        .rpc('record_hostel_view', {
          p_student_id: userId,
          p_hostel_id: hostel.id,
        })
        .then(({ error }) => {
          if (error) {
            // Fallback direct upsert if RPC not present
            supabase
              .from('recently_viewed_hostels')
              .upsert(
                { student_id: userId, hostel_id: hostel.id, viewed_at: new Date().toISOString() },
                { onConflict: 'student_id,hostel_id' }
              )
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (err) {
    console.debug('Could not save recently viewed hostel:', err);
  }
}

export async function getRecentlyViewed(userId?: string | null): Promise<Hostel[]> {
  try {
    // Check local storage first
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    const localList: Hostel[] = raw ? JSON.parse(raw) : [];

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('recently_viewed_hostels')
          .select(`
            viewed_at,
            hostel:hostels(
              *,
              images:hostel_images(*),
              rooms:rooms(*),
              amenities:amenities(*),
              owner:profiles(*)
            )
          `)
          .eq('student_id', userId)
          .order('viewed_at', { ascending: false })
          .limit(MAX_RECENT);

        if (!error && data && data.length > 0) {
          const remoteList = data
            .map((item: any) => item.hostel)
            .filter((h: any) => h && h.id) as Hostel[];
          if (remoteList.length > 0) {
            // Update local storage with remote sync
            await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(remoteList));
            return remoteList;
          }
        }
      } catch (e) {
        console.debug('Remote recently viewed fetch note:', e);
      }
    }

    return localList;
  } catch (err) {
    console.debug('Could not read recently viewed hostels:', err);
    return [];
  }
}

export async function clearRecentlyViewed(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);

    if (userId) {
      await supabase
        .from('recently_viewed_hostels')
        .delete()
        .eq('student_id', userId);
    }
  } catch (err) {
    console.debug('Could not clear recently viewed hostels:', err);
  }
}
