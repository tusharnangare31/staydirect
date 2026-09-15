import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hostel } from '../types/database.types';

const RECENTLY_VIEWED_KEY = '@staydirect_recently_viewed';
const MAX_RECENT = 8;

export async function addRecentlyViewed(hostel: Hostel): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: Hostel[] = raw ? JSON.parse(raw) : [];

    // Filter out if already in list to put it at the front
    list = list.filter((item) => item.id !== hostel.id);
    list.unshift(hostel);

    if (list.length > MAX_RECENT) {
      list = list.slice(0, MAX_RECENT);
    }

    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (err) {
    // Non-fatal error
    console.warn('Could not save recently viewed hostel:', err);
  }
}

export async function getRecentlyViewed(): Promise<Hostel[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Hostel[];
  } catch (err) {
    console.warn('Could not read recently viewed hostels:', err);
    return [];
  }
}

export async function clearRecentlyViewed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (err) {
    console.warn('Could not clear recently viewed hostels:', err);
  }
}
