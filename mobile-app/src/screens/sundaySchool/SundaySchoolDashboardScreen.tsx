import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  SundaySchoolClass,
  AGE_GROUP_LABELS,
  AgeGroup,
} from '../../types/sundaySchool';
import {
  getAllClasses,
  subscribeToClasses,
  getChildrenCountByClass,
  getChildrenCountByAgeGroup,
} from '../../services/sundaySchool';
import { getTodaysSession, getAttendanceSummary } from '../../services/attendance';
import { canManageSundaySchool, canTakeKidsAttendance } from '../../services/permissions';

export const SundaySchoolDashboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [childCounts, setChildCounts] = useState<Record<string, number>>({});
  const [ageGroupCounts, setAgeGroupCounts] = useState<Record<AgeGroup, number>>({
    toddlers: 0,
    kids_5_8: 0,
    tweens_9_12: 0,
    teens_13_17: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [canTakeAttendance, setCanTakeAttendance] = useState(false);

  useEffect(() => {
    loadData();
    checkPermissions();

    const unsubscribe = subscribeToClasses(
      (updatedClasses) => setClasses(updatedClasses),
      (error) => console.error('Error subscribing to classes:', error)
    );

    return () => unsubscribe();
  }, []);

  const checkPermissions = async () => {
    const [manage, attendance] = await Promise.all([
      canManageSundaySchool(),
      canTakeKidsAttendance(),
    ]);
    setCanManage(manage);
    setCanTakeAttendance(attendance);
  };

  const loadData = async () => {
    try {
      const [classData, childCountData, ageCountData] = await Promise.all([
        getAllClasses(),
        getChildrenCountByClass(),
        getChildrenCountByAgeGroup(),
      ]);

      setClasses(classData);
      setChildCounts(childCountData);
      setAgeGroupCounts(ageCountData);

      // Check today's attendance
      const todaySession = await getTodaysSession('sunday_school');
      if (todaySession) {
        const summary = await getAttendanceSummary(todaySession.id);
        setTodayAttendance(summary.totalCount);
      }
    } catch (error) {
      console.error('Error loading Sunday School data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalChildren = Object.values(ageGroupCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScreenHeader title="Sunday School" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScreenHeader title="Sunday School" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {totalChildren}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Total Children
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {classes.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Active Classes
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {todayAttendance ?? '-'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
              Today
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {canTakeAttendance && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('KidsCheckIn')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.actionButtonText}>Take Attendance</Text>
            </TouchableOpacity>
          )}
          {canManage && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.accent || '#2E7D32' }]}
              onPress={() => navigation.navigate('ChildRegistration')}
            >
              <Ionicons name="person-add" size={24} color="#FFF" />
              <Text style={styles.actionButtonText}>Register Child</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Age Group Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Children by Age Group
        </Text>
        <View style={[styles.ageGroupCard, { backgroundColor: theme.colors.background.secondary }]}>
          {(Object.keys(AGE_GROUP_LABELS) as AgeGroup[]).map((ageGroup) => (
            <View key={ageGroup} style={styles.ageGroupRow}>
              <Text style={[styles.ageGroupLabel, { color: theme.colors.text.primary }]}>
                {AGE_GROUP_LABELS[ageGroup]}
              </Text>
              <View style={[styles.ageGroupBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.ageGroupCount, { color: theme.colors.primary }]}>
                  {ageGroupCounts[ageGroup]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Classes List */}
        <View style={styles.classesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Classes
          </Text>
          {canManage && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClassList')}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
                Manage
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {classes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.background.secondary }]}>
            <Ionicons name="school-outline" size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              No classes created yet
            </Text>
            {canManage && (
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('ClassList')}
              >
                <Text style={styles.createButtonText}>Create First Class</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={[styles.classCard, { backgroundColor: theme.colors.background.secondary }]}
              onPress={() => navigation.navigate('ClassDetail', { classId: classItem.id })}
            >
              <View style={styles.classInfo}>
                <Text style={[styles.className, { color: theme.colors.text.primary }]}>
                  {classItem.name}
                </Text>
                <Text style={[styles.classAgeGroup, { color: theme.colors.text.secondary }]}>
                  {AGE_GROUP_LABELS[classItem.ageGroup]}
                </Text>
                {classItem.room && (
                  <Text style={[styles.classRoom, { color: theme.colors.text.tertiary }]}>
                    Room: {classItem.room}
                  </Text>
                )}
              </View>
              <View style={styles.classStats}>
                <View style={[styles.childCountBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.childCountText}>
                    {childCounts[classItem.id] || 0}
                  </Text>
                </View>
                <Text style={[styles.childCountLabel, { color: theme.colors.text.tertiary }]}>
                  children
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  ageGroupCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  ageGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ageGroupLabel: {
    fontSize: 14,
  },
  ageGroupBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageGroupCount: {
    fontWeight: '600',
  },
  classesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
  },
  classAgeGroup: {
    fontSize: 13,
    marginTop: 2,
  },
  classRoom: {
    fontSize: 12,
    marginTop: 2,
  },
  classStats: {
    alignItems: 'center',
    marginRight: 12,
  },
  childCountBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childCountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  childCountLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  bottomPadding: {
    height: 32,
  },
});
