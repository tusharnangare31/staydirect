import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAdminUsers, logAdminAction } from '../../src/hooks/useAdmin';
import { supabase } from '../../src/lib/supabase';
import { Profile } from '../../src/types/database.types';

export interface AdminUsersScreenProps {
  onBack?: () => void;
}

type RoleTab = 'all' | 'student' | 'owner';

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState<RoleTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users, isLoading, refetch } = useAdminUsers(searchQuery, roleFilter);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleSuspension = async (targetUser: Profile) => {
    const nextSuspendedState = !targetUser.is_suspended;
    const actionWord = nextSuspendedState ? 'Suspend' : 'Unsuspend';

    Alert.alert(
      `${actionWord} User Account`,
      nextSuspendedState
        ? `Are you sure you want to suspend ${targetUser.full_name}? They will be blocked by server triggers from creating listings, sending inquiries, or booking rooms.`
        : `Restore full platform privileges for ${targetUser.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionWord,
          style: nextSuspendedState ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionInProgressId(targetUser.id);
              const { error } = await supabase
                .from('profiles')
                .update({
                  is_suspended: nextSuspendedState,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', targetUser.id);

              if (error) console.warn('Supabase profile suspension error:', error.message);

              if (user?.id) {
                await logAdminAction(
                  user.id,
                  nextSuspendedState ? 'suspend_user' : 'unsuspend_user',
                  targetUser.id,
                  nextSuspendedState ? 'Account suspended by admin.' : 'Account unsuspended by admin.'
                );
              }

              Alert.alert(
                'Success',
                `User account has been ${nextSuspendedState ? 'suspended' : 'restored'}.`
              );
              await refetch();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not update user status.');
            } finally {
              setActionInProgressId(null);
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>User & Trust Management</Text>
          <Text style={styles.headerSub}>Manage student & hostel owner accounts</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or college/trust..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'student', 'owner'] as RoleTab[]).map((tab) => {
          const isSelected = roleFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setRoleFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                {tab === 'all' ? 'All Users' : tab === 'student' ? 'Students' : 'Hostel Owners'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Users List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Fetching users list...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />
          }
        >
          {users && users.length > 0 ? (
            users.map((item) => {
              const isOwner = item.role === 'owner';
              const isSuspended = !!item.is_suspended;

              return (
                <View key={item.id} style={[styles.userCard, isSuspended && styles.userCardSuspended]}>
                  {/* Top user row */}
                  <View style={styles.userTopRow}>
                    <View
                      style={[
                        styles.avatarCircle,
                        isOwner ? { backgroundColor: '#ECFDF5' } : { backgroundColor: '#EEF2FF' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          isOwner ? { color: '#059669' } : { color: '#4F46E5' },
                        ]}
                      >
                        {item.full_name ? item.full_name[0].toUpperCase() : 'U'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.full_name}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            isOwner ? styles.roleBadgeOwner : styles.roleBadgeStudent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleBadgeText,
                              isOwner ? { color: '#065F46' } : { color: '#3730A3' },
                            ]}
                          >
                            {item.role.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.userPhone}>
                        {item.phone || 'No phone registered'} • {item.city || 'Pune'}
                      </Text>
                    </View>
                  </View>

                  {/* College / Organization */}
                  {item.college_or_company && (
                    <View style={styles.detailRow}>
                      <Ionicons
                        name={isOwner ? 'business-outline' : 'school-outline'}
                        size={14}
                        color="#64748B"
                      />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {item.college_or_company}
                      </Text>
                    </View>
                  )}

                  {/* Badges / Suspension Notice */}
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.trustPill,
                        item.is_verified ? styles.trustPillVerified : styles.trustPillUnverified,
                      ]}
                    >
                      <Ionicons
                        name={item.is_verified ? 'shield-checkmark' : 'time-outline'}
                        size={12}
                        color={item.is_verified ? '#15803D' : '#B45309'}
                      />
                      <Text
                        style={[
                          styles.trustPillText,
                          item.is_verified ? { color: '#15803D' } : { color: '#B45309' },
                        ]}
                      >
                        {item.is_verified ? 'Verified Profile' : 'Unverified'}
                      </Text>
                    </View>

                    {isSuspended && (
                      <View style={styles.suspendedPill}>
                        <Ionicons name="ban" size={12} color="#DC2626" />
                        <Text style={styles.suspendedPillText}>ACCOUNT SUSPENDED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Action Controls */}
                  <View style={styles.actionsRow}>
                    <Text style={styles.accountDate}>
                      Joined: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.suspendBtn,
                        isSuspended ? styles.unsuspendBtn : styles.suspendBtnActive,
                      ]}
                      onPress={() => handleToggleSuspension(item)}
                      disabled={actionInProgressId === item.id}
                    >
                      {actionInProgressId === item.id ? (
                        <ActivityIndicator size="small" color={isSuspended ? '#15803D' : '#DC2626'} />
                      ) : (
                        <>
                          <Ionicons
                            name={isSuspended ? 'refresh-circle-outline' : 'ban-outline'}
                            size={14}
                            color={isSuspended ? '#15803D' : '#DC2626'}
                          />
                          <Text
                            style={[
                              styles.suspendBtnText,
                              isSuspended ? { color: '#15803D' } : { color: '#DC2626' },
                            ]}
                          >
                            {isSuspended ? 'Lift Suspension' : 'Suspend Account'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptySub}>No student or owner accounts matched your search terms.</Text>
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
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userCardSuspended: {
    backgroundColor: '#FFFBFB',
    borderColor: '#FECACA',
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  roleBadgeOwner: {
    backgroundColor: '#D1FAE5',
  },
  roleBadgeStudent: {
    backgroundColor: '#E0E7FF',
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  trustPillVerified: {
    backgroundColor: '#DCFCE7',
  },
  trustPillUnverified: {
    backgroundColor: '#FEF3C7',
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  suspendedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  suspendedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  suspendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  suspendBtnActive: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  unsuspendBtn: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  suspendBtnText: {
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
});
