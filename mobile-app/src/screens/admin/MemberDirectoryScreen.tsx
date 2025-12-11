import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ScreenHeader, Avatar } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ChurchMember, MemberStatus, MEMBER_STATUS_LABELS } from '../../types/members';
import {
  getAllMembers,
  searchMembers,
  getMembersByStatus,
  getMemberCountsByStatus,
} from '../../services/memberDirectory';
import { isPastor } from '../../services/permissions';

export const MemberDirectoryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ChurchMember[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<MemberStatus, number>>({
    active: 0,
    inactive: 0,
    visitor: 0,
    former: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, selectedStatus]);

  const checkAccess = async () => {
    const canAccess = await isPastor();
    setHasAccess(canAccess);
    if (canAccess) {
      loadData();
    } else {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [memberData, counts] = await Promise.all([
        getAllMembers(),
        getMemberCountsByStatus(),
      ]);
      setMembers(memberData);
      setStatusCounts(counts);
    } catch (error: any) {
      console.error('Error loading members:', error);
      if (error.message?.includes('Pastor')) {
        setHasAccess(false);
      } else {
        Alert.alert('Error', 'Failed to load member directory');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (selectedStatus) {
      filtered = filtered.filter((m) => m.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query) ||
          m.phone?.includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScreenHeader title="Member Directory" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScreenHeader title="Member Directory" showBackButton />
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={theme.colors.text.tertiary} />
          <Text style={[styles.accessDeniedTitle, { color: theme.colors.text.primary }]}>
            Access Restricted
          </Text>
          <Text style={[styles.accessDeniedText, { color: theme.colors.text.secondary }]}>
            Only the Pastor can access the full member directory with contact information.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScreenHeader title="Member Directory" showBackButton />

      <View style={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {(Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.background.secondary },
                selectedStatus === status && styles.statCardSelected,
              ]}
              onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
            >
              <Text
                style={[
                  styles.statNumber,
                  { color: selectedStatus === status ? '#FFF' : theme.colors.primary },
                ]}
              >
                {statusCounts[status]}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: selectedStatus === status ? '#FFF' : theme.colors.text.secondary },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search by name, email, or phone..."
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

        {/* Results count */}
        <Text style={[styles.resultsCount, { color: theme.colors.text.secondary }]}>
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          {selectedStatus ? ` (${selectedStatus})` : ''}
        </Text>

        {/* Members List */}
        <ScrollView
          style={styles.membersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                {searchQuery ? 'No members found' : 'No members in directory'}
              </Text>
            </View>
          ) : (
            filteredMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberCard, { backgroundColor: theme.colors.background.secondary }]}
                onPress={() => navigation.navigate('MemberDetail', { memberId: member.id })}
              >
                <Avatar
                  uri={member.photoUrl}
                  name={`${member.firstName} ${member.lastName}`}
                  size={50}
                />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: theme.colors.text.primary }]}>
                    {member.firstName} {member.lastName}
                  </Text>
                  {member.email && (
                    <Text style={[styles.memberContact, { color: theme.colors.text.secondary }]}>
                      {member.email}
                    </Text>
                  )}
                  {member.phone && (
                    <Text style={[styles.memberContact, { color: theme.colors.text.secondary }]}>
                      {member.phone}
                    </Text>
                  )}
                </View>
                <View style={styles.memberMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          member.status === 'active'
                            ? '#E8F5E9'
                            : member.status === 'visitor'
                            ? '#E3F2FD'
                            : '#F5F5F5',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            member.status === 'active'
                              ? '#2E7D32'
                              : member.status === 'visitor'
                              ? '#1565C0'
                              : '#757575',
                        },
                      ]}
                    >
                      {member.status}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Add Member FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => Alert.alert('Coming Soon', 'Add member functionality')}
        >
          <Ionicons name="person-add" size={24} color="#FFF" />
        </TouchableOpacity>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  accessDeniedText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statCardSelected: {
    backgroundColor: '#8B0000',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  resultsCount: {
    fontSize: 12,
    marginBottom: 12,
  },
  membersList: {
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
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberContact: {
    fontSize: 13,
    marginTop: 2,
  },
  memberMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
