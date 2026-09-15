import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAdminReports, logAdminAction } from '../../src/hooks/useAdmin';
import { supabase } from '../../src/lib/supabase';
import { Report, ReportStatus } from '../../src/types/database.types';

export interface AdminReportsScreenProps {
  onBack?: () => void;
  onInspectHostel?: (hostelId: string) => void;
}

type StatusTab = 'all' | 'open' | 'investigating' | 'resolved' | 'dismissed';

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({
  onBack,
  onInspectHostel,
}) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusTab>('all');
  const { data: reports, isLoading, refetch } = useAdminReports(statusFilter);
  const [refreshing, setRefreshing] = useState(false);

  const [activeReportForModal, setActiveReportForModal] = useState<Report | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'resolve' | 'dismiss' | 'investigate'>('resolve');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (
    targetReport: Report,
    newStatus: ReportStatus,
    notes?: string
  ) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
        })
        .eq('id', targetReport.id);

      if (error) console.warn('Supabase report update warning:', error.message);

      if (user?.id) {
        const actionType =
          newStatus === 'investigating'
            ? 'investigate_report'
            : newStatus === 'resolved'
            ? 'resolve_report'
            : 'dismiss_report';

        await logAdminAction(
          user.id,
          actionType,
          targetReport.id,
          notes || `Report updated to ${newStatus}.`
        );
      }

      setActiveReportForModal(null);
      setResolutionNotes('');
      Alert.alert('Report Updated', `Status updated to ${newStatus}.`);
      await refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update report.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Reports & Moderation Queue</Text>
          <Text style={styles.headerSub}>Investigate student flags & policy violations</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'open', 'investigating', 'resolved', 'dismissed'] as StatusTab[]).map((tab) => {
          const isSelected = statusFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setStatusFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reports List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
          }
        >
          {reports && reports.length > 0 ? (
            reports.map((report) => {
              const statusColor =
                report.status === 'open'
                  ? '#DC2626'
                  : report.status === 'investigating'
                  ? '#D97706'
                  : report.status === 'resolved'
                  ? '#16A34A'
                  : '#64748B';

              const statusBg =
                report.status === 'open'
                  ? '#FEF2F2'
                  : report.status === 'investigating'
                  ? '#FFFBEB'
                  : report.status === 'resolved'
                  ? '#F0FDF4'
                  : '#F1F5F9';

              return (
                <View key={report.id} style={styles.card}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.reasonBadge}>
                      <Ionicons name="flag" size={12} color="#DC2626" />
                      <Text style={styles.reasonBadgeText}>{report.reason}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {report.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Target Reported */}
                  <View style={styles.targetSection}>
                    <Text style={styles.targetLabel}>Reported Target:</Text>
                    {report.hostel ? (
                      <TouchableOpacity
                        style={styles.hostelLink}
                        onPress={() => onInspectHostel?.(report.hostel!.id)}
                      >
                        <Ionicons name="home" size={14} color={THEME.colors.primary} />
                        <Text style={styles.hostelLinkText}>{report.hostel.name}</Text>
                        <Ionicons name="open-outline" size={12} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    ) : report.reported_user ? (
                      <Text style={styles.reportedUserText}>
                        User: {report.reported_user.full_name} ({report.reported_user.role})
                      </Text>
                    ) : (
                      <Text style={styles.reportedUserText}>General Listing Complaint</Text>
                    )}
                  </View>

                  {/* Description Box */}
                  <View style={styles.descBox}>
                    <Text style={styles.descText}>"{report.description}"</Text>
                  </View>

                  {/* Reporter & Metadata */}
                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={12} color="#64748B" />
                    <Text style={styles.metaText}>
                      Reported by {report.reporter?.full_name || 'Anonymous Student'} •{' '}
                      {new Date(report.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Moderation Action Buttons */}
                  <View style={styles.actionsRow}>
                    {report.status === 'open' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.investigateBtn]}
                        onPress={() => handleUpdateStatus(report, 'investigating')}
                      >
                        <Ionicons name="search" size={14} color="#D97706" />
                        <Text style={[styles.btnActionText, { color: '#D97706' }]}>
                          Mark Investigating
                        </Text>
                      </TouchableOpacity>
                    )}

                    {report.status !== 'resolved' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.resolveBtn]}
                        onPress={() => {
                          setActiveReportForModal(report);
                          setResolutionAction('resolve');
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                        <Text style={[styles.btnActionText, { color: '#16A34A' }]}>
                          Resolve
                        </Text>
                      </TouchableOpacity>
                    )}

                    {report.status !== 'dismissed' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.dismissBtn]}
                        onPress={() => {
                          setActiveReportForModal(report);
                          setResolutionAction('dismiss');
                        }}
                      >
                        <Ionicons name="close" size={14} color="#64748B" />
                        <Text style={[styles.btnActionText, { color: '#64748B' }]}>
                          Dismiss
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="shield-checkmark" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Queue Is Clear</Text>
              <Text style={styles.emptySub}>
                No reports currently require attention under this tab.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Resolution Modal */}
      <Modal
        visible={!!activeReportForModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveReportForModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={resolutionAction === 'resolve' ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={resolutionAction === 'resolve' ? '#16A34A' : '#64748B'}
              />
              <Text style={styles.modalTitle}>
                {resolutionAction === 'resolve' ? 'Resolve Report' : 'Dismiss Report'}
              </Text>
            </View>

            <Text style={styles.modalSub}>
              {resolutionAction === 'resolve'
                ? 'Record what action was taken (e.g. corrected rent on listing, owner contacted, warning issued):'
                : 'Explain why this report was dismissed (e.g. unfounded report, duplicate complaint):'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter resolution notes for the admin audit log..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setActiveReportForModal(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  resolutionAction === 'resolve'
                    ? { backgroundColor: '#16A34A' }
                    : { backgroundColor: '#475569' },
                ]}
                onPress={() => {
                  if (activeReportForModal) {
                    handleUpdateStatus(
                      activeReportForModal,
                      resolutionAction === 'resolve' ? 'resolved' : 'dismissed',
                      resolutionNotes
                    );
                  }
                }}
                disabled={isProcessing}
              >
                <Text style={styles.modalSubmitText}>
                  {resolutionAction === 'resolve' ? 'Confirm Resolve' : 'Confirm Dismiss'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  reasonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  targetSection: {
    marginBottom: 10,
  },
  targetLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  hostelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  hostelLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  reportedUserText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  investigateBtn: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  resolveBtn: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  dismissBtn: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
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
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
