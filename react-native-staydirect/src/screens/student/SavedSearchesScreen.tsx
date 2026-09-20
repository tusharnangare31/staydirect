import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { SavedSearch, AdvancedSearchFilters } from '../../types/database.types';

interface SavedSearchesScreenProps {
  onBack: () => void;
  onSelectSearch: (filters: AdvancedSearchFilters, query?: string) => void;
}

export const SavedSearchesScreen: React.FC<SavedSearchesScreenProps> = ({
  onBack,
  onSelectSearch,
}) => {
  const { savedSearches, isLoading, toggleNotification, deleteSavedSearch } = useSavedSearches();

  const handleRunSearch = (item: SavedSearch) => {
    const filters: AdvancedSearchFilters = {
      query: item.query || undefined,
      area: item.filters?.area,
      gender: item.filters?.gender,
      minRent: item.filters?.minRent,
      maxRent: item.filters?.maxRent,
      roomTypes: item.filters?.roomTypes,
      amenities: item.filters?.amenities,
      foodPreference: item.filters?.foodPreference,
      verifiedHostelOnly: item.filters?.verifiedHostelOnly,
    };
    onSelectSearch(filters, item.query || undefined);
  };

  const handleDelete = (item: SavedSearch) => {
    Alert.alert('Delete Saved Search', `Are you sure you want to remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSavedSearch(item.id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Saved Search Alerts"
        subtitle="Get notified when new verified hostels match"
        showBack
        onBack={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="notifications" size={20} color={THEME.colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoBannerTitle}>Instant Hostel Alerts</Text>
            <Text style={styles.infoBannerText}>
              When new verified rooms match your budget or preferred Pune area, StayDirect sends you a notification directly with zero spam.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading saved searches...</Text>
          </View>
        ) : savedSearches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bookmark-outline" size={32} color={THEME.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Saved Searches Yet</Text>
            <Text style={styles.emptySubtitle}>
              When searching for hostels, tap "Save Search Alert" to save your custom filters and get notified as soon as verified beds are listed.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={onBack}>
              <Text style={styles.exploreBtnText}>Go to Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {savedSearches.map((item) => {
              const filters = item.filters || {};
              const filterBadges: string[] = [];
              if (filters.area && filters.area !== 'All Pune') filterBadges.push(filters.area);
              if (filters.maxRent) filterBadges.push(`Under ₹${filters.maxRent.toLocaleString('en-IN')}`);
              if (filters.gender && filters.gender !== 'All') filterBadges.push(filters.gender);
              if (filters.roomTypes && filters.roomTypes.length > 0)
                filterBadges.push(`${filters.roomTypes.length} room types`);
              if (filters.amenities && filters.amenities.length > 0)
                filterBadges.push(`${filters.amenities.length} amenities`);

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      {item.query ? (
                        <Text style={styles.cardQuery}>Query: "{item.query}"</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Filter Badges */}
                  <View style={styles.badgeRow}>
                    {filterBadges.map((badge, idx) => (
                      <View key={idx} style={styles.filterPill}>
                        <Text style={styles.filterPillText}>{badge}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Notification Toggle Row */}
                  <View style={styles.toggleRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name={item.notification_enabled ? 'notifications' : 'notifications-off'}
                        size={16}
                        color={item.notification_enabled ? THEME.colors.primary : THEME.colors.textMuted}
                      />
                      <Text style={styles.toggleLabel}>
                        {item.notification_enabled ? 'Alerts Enabled' : 'Alerts Paused'}
                      </Text>
                    </View>
                    <Switch
                      value={item.notification_enabled}
                      onValueChange={(val) => toggleNotification({ id: item.id, enabled: val })}
                      trackColor={{ false: '#CBD5E1', true: THEME.colors.primary }}
                      thumbColor="#FFF"
                    />
                  </View>

                  {/* Run Search Button */}
                  <TouchableOpacity
                    style={styles.runBtn}
                    onPress={() => handleRunSearch(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="search" size={15} color="#FFF" />
                    <Text style={styles.runBtnText}>Run This Search</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  infoBannerText: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 15,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
    ...THEME.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cardQuery: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  filterPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  runBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
