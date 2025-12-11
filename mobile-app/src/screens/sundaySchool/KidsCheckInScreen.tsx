import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SundaySchoolClass, Child, AGE_GROUP_LABELS } from '../../types/sundaySchool';
import { AttendanceRecord } from '../../types/attendance';
import { getAllClasses, getAllChildren, getChildrenByClass } from '../../services/sundaySchool';
import {
  getTodaysSession,
  startSundaySchoolSession,
  checkInPerson,
  checkOutPerson,
  subscribeToSessionAttendance,
  getPersonSessionRecord,
} from '../../services/attendance';

export const KidsCheckInScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const preselectedClassId = route.params?.classId;

  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(preselectedClassId || null);
  const [children, setChildren] = useState<Child[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadChildrenForClass(selectedClassId);
    } else {
      loadAllChildren();
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToSessionAttendance(
      sessionId,
      (records) => setAttendanceRecords(records),
      (error) => console.error('Error subscribing to attendance:', error)
    );

    return () => unsubscribe();
  }, [sessionId]);

  const loadInitialData = async () => {
    try {
      const [classData, existingSession] = await Promise.all([
        getAllClasses(),
        getTodaysSession('sunday_school'),
      ]);

      setClasses(classData);

      if (existingSession) {
        setSessionId(existingSession.id);
      }

      if (!selectedClassId) {
        await loadAllChildren();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAllChildren = async () => {
    try {
      const allChildren = await getAllChildren();
      setChildren(allChildren);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const loadChildrenForClass = async (classId: string) => {
    try {
      const classChildren = await getChildrenByClass(classId);
      setChildren(classChildren);
    } catch (error) {
      console.error('Error loading children for class:', error);
    }
  };

  const startSession = async () => {
    try {
      setLoading(true);
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const newSessionId = await startSundaySchoolSession(
        selectedClassId || undefined,
        selectedClass?.name
      );
      setSessionId(newSessionId);
      Alert.alert('Success', 'Attendance session started');
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (child: Child) => {
    if (!sessionId) {
      Alert.alert('No Session', 'Please start an attendance session first');
      return;
    }

    try {
      setCheckingIn(child.id);

      // Check if already checked in
      const existing = await getPersonSessionRecord(sessionId, child.id);
      if (existing) {
        Alert.alert('Already Checked In', `${child.firstName} is already checked in`);
        return;
      }

      await checkInPerson(
        sessionId,
        child.id,
        'child',
        `${child.firstName} ${child.lastName}`,
        {
          classId: child.classId,
          className: child.className,
        }
      );
    } catch (error: any) {
      console.error('Error checking in:', error);
      Alert.alert('Error', error.message || 'Failed to check in');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (recordId: string) => {
    try {
      await checkOutPerson(recordId);
    } catch (error) {
      console.error('Error checking out:', error);
      Alert.alert('Error', 'Failed to check out');
    }
  };

  const isCheckedIn = (childId: string): AttendanceRecord | undefined => {
    return attendanceRecords.find((r) => r.personId === childId);
  };

  const filteredChildren = children.filter((child) => {
    const query = searchQuery.toLowerCase();
    return (
      child.firstName.toLowerCase().includes(query) ||
      child.lastName.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScreenHeader title="Kids Check-In" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScreenHeader title="Kids Check-In" showBackButton />

      <View style={styles.content}>
        {/* Session Status */}
        <View style={[styles.sessionCard, { backgroundColor: sessionId ? '#E8F5E9' : '#FFF3E0' }]}>
          <Ionicons
            name={sessionId ? 'checkmark-circle' : 'time-outline'}
            size={24}
            color={sessionId ? '#2E7D32' : '#F57C00'}
          />
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionStatus, { color: sessionId ? '#2E7D32' : '#F57C00' }]}>
              {sessionId ? 'Session Active' : 'No Active Session'}
            </Text>
            <Text style={styles.sessionSubtext}>
              {sessionId
                ? `${attendanceRecords.length} checked in`
                : 'Start a session to begin check-in'}
            </Text>
          </View>
          {!sessionId && (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={startSession}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Class Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classFilter}>
          <TouchableOpacity
            style={[
              styles.classChip,
              !selectedClassId && styles.classChipSelected,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedClassId(null)}
          >
            <Text
              style={[
                styles.classChipText,
                !selectedClassId && styles.classChipTextSelected,
                { color: !selectedClassId ? '#FFF' : theme.colors.primary },
              ]}
            >
              All Classes
            </Text>
          </TouchableOpacity>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.classChip,
                selectedClassId === cls.id && styles.classChipSelected,
                { borderColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedClassId(cls.id)}
            >
              <Text
                style={[
                  styles.classChipText,
                  selectedClassId === cls.id && styles.classChipTextSelected,
                  { color: selectedClassId === cls.id ? '#FFF' : theme.colors.primary },
                ]}
              >
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search children..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Children List */}
        <ScrollView style={styles.childrenList}>
          {filteredChildren.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                {searchQuery ? 'No children found' : 'No children registered'}
              </Text>
            </View>
          ) : (
            filteredChildren.map((child) => {
              const record = isCheckedIn(child.id);
              const isLoading = checkingIn === child.id;

              return (
                <View
                  key={child.id}
                  style={[
                    styles.childCard,
                    { backgroundColor: theme.colors.background.secondary },
                    record && styles.childCardCheckedIn,
                  ]}
                >
                  <View style={styles.childInfo}>
                    <Text style={[styles.childName, { color: theme.colors.text.primary }]}>
                      {child.firstName} {child.lastName}
                    </Text>
                    <Text style={[styles.childClass, { color: theme.colors.text.secondary }]}>
                      {child.className || AGE_GROUP_LABELS[child.ageGroup]}
                    </Text>
                  </View>

                  {record ? (
                    <View style={styles.checkedInActions}>
                      <View style={styles.checkedInBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                        <Text style={styles.checkedInText}>In</Text>
                      </View>
                      {!record.checkedOutAt && (
                        <TouchableOpacity
                          style={styles.checkOutButton}
                          onPress={() => handleCheckOut(record.id)}
                        >
                          <Text style={styles.checkOutText}>Check Out</Text>
                        </TouchableOpacity>
                      )}
                      {record.checkedOutAt && (
                        <View style={styles.checkedOutBadge}>
                          <Text style={styles.checkedOutText}>Out</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.checkInButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleCheckIn(child)}
                      disabled={isLoading || !sessionId}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.checkInText}>Check In</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
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
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  classFilter: {
    flexDirection: 'row',
    marginBottom: 16,
    maxHeight: 40,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  classChipSelected: {
    backgroundColor: '#8B0000',
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  classChipTextSelected: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  childrenList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  childCardCheckedIn: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
  },
  childClass: {
    fontSize: 13,
    marginTop: 2,
  },
  checkedInActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkedInText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  checkOutButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF3E0',
  },
  checkOutText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '600',
  },
  checkedOutBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  checkedOutText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  checkInText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
