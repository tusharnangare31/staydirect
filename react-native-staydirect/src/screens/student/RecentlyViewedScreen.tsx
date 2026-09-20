import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { HostelCard } from '../../../components/hostels/HostelCard';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { Hostel } from '../../types/database.types';

interface RecentlyViewedScreenProps {
  onBack: () => void;
  onSelectHostel: (hostel: Hostel) => void;
}

export const RecentlyViewedScreen: React.FC<RecentlyViewedScreenProps> = ({
  onBack,
  onSelectHostel,
}) => {
  const { recentlyViewed, isLoading, clearHistory, isClearing } = useRecentlyViewed();

  const handleClear = () => {
    Alert.alert(
      'Clear Viewing History',
      'Are you sure you want to clear your recently viewed hostels? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Recently Viewed Hostels"
        subtitle={`${recentlyViewed.length} hostels viewed`}
        showBack
        onBack={onBack}
        rightAction={
          recentlyViewed.length > 0 ? (
            <TouchableOpacity onPress={handleClear} disabled={isClearing} style={styles.clearHeaderBtn}>
              {isClearing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.clearHeaderText}>Clear</Text>
              )}
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Note */}
        <View style={styles.privacyBanner}>
          <Ionicons name="lock-closed-outline" size={16} color="#475569" />
          <Text style={styles.privacyBannerText}>
            Your viewing history is private to your device & account. We never share browsing data with hostel owners.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Loading viewing history...</Text>
          </View>
        ) : recentlyViewed.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="time-outline" size={32} color={THEME.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Recently Viewed Hostels</Text>
            <Text style={styles.emptySubtitle}>
              As you browse verified hostels across Pune, they will automatically appear here for quick access.
            </Text>
            <TouchableOpacity style={styles.browseBtn} onPress={onBack}>
              <Text style={styles.browseBtnText}>Explore Hostels</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {recentlyViewed.map((hostel) => (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                onPress={() => onSelectHostel(hostel)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
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
  clearHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearHeaderText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  privacyBannerText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 15,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  browseBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
});
