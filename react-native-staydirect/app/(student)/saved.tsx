import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useFavorites } from '../../src/hooks/useFavorites';
import { HostelCard } from '../../components/hostels/HostelCard';
import { Hostel } from '../../src/types/database.types';

interface StudentSavedRouteProps {
  onSelectHostel?: (hostel: Hostel) => void;
  onExplore?: () => void;
}

export default function StudentSavedRoute({
  onSelectHostel,
  onExplore,
}: StudentSavedRouteProps) {
  const { favorites, isLoading, refetch, isRefetching } = useFavorites();

  const savedHostels = favorites
    .map((fav) => fav.hostel)
    .filter((h): h is Hostel => !!h);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Saved Hostels ❤️</Text>
          <Text style={styles.subtitle}>
            {savedHostels.length} {savedHostels.length === 1 ? 'property' : 'properties'} shortlisted
          </Text>
        </View>

        {onExplore && (
          <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
            <Ionicons name="search" size={14} color={THEME.colors.primary} />
            <Text style={styles.exploreBtnText}>Find More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading your shortlisted stays...</Text>
        </View>
      ) : savedHostels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={38} color={THEME.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No saved hostels yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse Pune's top student zones and tap the heart icon to shortlist hostels with zero brokerage.
          </Text>
          {onExplore && (
            <TouchableOpacity style={styles.startBrowsingBtn} onPress={onExplore}>
              <Text style={styles.startBrowsingText}>Explore Pune Hostels</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={savedHostels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <HostelCard
              hostel={item}
              onPress={() => onSelectHostel?.(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  exploreBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 260,
  },
  startBrowsingBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startBrowsingText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: THEME.spacing.md,
    paddingBottom: 30,
  },
});
