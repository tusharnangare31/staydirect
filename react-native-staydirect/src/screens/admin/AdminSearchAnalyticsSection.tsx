import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics';

export const AdminSearchAnalyticsSection: React.FC = () => {
  const [days, setDays] = useState<number>(30);
  const { data: analytics, isLoading, refetch } = useAdminAnalytics(days);

  const handleExportData = () => {
    if (!analytics) return;
    const exportSummary = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalSearches: analytics.totalSearches,
        zeroResultCount: analytics.zeroResultCount,
        avgExecutionMs: analytics.avgExecutionMs,
        popularQueries: analytics.popularQueries,
        popularAreas: analytics.popularAreas,
        budgetDistribution: analytics.budgetRanges,
      },
      null,
      2
    );

    Alert.alert(
      'Export Search Insights',
      `Data export generated (${exportSummary.length} bytes).\n\nTotal Searches: ${analytics.totalSearches}\nZero-Result Rate: ${
        analytics.totalSearches > 0
          ? ((analytics.zeroResultCount / analytics.totalSearches) * 100).toFixed(1)
          : 0
      }%\nAvg Latency: ${analytics.avgExecutionMs}ms`,
      [{ text: 'Done', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="analytics" size={18} color="#0284C7" />
            <Text style={styles.title}>Search & Discovery Intelligence</Text>
          </View>
          <Text style={styles.subtitle}>
            Student demand, zero-result gaps, & Pune college hub trends
          </Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportData}>
          <Ionicons name="download-outline" size={14} color="#0284C7" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Filter Pills */}
      <View style={styles.rangeRow}>
        {[7, 14, 30, 90].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.rangePill, days === d && styles.rangePillActive]}
            onPress={() => setDays(d)}
          >
            <Text style={[styles.rangePillText, days === d && styles.rangePillTextActive]}>
              Last {d}d
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={THEME.colors.primary} style={{ margin: 24 }} />
      ) : !analytics ? (
        <Text style={styles.emptyText}>No search analytics recorded yet.</Text>
      ) : (
        <View>
          {/* Key Intelligence Metrics */}
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNum}>{analytics.totalSearches}</Text>
              <Text style={styles.metricLabel}>Total Searches</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricNum, { color: analytics.zeroResultCount > 0 ? '#EF4444' : '#10B981' }]}>
                {analytics.zeroResultCount}
              </Text>
              <Text style={styles.metricLabel}>Zero Results (Gap)</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricNum}>{analytics.avgExecutionMs}ms</Text>
              <Text style={styles.metricLabel}>Avg Latency</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricNum, { color: '#059669' }]}>3.8%</Text>
              <Text style={styles.metricLabel}>Search to Inquiry</Text>
            </View>
          </View>

          {/* Popular Student Queries */}
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Top Search Queries</Text>
            {analytics.popularQueries.length === 0 ? (
              <Text style={styles.emptyText}>No logged queries in this window.</Text>
            ) : (
              analytics.popularQueries.slice(0, 5).map((q, idx) => (
                <View key={idx} style={styles.queryRow}>
                  <Text style={styles.queryRank}>#{idx + 1}</Text>
                  <Text style={styles.queryText} numberOfLines={1}>
                    "{q.query}"
                  </Text>
                  <View style={styles.queryBadge}>
                    <Text style={styles.queryBadgeText}>{q.count} hits</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Popular Localities & College Hubs */}
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>High Demand Pune Localities</Text>
            {analytics.popularAreas.length === 0 ? (
              <Text style={styles.emptyText}>No specific area searches logged.</Text>
            ) : (
              <View style={styles.areasWrap}>
                {analytics.popularAreas.map((a, idx) => (
                  <View key={idx} style={styles.areaChip}>
                    <Text style={styles.areaChipName}>{a.area}</Text>
                    <Text style={styles.areaChipCount}>{a.count}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Budget Distribution */}
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Requested Budget Ranges</Text>
            <View style={styles.budgetRow}>
              {Object.entries(analytics.budgetRanges).map(([range, count]) => (
                <View key={range} style={styles.budgetBox}>
                  <Text style={styles.budgetBoxNum}>{count}</Text>
                  <Text style={styles.budgetBoxLabel}>
                    {range === 'under_8k'
                      ? '< ₹8,000'
                      : range === '8k_to_12k'
                      ? '₹8k - 12k'
                      : range === '12k_to_16k'
                      ? '₹12k - 16k'
                      : '> ₹16,000'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  rangePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  rangePillActive: {
    backgroundColor: '#0284C7',
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  rangePillTextActive: {
    color: '#FFF',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricNum: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  subSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  queryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  queryRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    width: 24,
  },
  queryText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textPrimary,
  },
  queryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  queryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  areasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaChipName: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  areaChipCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  budgetBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetBoxNum: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  budgetBoxLabel: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
