import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { HostelCard } from '../../components/HostelCard';
import { useFavorites } from '../../hooks/useUserInteractions';
import { Hostel } from '../../types/database.types';

interface StudentFavoritesScreenProps {
  onSelectHostel: (hostel: Hostel) => void;
  onExplore: () => void;
}

export const StudentFavoritesScreen: React.FC<StudentFavoritesScreenProps> = ({
  onSelectHostel,
  onExplore,
}) => {
  const { data: favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      <Header title="Saved Hostels" subtitle="Pune Zero-Brokerage Shortlist" />

      <FlatList
        data={favorites || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          if (!item.hostel) return null;
          return (
            <HostelCard
              hostel={item.hostel}
              onPress={() => onSelectHostel(item.hostel!)}
              isFavorited={true}
              onToggleFavorite={() =>
                toggleFavorite({
                  hostelId: item.hostel_id,
                  isFavorited: true,
                })
              }
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={THEME.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={50} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Saved Hostels</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart icon on any hostel card to save it for quick comparison and zero-brokerage booking.
              </Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
                <Text style={styles.exploreBtnText}>Discover Hostels</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  listContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  exploreBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
