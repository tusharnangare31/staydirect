import React, { useState } from 'react';
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
import { useOwnerVerifications } from '../../src/hooks/useAdmin';
import { OwnerVerification } from '../../src/types/database.types';

export interface AdminVerificationsScreenProps {
  onBack?: () => void;
  onSelectVerification?: (verificationId: string) => void;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export const AdminVerificationsScreen: React.FC<AdminVerificationsScreenProps> = ({
  onBack,
  onSelectVerification,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { data: verifications, isLoading, refetch } = useOwnerVerifications(activeFilter);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const pendingCount = verifications?.filter((v) => v.status === 'pending').length ?? 0;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Owner Verification Queue</Text>
          <Text style={styles.headerSub}>Verify Pune hostel owner credentials</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((tab) => {
          const isSelected = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab === 'all'
                  ? 'All'
                  : tab === 'pending'
                  ? 'Pending'
                  : tab === 'approved'
                  ? 'Approved'
                  : 'Rejected'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading owner submissions...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
          }
        >
          {verifications && verifications.length > 0 ? (
            verifications.map((item) => {
              const statusColor =
                item.status === 'approved'
                  ? '#166534'
                  : item.status === 'rejected'
                  ? '#991B1B'
                  : '#B45309';

              const statusBg =
                item.status === 'approved'
                  ? '#DCFCE7'
                  : item.status === 'rejected'
                  ? '#FEE2E2'
                  : '#FEF3C7';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => onSelectVerification?.(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.ownerAvatar}>
                      <Text style={styles.avatarText}>
                        {item.owner?.full_name ? item.owner.full_name[0].toUpperCase() : 'O'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.ownerName}>
                        {item.owner?.full_name || 'Hostel Owner'}
                      </Text>
                      <Text style={styles.ownerPhone}>
                        {item.owner?.phone || 'No phone provided'} • {item.owner?.city || 'Pune'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                      <Ionicons name="document-text-outline" size={14} color="#64748B" />
                      <Text style={styles.metaLabel}>Document Type:</Text>
                      <Text style={styles.metaValue}>
                        {item.document_type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" />
                      <Text style={styles.metaLabel}>Submitted:</Text>
                      <Text style={styles.metaValue}>
                        {new Date(item.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(item.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    {item.owner?.college_or_company && (
                      <View style={styles.metaRow}>
                        <Ionicons name="business-outline" size={14} color="#64748B" />
                        <Text style={styles.metaLabel}>Business:</Text>
                        <Text style={styles.metaValue} numberOfLines={1}>
                          {item.owner.college_or_company}
                        </Text>
                      </View>
                    )}

                    {item.rejection_reason && (
                      <View style={styles.rejectionBox}>
                        <Ionicons name="alert-circle" size={14} color="#DC2626" />
                        <Text style={styles.rejectionReason} numberOfLines={2}>
                          Rejection: {item.rejection_reason}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerActionText}>Tap to review document & take action</Text>
                    <Ionicons name="chevron-forward" size={16} color={THEME.colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="shield-checkmark" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Submissions Found</Text>
              <Text style={styles.emptySub}>
                There are currently no owner verifications matching this filter tab.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338CA',
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  ownerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBody: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  rejectionReason: {
    fontSize: 11,
    color: '#991B1B',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
});
