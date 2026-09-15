import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatIndianRupees } from '../../src/constants/theme';
import { useOwnerListings, ListingTab } from '../../src/hooks/useOwnerListings';
import { OwnerListingCard } from '../../components/owner/OwnerListingCard';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { Hostel } from '../../src/types/database.types';

export interface OwnerListingsScreenProps {
  onNavigateToAddHostel: () => void;
  onNavigateToEditHostel: (hostelId: string) => void;
  initialTab?: ListingTab;
}

const TABS: { key: ListingTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'draft', label: 'Drafts' },
  { key: 'rejected', label: 'Rejected' },
];

export const OwnerListingsScreen: React.FC<OwnerListingsScreenProps> = ({
  onNavigateToAddHostel,
  onNavigateToEditHostel,
  initialTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<ListingTab>(initialTab);
  const {
    hostels,
    allHostels,
    isLoading,
    isRefetching,
    refetch,
    togglePublish,
    deleteHostel,
    updateRent,
    isUpdatingRent,
  } = useOwnerListings(activeTab);

  // Quick Rent Modal State
  const [selectedHostelForRent, setSelectedHostelForRent] = useState<Hostel | null>(null);
  const [modalRent, setModalRent] = useState<string>('');
  const [modalDeposit, setModalDeposit] = useState<string>('');

  const openQuickRentModal = (hostel: Hostel) => {
    setSelectedHostelForRent(hostel);
    setModalRent(String(hostel.monthly_rent || hostel.monthly_rent_min || 8000));
    setModalDeposit(String(hostel.security_deposit || 15000));
  };

  const handleSaveQuickRent = async () => {
    if (!selectedHostelForRent) return;
    const rentNum = parseInt(modalRent, 10);
    const depNum = parseInt(modalDeposit, 10);

    if (isNaN(rentNum) || rentNum <= 0) {
      Alert.alert('Invalid Rent', 'Please enter a valid monthly rent amount.');
      return;
    }

    try {
      await updateRent({
        hostelId: selectedHostelForRent.id,
        monthlyRent: rentNum,
        securityDeposit: isNaN(depNum) ? 0 : depNum,
      });
      setSelectedHostelForRent(null);
      Alert.alert('Updated', 'Monthly rent & deposit updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update rent.');
    }
  };

  const handleTogglePublish = async (hostel: Hostel) => {
    const willPublish = !hostel.is_published;
    try {
      await togglePublish({ hostelId: hostel.id, publish: willPublish });
      Alert.alert(
        willPublish ? 'Published!' : 'Unpublished',
        willPublish
          ? `"${hostel.name}" is now live and searchable by students in Pune.`
          : `"${hostel.name}" has been unpublished. It is temporarily hidden from student search.`
      );
    } catch (e: any) {
      Alert.alert('Cannot Publish', e.message || 'Unable to update listing status.');
    }
  };

  // Counts for each tab
  const getTabCount = (tab: ListingTab): number => {
    if (tab === 'all') return allHostels.length;
    if (tab === 'active') {
      return allHostels.filter((h) => h.is_published && h.verification_status === 'verified').length;
    }
    if (tab === 'draft') {
      return allHostels.filter((h) => !h.is_published && h.verification_status === 'pending').length;
    }
    if (tab === 'pending') {
      return allHostels.filter((h) => h.verification_status === 'pending').length;
    }
    if (tab === 'rejected') {
      return allHostels.filter((h) => h.verification_status === 'rejected').length;
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Properties</Text>
          <Text style={styles.subtitle}>
            Manage rooms, rates, vacancies, and verification statuses
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={onNavigateToAddHostel}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={THEME.colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = getTabCount(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabBadge, isSelected && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isSelected && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={THEME.colors.primary} />
            <Text style={styles.loaderText}>Loading your properties...</Text>
          </View>
        ) : hostels.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={48} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Properties in "{activeTab}"</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'draft'
                ? 'You do not have any unpublished draft listings.'
                : activeTab === 'pending'
                ? 'You do not have any properties currently awaiting verification.'
                : 'Start by listing your first hostel or PG in Pune.'}
            </Text>
            <AppButton
              title="+ Add New Property"
              onPress={onNavigateToAddHostel}
              variant="primary"
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          hostels.map((hostel: Hostel) => (
            <OwnerListingCard
              key={hostel.id}
              hostel={hostel}
              onEdit={() => onNavigateToEditHostel(hostel.id)}
              onTogglePublish={handleTogglePublish}
              onUpdateRent={openQuickRentModal}
              onDelete={(id) => deleteHostel(id)}
            />
          ))
        )}
      </ScrollView>

      {/* Quick Rent Update Modal */}
      <Modal
        visible={!!selectedHostelForRent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedHostelForRent(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Quick Update Rent</Text>
                <Text style={styles.modalHostelName} numberOfLines={1}>
                  {selectedHostelForRent?.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedHostelForRent(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppInput
              label="Starting Monthly Rent (₹)"
              prefix="₹"
              keyboardType="numeric"
              value={modalRent}
              onChangeText={setModalRent}
              placeholder="8500"
              helperText="This is the primary display rent students will see in search."
            />

            <AppInput
              label="Security Deposit (₹)"
              prefix="₹"
              keyboardType="numeric"
              value={modalDeposit}
              onChangeText={setModalDeposit}
              placeholder="15000"
              helperText="Refundable deposit amount."
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setSelectedHostelForRent(null)}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Rates"
                onPress={handleSaveQuickRent}
                variant="primary"
                size="md"
                isLoading={isUpdatingRent}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OwnerListingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tabsWrapper: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryDark,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  tabLabelActive: {
    color: THEME.colors.white,
  },
  tabBadge: {
    backgroundColor: THEME.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: THEME.colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: 28,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    ...THEME.shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  modalHostelName: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
