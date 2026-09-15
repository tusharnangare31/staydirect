import React from 'react';
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

interface StudentProfileScreenProps {
  onOpenAuthModal: () => void;
}

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  onOpenAuthModal,
}) => {
  const { user, profile, role, switchDevRole, signOut } = useAuth();
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  if (showPaymentHistory) {
    return <PaymentHistoryScreen onBack={() => setShowPaymentHistory(false)} />;
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="My Student Profile" subtitle="Pune • StayDirect" />

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
            <Text style={styles.emailText}>{user?.email || 'Guest Student Account'}</Text>
            <Text style={styles.collegeText}>
              🎓 {profile?.college_or_company || 'COEP / MIT WPU / Pune University'}
            </Text>
          </View>
        </View>

        {/* Role Switcher Banner */}
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
              Switch to Owner Mode to list your property and manage student vacancies with zero commissions.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>

        {/* Switch to Admin Mode */}
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
              Verify owner documents, moderate listings, handle reports & manage Pune users.
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
            onPress={() => setShowPaymentHistory(true)}
          >
            <Ionicons name="card-outline" size={20} color={THEME.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.actionItemText}>Payment & Deposit History</Text>
              <Text style={{ fontSize: 11, color: THEME.colors.textSecondary }}>
                Official receipts, refundable deposits & refund statuses
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          {!user ? (
            <TouchableOpacity style={styles.actionItem} onPress={onOpenAuthModal}>
              <Ionicons name="log-in-outline" size={20} color={THEME.colors.primary} />
              <Text style={styles.actionItemText}>Sign In / Create Account</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={THEME.colors.error} />
              <Text style={[styles.actionItemText, { color: THEME.colors.error }]}>
                Sign Out
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  emailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  collegeText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  switchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.secondary,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.secondaryDark,
  },
  switchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  switchSub: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  infoDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  actionItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
});
