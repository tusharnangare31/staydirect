import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { PaymentHistoryScreen } from './payment/PaymentHistoryScreen';
import { StudentPreferencesScreen } from './StudentPreferencesScreen';
import { SavedSearchesScreen } from './SavedSearchesScreen';
import { RecentlyViewedScreen } from './RecentlyViewedScreen';
import { Hostel, AdvancedSearchFilters } from '../../types/database.types';

interface StudentProfileScreenProps {
  onOpenAuthModal: () => void;
  onSelectHostel?: (hostel: Hostel) => void;
  onRunSearch?: (filters: AdvancedSearchFilters, query?: string) => void;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  onOpenAuthModal,
  onSelectHostel,
  onRunSearch,
}) => {
  const { user, profile, role, switchDevRole, signOut } = useAuth();
  const [activeSubScreen, setActiveSubScreen] = useState<
    'none' | 'payments' | 'preferences' | 'saved_searches' | 'recently_viewed'
  >('none');

  if (activeSubScreen === 'payments') {
    return <PaymentHistoryScreen onBack={() => setActiveSubScreen('none')} />;
  }

  if (activeSubScreen === 'preferences') {
    return (
      <StudentPreferencesScreen
        onBack={() => setActiveSubScreen('none')}
        onSaved={() => setActiveSubScreen('none')}
      />
    );
  }

  if (activeSubScreen === 'saved_searches') {
    return (
      <SavedSearchesScreen
        onBack={() => setActiveSubScreen('none')}
        onSelectSearch={(filters, query) => {
          setActiveSubScreen('none');
          onRunSearch?.(filters, query);
        }}
      />
    );
  }

  if (activeSubScreen === 'recently_viewed') {
    return (
      <RecentlyViewedScreen
        onBack={() => setActiveSubScreen('none')}
        onSelectHostel={(h) => {
          setActiveSubScreen('none');
          onSelectHostel?.(h);
        }}
      />
    );
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="My Student Account" subtitle="Pune • StayDirect" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.full_name || user?.email || 'S').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.fullName}>
                {profile?.full_name || 'Pune Student'}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={18} color={THEME.colors.primary} />
            </View>
            <Text style={styles.emailText}>{user?.email || 'Student Account'}</Text>
            <Text style={styles.collegeText}>
              🎓 {profile?.college_or_company || 'COEP / MIT WPU / Pune University'}
            </Text>
          </View>
        </View>

        {/* Discovery & Search Personalization (Phase 9) */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>Discovery & Search Preferences</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setActiveSubScreen('preferences')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="sparkles" size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionItemText}>Search & Match Preferences</Text>
              <Text style={styles.actionItemSub}>
                Preferred Pune areas, budget range, sharing & meal habits
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setActiveSubScreen('saved_searches')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="notifications" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionItemText}>Saved Search Alerts</Text>
              <Text style={styles.actionItemSub}>
                Get notified when new verified rooms match your criteria
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setActiveSubScreen('recently_viewed')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="time" size={18} color="#475569" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionItemText}>Recently Viewed Hostels</Text>
              <Text style={styles.actionItemSub}>
                Quick access to properties you previously inspected
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Role Switcher Banners */}
        <TouchableOpacity
          style={styles.switchBanner}
          onPress={() => switchDevRole('owner')}
        >
          <View style={styles.switchIconWrap}>
            <Ionicons name="business" size={20} color={THEME.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.switchTitle}>Hostel or PG Owner?</Text>
            <Text style={styles.switchSub}>
              Switch to Owner Mode to list your property and manage vacancies with zero commissions.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBanner, { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          onPress={() => switchDevRole('admin')}
        >
          <View style={[styles.switchIconWrap, { backgroundColor: '#334155' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.switchTitle, { color: '#F8FAFC' }]}>Admin Control Panel</Text>
            <Text style={[styles.switchSub, { color: '#94A3B8' }]}>
              Verify owner documents, moderate listings, search analytics & reports.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#38BDF8" />
        </TouchableOpacity>

        {/* Value Guarantee Info */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>StayDirect Guarantee</Text>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>100% Zero Brokerage</Text>
              <Text style={styles.infoDesc}>
                We never charge students or owners any commission. What you see is what you pay.
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={THEME.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Direct Contact</Text>
              <Text style={styles.infoDesc}>
                Chat with verified hostel owners directly on WhatsApp or call before visiting.
              </Text>
            </View>
          </View>
        </View>

        {/* Account Controls */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>Account & Transactions</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setActiveSubScreen('payments')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="card-outline" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.actionItemText}>Payment & Deposit History</Text>
              <Text style={styles.actionItemSub}>
                Official receipts, refundable deposits & refund statuses
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {!user ? (
            <TouchableOpacity style={styles.actionItem} onPress={onOpenAuthModal}>
              <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="log-in-outline" size={18} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.actionItemText}>Sign In / Create Account</Text>
                <Text style={styles.actionItemSub}>Sync favorites and saved searches across devices</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={18} color={THEME.colors.error} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.actionItemText, { color: THEME.colors.error }]}>
                  Sign Out
                </Text>
                <Text style={styles.actionItemSub}>Sign out of your student session</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

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
    padding: THEME.spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  fullName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  emailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  collegeText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 16,
    ...THEME.shadows.soft,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  actionItemSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  switchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    marginBottom: 14,
  },
  switchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  switchSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  infoDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
