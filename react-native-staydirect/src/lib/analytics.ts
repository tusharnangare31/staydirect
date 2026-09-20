import { supabase } from './supabase';
import { SearchAnalyticsEventType } from '../types/database.types';

export interface LogAnalyticsParams {
  eventType: SearchAnalyticsEventType;
  searchTerm?: string;
  area?: string;
  filtersApplied?: Record<string, any>;
  hostelId?: string;
  resultsCount?: number;
  userId?: string;
}

export async function logSearchAnalytics(params: LogAnalyticsParams): Promise<void> {
  try {
    const payload = {
      event_type: params.eventType,
      search_term: params.searchTerm ? params.searchTerm.trim().slice(0, 100) : null,
      area: params.area || null,
      filters_applied: params.filtersApplied || {},
      hostel_id: params.hostelId || null,
      results_count: params.resultsCount !== undefined ? params.resultsCount : 0,
      user_id: params.userId || null,
    };

    // Asynchronously insert without blocking the user interface
    supabase
      .from('search_analytics')
      .insert([payload])
      .then(({ error }) => {
        if (error) {
          // Silent catch to prevent UI interruption
          console.debug('[Analytics] Supabase event logging note:', error.message);
        }
      })
      .catch(() => {});
  } catch (err) {
    // Non-blocking
  }
}
