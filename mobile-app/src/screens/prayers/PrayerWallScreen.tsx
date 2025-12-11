import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button, ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase';
import {
  subscribeToPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  markPrayerAsAnswered,
  deletePrayerRequest,
  togglePrayed,
  checkUserPrayedStatus,
} from '../../services/prayerWall';
import { PrayerCard } from './components/PrayerCard';
import { PrayerRequest, PrayerRequestDisplay } from '../../types/prayer';
import { Timestamp } from 'firebase/firestore';

type TabType = 'active' | 'answered';

export const PrayerWallScreen = () => {
  const { theme } = useTheme();
  const user = auth.currentUser;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activePrayers, setActivePrayers] = useState<PrayerRequestDisplay[]>([]);
  const [answeredPrayers, setAnsweredPrayers] = useState<PrayerRequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [editingPrayerId, setEditingPrayerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load prayers on mount
  useEffect(() => {
    loadPrayers();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeActive = subscribeToPrayerRequests(
      'active',
      async (prayers) => {
        const displayPrayers = await convertToDisplayPrayers(prayers);
        setActivePrayers(displayPrayers);
        setLoading(false);
      }
    );

    const unsubscribeAnswered = subscribeToPrayerRequests(
      'answered',
      async (prayers) => {
        const displayPrayers = await convertToDisplayPrayers(prayers);
        setAnsweredPrayers(displayPrayers);
      }
    );

    return () => {
      unsubscribeActive();
      unsubscribeAnswered();
    };
  }, []);

  // Convert Firestore prayers to display format
  const convertToDisplayPrayers = async (
    prayers: PrayerRequest[]
  ): Promise<PrayerRequestDisplay[]> => {
    if (!user || prayers.length === 0) {
      return prayers.map(convertSinglePrayer);
    }

    // Batch check which prayers user has prayed for
    const prayerIds = prayers.map((p) => p.id);
    const prayedStatusMap = await checkUserPrayedStatus(prayerIds);

    return prayers.map((prayer) => {
      const hasPrayed = prayedStatusMap.get(prayer.id) || false;
      return {
        ...convertSinglePrayer(prayer),
        hasPrayed,
      };
    });
  };

  const convertSinglePrayer = (prayer: PrayerRequest): PrayerRequestDisplay => {
    return {
      ...prayer,
      createdAt: (prayer.createdAt as Timestamp).toDate(),
      updatedAt: (prayer.updatedAt as Timestamp).toDate(),
      answeredAt: prayer.answeredAt
        ? (prayer.answeredAt as Timestamp).toDate()
        : null,
      hasPrayed: false, // Will be updated by batch check
      timeAgo: getTimeAgo(
        prayer.status === 'answered' && prayer.answeredAt
          ? (prayer.answeredAt as Timestamp).toDate()
          : (prayer.createdAt as Timestamp).toDate()
      ),
    };
  };

  const loadPrayers = async () => {
    setLoading(true);
    // Subscriptions will handle the data loading
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The subscriptions will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Helper function to get relative time
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (seconds < 2592000) {
      const days = Math.floor(seconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    const months = Math.floor(seconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  // Handle submit new prayer
  const handleSubmitPrayer = async () => {
    if (!prayerText.trim()) {
      Alert.alert('Error', 'Please enter your prayer request');
      return;
    }

    setSubmitting(true);
    try {
      await createPrayerRequest({ request: prayerText.trim() });
      setPrayerText('');
      setAddModalVisible(false);
      Alert.alert('Success', 'Your prayer request has been shared with the community');
    } catch (error) {
      console.error('Error submitting prayer:', error);
      Alert.alert('Error', 'Failed to submit prayer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit prayer
  const handleEditPrayer = (prayerId: string) => {
    const prayer =
      activePrayers.find((p) => p.id === prayerId) ||
      answeredPrayers.find((p) => p.id === prayerId);

    if (prayer) {
      setPrayerText(prayer.request);
      setEditingPrayerId(prayerId);
      setEditModalVisible(true);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingPrayerId || !prayerText.trim()) {
      Alert.alert('Error', 'Please enter your prayer request');
      return;
    }

    setSubmitting(true);
    try {
      await updatePrayerRequest(editingPrayerId, {
        request: prayerText.trim(),
      });
      setPrayerText('');
      setEditingPrayerId(null);
      setEditModalVisible(false);
      Alert.alert('Success', 'Your prayer request has been updated');
    } catch (error) {
      console.error('Error updating prayer:', error);
      Alert.alert('Error', 'Failed to update prayer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle mark as answered
  const handleMarkAnswered = (prayerId: string) => {
    Alert.alert(
      'Mark as Answered',
      'Has God answered this prayer? It will be moved to Answered Prayers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Answered!',
          style: 'default',
          onPress: async () => {
            try {
              await markPrayerAsAnswered(prayerId);
              Alert.alert('Praise God!', 'Prayer marked as answered');
            } catch (error) {
              console.error('Error marking prayer as answered:', error);
              Alert.alert('Error', 'Failed to mark prayer as answered');
            }
          },
        },
      ]
    );
  };

  // Handle delete prayer
  const handleDeletePrayer = (prayerId: string) => {
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer request? It will be hidden from the community.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePrayerRequest(prayerId);
              Alert.alert('Deleted', 'Prayer request has been removed');
            } catch (error) {
              console.error('Error deleting prayer:', error);
              Alert.alert('Error', 'Failed to delete prayer');
            }
          },
        },
      ]
    );
  };

  // Handle pray for someone
  const handlePrayFor = async (prayerId: string) => {
    try {
      const result = await togglePrayed(prayerId);

      // Update local state optimistically
      const updatePrayers = (prayers: PrayerRequestDisplay[]) =>
        prayers.map((prayer) =>
          prayer.id === prayerId
            ? {
                ...prayer,
                hasPrayed: result.hasPrayed,
                prayerCount: result.newCount,
              }
            : prayer
        );

      setActivePrayers(updatePrayers);
      setAnsweredPrayers(updatePrayers);
    } catch (error) {
      console.error('Error toggling prayer:', error);
      Alert.alert('Error', 'Failed to update prayer status');
    }
  };

  const currentPrayers = activeTab === 'active' ? activePrayers : answeredPrayers;

  const styles = createStyles(theme);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title="Prayer Wall"
        subtitle={activeTab === 'active' ? 'The prayer of the righteous is powerful' : `${answeredPrayers.length} prayers answered! Praise God!`}
        showLogo={true}
        theme={theme}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active Prayers
          </Text>
          <View
            style={[
              styles.tabIndicator,
              activeTab === 'active' && styles.tabIndicatorActive,
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'answered' && styles.tabActive]}
          onPress={() => setActiveTab('answered')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'answered' && styles.tabTextActive,
            ]}
          >
            Answered Prayers
          </Text>
          <View
            style={[
              styles.tabIndicator,
              activeTab === 'answered' && styles.tabIndicatorActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Prayers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading prayers...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.prayersContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {currentPrayers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'active' ? 'hand-right-outline' : 'star-outline'}
                size={64}
                color={theme.colors.text.tertiary}
                style={{ marginBottom: theme.spacing[3] }}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'active'
                  ? 'No Active Prayers'
                  : 'No Answered Prayers Yet'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'active'
                  ? 'Be the first to share a prayer request'
                  : 'Answered prayers will appear here'}
              </Text>
            </View>
          ) : (
            currentPrayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                isOwner={prayer.userId === user?.uid}
                onPray={handlePrayFor}
                onEdit={handleEditPrayer}
                onMarkAnswered={activeTab === 'active' ? handleMarkAnswered : undefined}
                onDelete={handleDeletePrayer}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={theme.colors.background.white} />
      </TouchableOpacity>

      {/* Add Prayer Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Prayer Request</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.prayerInput}
              placeholder="Share what's on your heart..."
              placeholderTextColor={theme.colors.text.placeholder}
              value={prayerText}
              onChangeText={setPrayerText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />

            <Button
              title="Share Prayer"
              onPress={handleSubmitPrayer}
              loading={submitting}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Prayer Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Prayer Request</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.prayerInput}
              placeholder="Share what's on your heart..."
              placeholderTextColor={theme.colors.text.placeholder}
              value={prayerText}
              onChangeText={setPrayerText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />

            <Button
              title="Update Prayer"
              onPress={handleSubmitEdit}
              loading={submitting}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GestureHandlerRootView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing[6],
      paddingTop: theme.spacing[12],
      paddingBottom: theme.spacing[4],
    },
    title: {
      fontFamily: theme.typography.fonts.lora,
      fontSize: theme.typography.sizes['4xl'],
      fontWeight: theme.typography.weights.semiBold,
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontFamily: theme.typography.fonts.satoshi,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing[1],
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing[6],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing[4],
      alignItems: 'center',
    },
    tabActive: {
      // Active state
    },
    tabText: {
      fontFamily: theme.typography.fonts.satoshi,
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.tertiary,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.semiBold,
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: 'transparent',
    },
    tabIndicatorActive: {
      backgroundColor: theme.colors.primary,
    },
    scrollView: {
      flex: 1,
    },
    prayersContainer: {
      padding: theme.spacing[6],
      paddingBottom: theme.spacing[24],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: theme.typography.fonts.satoshi,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing[4],
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[16],
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: theme.spacing[4],
    },
    emptyTitle: {
      fontFamily: theme.typography.fonts.lora,
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[2],
    },
    emptyText: {
      fontFamily: theme.typography.fonts.satoshi,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing[10],
      right: theme.spacing[6],
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.navigation,
    },
    fabIcon: {
      fontSize: 32,
      color: theme.colors.background.white,
      fontWeight: '300',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalDismissArea: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius['2xl'],
      borderTopRightRadius: theme.borderRadius['2xl'],
      padding: theme.spacing[6],
      paddingBottom: theme.spacing[10],
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[6],
    },
    modalTitle: {
      fontFamily: theme.typography.fonts.lora,
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semiBold,
      color: theme.colors.text.primary,
    },
    modalClose: {
      fontSize: 24,
      color: theme.colors.text.tertiary,
    },
    prayerInput: {
      backgroundColor: theme.colors.background.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[4],
      fontFamily: theme.typography.fonts.satoshi,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.text.primary,
      height: 150,
      marginBottom: theme.spacing[6],
    },
    submitButton: {
      width: '100%',
    },
  });
