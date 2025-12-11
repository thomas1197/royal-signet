/**
 * DonationHistoryScreen.tsx
 *
 * Displays user's donation history with:
 * - List of past donations
 * - Donation details (amount, type, date)
 * - Total giving statistics
 * - Option to download receipts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { getUserFriendlyErrorMessage, logError } from '../../utils/errorHandling';

// Colors from brand
const COLORS = {
  primary: '#8B0101',
  secondary: '#FFF9E9',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
};

type RootStackParamList = {
  Donation: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donationType: string;
  note: string;
  status: string;
  createdAt: Date;
  paymentIntentId: string;
}

export default function DonationHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  /**
   * Fetch donation history from Firestore
   */
  const fetchDonations = async (isRefreshing: boolean = false) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Not Logged In', 'Please log in to view your donation history');
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Query donations collection for current user
      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const donationsData: Donation[] = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const donation: Donation = {
          id: doc.id,
          amount: data.amount / 100, // Convert from cents to dollars
          currency: data.currency || 'usd',
          donationType: data.donationType || 'offering',
          note: data.note || '',
          status: data.status,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
          paymentIntentId: data.paymentIntentId,
        };

        donationsData.push(donation);
        total += donation.amount;
      });

      setDonations(donationsData);
      setTotalAmount(total);
    } catch (error) {
      logError('Error fetching donations', error);
      Alert.alert('Error', getUserFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Load donations on screen focus
   */
  useFocusEffect(
    useCallback(() => {
      fetchDonations();
    }, [])
  );

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchDonations(true);
  };

  /**
   * Navigate to new donation screen
   */
  const handleNewDonation = () => {
    navigation.navigate('Donation');
  };

  /**
   * Show donation details
   */
  const handleDonationPress = (donation: Donation) => {
    Alert.alert(
      'Donation Details',
      `Amount: $${donation.amount.toFixed(2)}\n` +
        `Type: ${donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)}\n` +
        `Date: ${donation.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}\n` +
        `${donation.note ? `\nNote: ${donation.note}` : ''}\n\n` +
        `Transaction ID: ${donation.paymentIntentId}`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Render individual donation item
   */
  const renderDonationItem = ({ item }: { item: Donation }) => {
    const donationTypeEmoji = item.donationType === 'tithe' ? '🙏' : item.donationType === 'special' ? '✨' : '💝';

    return (
      <TouchableOpacity
        style={styles.donationCard}
        onPress={() => handleDonationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.donationHeader}>
          <View style={styles.donationTypeContainer}>
            <Text style={styles.donationTypeEmoji}>{donationTypeEmoji}</Text>
            <View>
              <Text style={styles.donationType}>
                {item.donationType.charAt(0).toUpperCase() + item.donationType.slice(1)}
              </Text>
              <Text style={styles.donationDate}>
                {item.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.donationAmount}>${item.amount.toFixed(2)}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Completed</Text>
            </View>
          </View>
        </View>

        {item.note ? (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note:</Text>
            <Text style={styles.noteText} numberOfLines={2}>
              {item.note}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>💝</Text>
      <Text style={styles.emptyStateTitle}>No Donations Yet</Text>
      <Text style={styles.emptyStateText}>
        Start supporting Royal Signet Church by making your first donation
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleNewDonation}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyStateButtonText}>Make Your First Donation</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render header with statistics
   */
  const renderHeader = () => {
    if (donations.length === 0) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Giving</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${totalAmount.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Donated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>
              {donations.length === 1 ? 'Donation' : 'Donations'}
            </Text>
          </View>
        </View>
        <View style={styles.taxInfo}>
          <Text style={styles.taxInfoText}>
            All donations are tax-deductible. Keep this history for your records.
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your donations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={donations}
        renderItem={renderDonationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {donations.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.newDonationButton}
            onPress={handleNewDonation}
            activeOpacity={0.8}
          >
            <Text style={styles.newDonationButtonText}>+ Make New Donation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  taxInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  taxInfoText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  donationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  donationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  donationTypeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  donationType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  donationDate: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  noteLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  newDonationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newDonationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
