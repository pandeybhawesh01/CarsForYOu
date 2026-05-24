import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../../../navigation/types';
import type { InspectionLead } from '../../inspection/types';
import { InspectionStatus } from '../../inspection/types';
import { useInspectionStore } from '../../inspection/store/inspectionStore';
import { mockInspections, mockUser } from '../../../services/mockData';
import InspectionCard from '../../../components/InspectionCard';
import EmptyState from '../../../components/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

type Props = MainTabScreenProps<'Dashboard'>;

type FilterTab = 'ALL' | InspectionStatus;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: InspectionStatus.Pending },
  { label: 'In Progress', value: InspectionStatus.InProgress },
  { label: 'Completed', value: InspectionStatus.Completed },
];

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { startInspection } = useInspectionStore();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  }, [logout]);

  const filteredLeads = useMemo(() => {
    if (activeFilter === 'ALL') return mockInspections;
    return mockInspections.filter((l) => l.status === activeFilter);
  }, [activeFilter]);

  const handleCardPress = useCallback(
    (lead: InspectionLead) => {
      // Just set the lead, don't load draft yet
      setCurrentLead(lead);
      // @ts-ignore – cross-navigator navigation
      navigation.navigate('InspectionNavigator', {
        screen: 'LeadDetails',
        params: { inspectionId: lead.id },
      });
    },
    [navigation, setCurrentLead],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: InspectionLead }) => (
      <InspectionCard lead={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: InspectionLead) => item.id, []);

  const ListHeader = (
    <View>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', count: mockInspections.length, color: colors.primary },
          {
            label: 'Pending',
            count: mockInspections.filter((l) => l.status === InspectionStatus.Pending).length,
            color: colors.warning,
          },
          {
            label: 'Completed',
            count: mockInspections.filter((l) => l.status === InspectionStatus.Completed).length,
            color: colors.success,
          },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item: tab }) => {
            const isActive = activeFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.value)}
                activeOpacity={0.8}>
                <Text
                  style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text style={styles.listTitle}>
        {filteredLeads.length} inspection{filteredLeads.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.name}>{user?.displayName || mockUser.name}</Text>
          <Text style={styles.zone}>📍 {mockUser.zone} • {mockUser.employeeId}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(user?.displayName || mockUser.name).charAt(0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="No Inspections Found"
            description="No inspections match the selected filter."
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingTop: vs(16),
    paddingBottom: vs(20),
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'center',
    gap: vs(8),
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.onPrimaryMuted,
    marginBottom: vs(2),
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: vs(4),
  },
  zone: {
    fontSize: typography.fontSize.xs,
    color: colors.onPrimarySubtle,
  },
  avatarContainer: {
    width: hs(48),
    height: hs(48),
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  logoutButton: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.onPrimarySurfaceLow,
    borderWidth: 1,
    borderColor: colors.onPrimarySurfaceMedium,
  },
  logoutText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: hs(12),
    marginTop: vs(4),
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extraBold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: vs(2),
  },
  filtersContainer: {
    marginBottom: vs(8),
  },
  filtersList: {
    paddingHorizontal: spacing.base,
    gap: hs(8),
    paddingBottom: vs(4),
  },
  filterTab: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  listTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    marginBottom: vs(8),
  },
  listContent: {
    paddingBottom: vs(100),
  },
});

export default DashboardScreen;
