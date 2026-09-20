import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAdminStats, useAdminActions } from '../../src/hooks/useAdmin';
import { AdminSearchAnalyticsSection } from '../../src/screens/admin/AdminSearchAnalyticsSection';

export interface AdminDashboardProps {
  onNavigateToVerifications?: () => void;
  onNavigateToListings?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToSettings?: () => void;
  onSwitchToStudentView?: () => void;
  onSwitchToOwnerView?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardProps> = ({
  onNavigateToVerifications,
  onNavigateToListings,
  onNavigateToUsers,
  onNavigateToReports,
  onNavigateToPayments,
  onNavigateToSettings,
  onSwitchToStudentView,
  onSwitchToOwnerView,
}) => {
  const { profile, signOut, switchDevRole } = useAuth();
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useAdminStats();
  const { data: actions, isLoading: isActionsLoading, refetch: refetchActions } = useAdminActions();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchActions()]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
      }
    >
      {/* Top Admin Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#fff" />
              <Text style={styles.adminBadgeText}>ADMIN CONTROL PANEL</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>RLS ENFORCED</Text>
            </View>
          </View>
          <Text style={styles.greetingTitle}>Platform Overview</Text>
          <Text style={styles.greetingSub}>
            Logged in as {profile?.full_name || 'System Administrator'} • Pune Operations
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Primary KPI Metrics Grid */}
      <View style={styles.kpiGrid}>
        {/* Total Students */}
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="school" size={20} color="#4F46E5" />
          </View>
          <Text style={styles.kpiNumber}>
            {isStatsLoading ? '...' : stats?.total_students ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Total Students</Text>
        </View>

        {/* Total Owners */}
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="business" size={20} color="#059669" />
          </View>
          <Text style={styles.kpiNumber}>
            {isStatsLoading ? '...' : stats?.total_owners ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Registered Owners</Text>
        </View>

        {/* Pending Verifications */}
        <TouchableOpacity
          style={[
            styles.kpiCard,
            (stats?.pending_owner_verifications || 0) > 0 && styles.kpiCardAlert,
          ]}
          onPress={onNavigateToVerifications}
          activeOpacity={0.8}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="id-card" size={20} color="#D97706" />
          </View>
          <Text style={[styles.kpiNumber, { color: '#B45309' }]}>
            {isStatsLoading ? '...' : stats?.pending_owner_verifications ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Pending Verifications</Text>
          {(stats?.pending_owner_verifications || 0) > 0 && (
            <View style={styles.actionChip}>
              <Text style={styles.actionChipText}>Needs Review</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Pending Listings */}
        <TouchableOpacity
          style={[
            styles.kpiCard,
            (stats?.pending_hostel_listings || 0) > 0 && styles.kpiCardAlert,
          ]}
          onPress={onNavigateToListings}
          activeOpacity={0.8}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: '#FDF2F8' }]}>
            <Ionicons name="home" size={20} color="#DB2777" />
          </View>
          <Text style={[styles.kpiNumber, { color: '#BE185D' }]}>
            {isStatsLoading ? '...' : stats?.pending_hostel_listings ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Pending Listings</Text>
          {(stats?.pending_hostel_listings || 0) > 0 && (
            <View style={[styles.actionChip, { backgroundColor: '#FCE7F3' }]}>
              <Text style={[styles.actionChipText, { color: '#9D174D' }]}>Moderate</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Active Hostels */}
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="checkmark-done-circle" size={20} color="#16A34A" />
          </View>
          <Text style={styles.kpiNumber}>
            {isStatsLoading ? '...' : stats?.active_hostels ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Active Direct Hostels</Text>
        </View>

        {/* Open Reports */}
        <TouchableOpacity
          style={[
            styles.kpiCard,
            (stats?.open_reports || 0) > 0 && styles.kpiCardDanger,
          ]}
          onPress={onNavigateToReports}
          activeOpacity={0.8}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="warning" size={20} color="#DC2626" />
          </View>
          <Text style={[styles.kpiNumber, { color: '#DC2626' }]}>
            {isStatsLoading ? '...' : stats?.open_reports ?? 0}
          </Text>
          <Text style={styles.kpiLabel}>Open Reports</Text>
          {(stats?.open_reports || 0) > 0 && (
            <View style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.actionChipText, { color: '#991B1B' }]}>Resolve</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Action Navigation Buttons */}
      <Text style={styles.sectionTitle}>Admin Navigation & Moderation</Text>
      <View style={styles.actionsList}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToVerifications}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.actionRowHeader}>
              <Text style={styles.actionTitle}>Owner Verification Queue</Text>
              {(stats?.pending_owner_verifications || 0) > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>
                    {stats?.pending_owner_verifications} pending
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.actionSub}>
              Review government ID, electricity bills, and tax receipts in private storage.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToListings}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="file-tray-stacked-outline" size={22} color="#DB2777" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.actionRowHeader}>
              <Text style={styles.actionTitle}>Listing Moderation</Text>
              {(stats?.pending_hostel_listings || 0) > 0 && (
                <View style={[styles.badgePill, { backgroundColor: '#FDF2F8' }]}>
                  <Text style={[styles.badgePillText, { color: '#9D174D' }]}>
                    {stats?.pending_hostel_listings} review
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.actionSub}>
              Approve, reject, or unpublish hostel rooms and rent rates across Pune.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToUsers}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="people-outline" size={22} color="#4F46E5" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.actionTitle}>User Management</Text>
            <Text style={styles.actionSub}>
              Search student & owner accounts, manage verification, and suspend abusers.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToReports}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="flag-outline" size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.actionRowHeader}>
              <Text style={styles.actionTitle}>Reports & Flagged Content</Text>
              {(stats?.open_reports || 0) > 0 && (
                <View style={[styles.badgePill, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={[styles.badgePillText, { color: '#DC2626' }]}>
                    {stats?.open_reports} open
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.actionSub}>
              Handle student complaints regarding rent discrepancy or offline brokerage.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {/* Phase 6: Payment & Revenue Management */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToPayments}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="wallet-outline" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.actionRowHeader}>
              <Text style={styles.actionTitle}>Payments, Revenue & Refunds</Text>
              <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.badgePillText, { color: '#15803D' }]}>
                  Razorpay Live
                </Text>
              </View>
            </View>
            <Text style={styles.actionSub}>
              Monitor gross deposit volume, process student refund requests, and audit subscription invoices.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {/* Platform & Policy Settings */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onNavigateToSettings}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="settings-outline" size={22} color="#374151" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.actionRowHeader}>
              <Text style={styles.actionTitle}>Platform & Escrow Settings</Text>
              <View style={[styles.badgePill, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.badgePillText, { color: '#4B5563' }]}>Pune Ops</Text>
              </View>
            </View>
            <Text style={styles.actionSub}>
              Configure zero-brokerage rules, escrow hold times, emergency notices & helpline numbers.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Phase 9: Search & Discovery Analytics Section */}
      <AdminSearchAnalyticsSection />

      {/* Recent Admin Audit Log */}
      <View style={styles.auditSection}>
        <View style={styles.auditHeader}>
          <Text style={styles.sectionTitle}>Recent Audit Log</Text>
          <Text style={styles.auditSub}>Server-Recorded Actions</Text>
        </View>

        {isActionsLoading ? (
          <ActivityIndicator size="small" color={THEME.colors.primary} style={{ margin: 20 }} />
        ) : actions && actions.length > 0 ? (
          <View style={styles.auditList}>
            {actions.map((act) => (
              <View key={act.id} style={styles.auditItem}>
                <View style={styles.auditDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.auditActionText}>
                    {act.action_type.replace('_', ' ').toUpperCase()}
                  </Text>
                  {act.reason && (
                    <Text style={styles.auditReasonText} numberOfLines={2}>
                      "{act.reason}"
                    </Text>
                  )}
                  <Text style={styles.auditTime}>
                    {new Date(act.created_at).toLocaleString()} • Target: {act.target_id.slice(0, 12)}...
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyAuditBox}>
            <Ionicons name="checkmark-done" size={24} color={THEME.colors.textSecondary} />
            <Text style={styles.emptyAuditText}>No recent actions recorded.</Text>
          </View>
        )}
      </View>

      {/* Role Switcher for Testing (Student / Owner / Admin) */}
      <View style={styles.switchSection}>
        <Text style={styles.switchSectionTitle}>Switch View Mode (Development & Testing)</Text>
        <Text style={styles.switchSectionSub}>
          Easily test the end-to-end flow from student discovery to owner listings to admin moderation.
        </Text>
        <View style={styles.switchButtonsRow}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              switchDevRole('student');
              onSwitchToStudentView?.();
            }}
          >
            <Ionicons name="school-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.switchBtnText}>Student Discovery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              switchDevRole('owner');
              onSwitchToOwnerView?.();
            }}
          >
            <Ionicons name="business-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.switchBtnText}>Owner Management</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={16} color={THEME.colors.danger} />
          <Text style={styles.signOutBtnText}>Log Out of Admin Console</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  adminBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  kpiCardAlert: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF7',
  },
  kpiCardDanger: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  actionChip: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  actionsList: {
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  auditSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  auditSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  auditList: {
    gap: 12,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  auditActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  auditReasonText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontStyle: 'italic',
  },
  auditTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyAuditBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyAuditText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  switchSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  switchButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  signOutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.danger,
  },
});
