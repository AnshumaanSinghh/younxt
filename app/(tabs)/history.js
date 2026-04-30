/**
 * History Screen — Enhanced with Search, Filters, Statistics
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Text, RefreshControl,
  ActivityIndicator, TextInput, TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useApp } from '../../src/context/AppContext';
import { LogCard } from '../../src/components/LogCard';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/theme';

const FILTERS = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'completed', label: 'Done', icon: 'checkmark-circle-outline' },
  { key: 'pending', label: 'Pending', icon: 'time-outline' },
];

export default function HistoryScreen() {
  const { user } = useAuth();
  const { logs, logsLoading, loadLogs, markCompleted } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (user?.uid && logs.length === 0) {
      loadLogs(user.uid);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) await loadLogs(user.uid);
    setRefreshing(false);
  };

  const handleMarkComplete = useCallback(async (logId) => {
    if (user?.uid) await markCompleted(user.uid, logId);
  }, [user, markCompleted]);

  // Filtered and searched logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Apply filter
    if (activeFilter === 'completed') {
      result = result.filter((l) => l.completed);
    } else if (activeFilter === 'pending') {
      result = result.filter((l) => !l.completed);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.motivationalLine?.toLowerCase().includes(q) ||
        l.actionSteps?.some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [logs, activeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const completed = logs.filter((l) => l.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    // Favorite mood
    const moodCounts = {};
    logs.forEach((l) => { moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1; });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return { total, completed, rate, topMood: topMood ? topMood[0] : null };
  }, [logs]);

  const renderHeader = () => (
    <View>
      {/* Statistics Cards */}
      {logs.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.rate}%</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your journey..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.7}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
          >
            <Ionicons name={f.icon} size={14}
              color={activeFilter === f.key ? Colors.textPrimary : Colors.textMuted} />
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>{filteredLogs.length} results</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (logsLoading && !refreshing) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name={searchQuery ? 'search-outline' : 'document-text-outline'} size={48} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No matching results' : 'No history yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? 'Try a different search term or change your filters.'
            : 'Ask your future self for a suggestion on the Home screen to see it here.'
          }
        </Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }) => (
    <LogCard log={item} onMarkComplete={handleMarkComplete} />
  ), [handleMarkComplete]);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Journey</Text>
        {stats.topMood && (
          <View style={styles.moodBadge}>
            <Text style={styles.moodBadgeText}>Top: {stats.topMood}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  moodBadge: {
    backgroundColor: Colors.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary,
  },
  moodBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.primary, textTransform: 'capitalize' },
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl, flexGrow: 1 },
  statsRow: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  filterRow: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  filterTextActive: { color: Colors.textPrimary },
  resultCount: { flex: 1, alignItems: 'flex-end' },
  resultCountText: { fontSize: 12, color: Colors.textMuted },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surfaceLight, justifyContent: 'center',
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.styles.subtitle, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptySubtitle: {
    ...Typography.styles.body, color: Colors.textSecondary,
    textAlign: 'center', maxWidth: '80%',
  },
});
