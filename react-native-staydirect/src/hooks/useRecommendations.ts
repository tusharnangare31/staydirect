import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHostels } from './useHostels';
import { useStudentPreferences } from './useStudentPreferences';
import { useFavorites } from './useFavorites';
import { useRecentlyViewed } from './useRecentlyViewed';
import { Hostel, RecommendedHostel } from '../types/database.types';

export interface RecommendationSections {
  recommendedForYou: RecommendedHostel[];
  basedOnSaved: RecommendedHostel[];
  nearPreferredArea: RecommendedHostel[];
  withinBudget: RecommendedHostel[];
  popularWithStudents: RecommendedHostel[];
  recentlyAddedVerified: RecommendedHostel[];
  isPersonalizationEnabled: boolean;
}

export function useRecommendations(): {
  sections: RecommendationSections;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data: allHostels = [], isLoading: isHostelsLoading, refetch } = useHostels();
  const { preferences, isLoading: isPrefsLoading } = useStudentPreferences();
  const { favorites = [] } = useFavorites();
  const { recentlyViewed = [] } = useRecentlyViewed();

  const isPersonalizationEnabled = preferences?.personalization_enabled ?? true;

  const sections = useMemo<RecommendationSections>(() => {
    if (!allHostels || allHostels.length === 0) {
      return {
        recommendedForYou: [],
        basedOnSaved: [],
        nearPreferredArea: [],
        withinBudget: [],
        popularWithStudents: [],
        recentlyAddedVerified: [],
        isPersonalizationEnabled,
      };
    }

    // Extract saved hostel IDs and areas
    const savedHostelIds = new Set(favorites.map((f) => f.hostel_id || (f as any).id));
    const savedAreas = new Set(
      favorites
        .map((f) => f.hostel?.area)
        .filter(Boolean) as string[]
    );

    // Extract recently viewed areas
    const viewedAreas = new Set(recentlyViewed.map((h) => h.area));

    const preferredAreas = (preferences?.preferred_areas && preferences.preferred_areas.length > 0)
      ? preferences.preferred_areas
      : Array.from(new Set([...Array.from(savedAreas), ...Array.from(viewedAreas)]));

    const minBudget = preferences?.min_budget ?? 6000;
    const maxBudget = preferences?.max_budget ?? 14000;
    const requiredAmenities = preferences?.required_amenities ?? [];
    const preferredGender = preferences?.gender_preference ?? 'any';

    // 1. Scoring logic for each hostel
    const scoredHostels: RecommendedHostel[] = allHostels.map((hostel) => {
      let score = 0;
      const reasons: string[] = [];

      // Base quality score
      if (hostel.verification_status === 'verified') {
        score += 20;
      }
      if (hostel.rating && hostel.rating >= 4.5) {
        score += 15;
      } else if (hostel.rating && hostel.rating >= 4.0) {
        score += 10;
      }

      if (!isPersonalizationEnabled) {
        // If personalization disabled, score solely by rating, reviews and verification
        return {
          hostel,
          score,
          reasons: ['Top Verified Hostel in Pune'],
          primaryReason: 'Verified Student Stay',
        };
      }

      // Personalized scores:
      // Area match
      const isAreaMatch = preferredAreas.some((a) =>
        hostel.area.toLowerCase().includes(a.toLowerCase())
      );
      if (isAreaMatch) {
        score += 35;
        reasons.push(`Located in your preferred area (${hostel.area})`);
      }

      // Budget match
      const rent = hostel.monthly_rent_min || hostel.monthly_rent || 0;
      if (rent > 0 && rent >= minBudget && rent <= maxBudget) {
        score += 30;
        reasons.push(`Matches your budget (₹${rent.toLocaleString('en-IN')}/mo)`);
      }

      // Gender preference match
      if (preferredGender !== 'any') {
        if (hostel.gender_preference === preferredGender || hostel.gender_preference === 'co-ed') {
          score += 15;
        }
      }

      // Saved hostel similarity (same area or price tier as a saved hostel)
      const matchesSavedArea = savedAreas.has(hostel.area);
      if (matchesSavedArea && !savedHostelIds.has(hostel.id)) {
        score += 25;
        reasons.push('Similar to a hostel you saved');
      }

      // Amenities match
      if (requiredAmenities.length > 0 && hostel.amenities && hostel.amenities.length > 0) {
        const hostelAmenityNames = hostel.amenities.map((a: any) =>
          (typeof a === 'string' ? a : a.name || a.amenity?.name || '').toLowerCase()
        );
        const matchCount = requiredAmenities.filter((req) =>
          hostelAmenityNames.some((ha) => ha.includes(req.toLowerCase()))
        ).length;

        if (matchCount > 0) {
          score += matchCount * 8;
          reasons.push('Includes your selected amenities');
        }
      }

      // Popularity
      if ((hostel.review_count || 0) >= 30) {
        score += 10;
        reasons.push('Popular with Pune students');
      }

      if (reasons.length === 0) {
        reasons.push('Verified student stay');
      }

      return {
        hostel,
        score,
        reasons,
        primaryReason: reasons[0],
      };
    });

    // Sort descending by composite score
    const sortedRecommendations = [...scoredHostels].sort((a, b) => b.score - a.score);

    // 2. Based on Saved Hostels
    const basedOnSaved = scoredHostels
      .filter((item) => !savedHostelIds.has(item.hostel.id) && savedAreas.has(item.hostel.area))
      .slice(0, 6);

    // 3. Near Preferred Area
    const nearPreferredArea = scoredHostels
      .filter((item) =>
        preferredAreas.some((area) =>
          item.hostel.area.toLowerCase().includes(area.toLowerCase())
        )
      )
      .slice(0, 6);

    // 4. Within Budget
    const withinBudget = scoredHostels
      .filter((item) => {
        const rent = item.hostel.monthly_rent_min || item.hostel.monthly_rent || 0;
        return rent > 0 && rent >= minBudget && rent <= maxBudget;
      })
      .slice(0, 6);

    // 5. Popular with Students (high ratings and reviews)
    const popularWithStudents = [...allHostels]
      .sort((a, b) => (b.review_count || 0) * (b.rating || 1) - (a.review_count || 0) * (a.rating || 1))
      .slice(0, 6)
      .map((h) => ({
        hostel: h,
        score: 90,
        reasons: ['Highest rated by verified students', '4.8+ Stars with 40+ reviews'],
        primaryReason: 'Popular with Students',
      }));

    // 6. Recently Added Verified Stays
    const recentlyAddedVerified = [...allHostels]
      .filter((h) => h.verification_status === 'verified')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
      .map((h) => ({
        hostel: h,
        score: 80,
        reasons: ['Newly verified by StayDirect safety team', 'Direct owner contact'],
        primaryReason: 'New Verified Stay',
      }));

    return {
      recommendedForYou: sortedRecommendations.slice(0, 8),
      basedOnSaved: basedOnSaved.length > 0 ? basedOnSaved : sortedRecommendations.slice(0, 4),
      nearPreferredArea: nearPreferredArea.length > 0 ? nearPreferredArea : sortedRecommendations.slice(0, 4),
      withinBudget: withinBudget.length > 0 ? withinBudget : sortedRecommendations.slice(0, 4),
      popularWithStudents,
      recentlyAddedVerified,
      isPersonalizationEnabled,
    };
  }, [allHostels, preferences, favorites, recentlyViewed, isPersonalizationEnabled]);

  return {
    sections,
    isLoading: isHostelsLoading || isPrefsLoading,
    refetch,
  };
}
