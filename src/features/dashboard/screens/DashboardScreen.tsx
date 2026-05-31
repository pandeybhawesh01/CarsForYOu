import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../../../navigation/types';
import type { InspectionLead } from '../../inspection/types';
import { useInspectionStore } from '../../inspection/store/inspectionStore';
import { useCatalogViewModel, selectCatalog } from '../../../viewmodels/catalogViewModel';
import { appointmentsService, type AppointmentTab } from '../../../services/api/appointmentsService';
import { mockUser } from '../../../services/mockData';
import InspectionCard from '../../../components/InspectionCard';
import EmptyState from '../../../components/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { hs, vs } from '../../../utils/scaling';

type Props = MainTabScreenProps<'Dashboard'>;

/**
 * Returns a time-of-day greeting (with icon) based on the current hour in IST
 * (UTC+5:30), independent of the device's local timezone.
 *
 * Computed from the UTC offset rather than Intl timeZone data, since
 * Hermes' Intl timezone support is inconsistent across platforms.
 */
function getGreeting(): { label: string; icon: string } {
  const now = new Date();
  // Shift UTC time by IST offset (+5h30m), then read the hour in UTC terms.
  const IST_OFFSET_MINUTES = 5 * 60 + 30;
  const istMillis = now.getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const hour = new Date(istMillis).getUTCHours();

  if (hour < 12) return { label: 'Good Morning', icon: '☀️' };     // < 12:00
  if (hour < 16) return { label: 'Good Afternoon', icon: '🌤️' };   // < 16:00
  if (hour < 20) return { label: 'Good Evening', icon: '👋' };     // < 20:00
  return { label: 'Good Night', icon: '🌙' };
}

const FILTER_TABS: { label: string; value: AppointmentTab }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'QC Pending', value: 'QC_PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
];

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const [activeFilter, setActiveFilter] = useState<AppointmentTab>('ALL');
  const [searchText, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<InspectionLead[]>([]);
  // C-1: scoped selector — only the action, which has stable identity in Zustand
  const setCurrentLead = useInspectionStore((s) => s.setCurrentLead);
  const { user } = useAuth();

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);
  const catalog = useCatalogViewModel(selectCatalog);

  // Tracks the in-flight request so a newer fetch can cancel an older one.
  const abortRef = useRef<AbortController | null>(null);

  const loadLeads = useCallback(
    async (opts?: { isRefresh?: boolean }) => {
      // Cancel any previous in-flight request.
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      if (opts?.isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await appointmentsService.fetchAssigned({
          tab: activeFilter,
          appointmentId: submittedSearch || undefined,
          signal: ac.signal,
        });
        if (!ac.signal.aborted) {
          setLeads(result);
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Failed to load appointments';
        console.error('[Dashboard] ❌ Failed to load appointments:', message);
        if (!ac.signal.aborted) {
          setError(message);
          setLeads([]);
        }
      } finally {
        if (!ac.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [activeFilter, submittedSearch],
  );

  // Re-fetch whenever the active tab or submitted search changes.
  useEffect(() => {
    loadLeads();
    return () => abortRef.current?.abort();
  }, [loadLeads]);

  const handleSearchSubmit = useCallback(() => {
    setSubmittedSearch(searchText.trim());
  }, [searchText]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSubmittedSearch('');
  }, []);

  const handleCardPress = useCallback(
    (lead: InspectionLead) => {
      // Ensure catalog is loaded
      if (!catalog || !catalog.sections || catalog.sections.length === 0) {
        console.error('[Dashboard] ❌ Catalog not loaded! Cannot set lead.');
        Alert.alert('Please wait', 'The inspection form is still loading. Try again in a moment.');
        return;
      }

      // Extract catalog sections for dynamic step creation
      const catalogSections = catalog.sections.map((sec) => ({
        section: sec.section,
        label: sec.label,
      }));

      // Set the lead with catalog sections
      setCurrentLead(lead, catalogSections);

      // @ts-ignore – cross-navigator navigation
      navigation.navigate('InspectionNavigator', {
        screen: 'LeadDetails',
        params: { inspectionId: lead.id },
      });
    },
    [navigation, setCurrentLead, catalog],
  );

  const handleRefresh = useCallback(() => {
    loadLeads({ isRefresh: true });
  }, [loadLeads]);

  const renderItem = useCallback(
    ({ item }: { item: InspectionLead }) => (
      <InspectionCard lead={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: InspectionLead) => item.id, []);

  const ListHeader = (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Appointment ID"
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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
        {submittedSearch ? `Results for "${submittedSearch}"` : `${leads.length} lead${leads.length !== 1 ? 's' : ''}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + vs(16) }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting.label} {greeting.icon}</Text>
          <Text style={styles.name}>{user?.displayName || mockUser.name}</Text>
          <Text style={styles.zone}>📍 {mockUser.zone} • {mockUser.employeeId}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleOpenProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            testID="profile-avatar-btn">
            <Text style={styles.avatarText}>
              {(user?.displayName || mockUser.name).charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={leads}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Loading leads…</Text>
            </View>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Something went wrong"
              description={error}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="No Leads Found"
              description={
                submittedSearch
                  ? 'No appointment matches your search.'
                  : 'No leads match the selected filter.'
              }
            />
          )
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
    </View>
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
    width: hs(56),
    height: hs(56),
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: vs(12),
    paddingBottom: vs(8),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: vs(44),
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: vs(16),
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: vs(14),
    color: colors.textTertiary,
    paddingHorizontal: hs(4),
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(48),
  },
  loaderText: {
    marginTop: vs(12),
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
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
