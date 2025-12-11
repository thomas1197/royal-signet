import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase';
import { signOut } from '../../services/googleAuth';
import { EventCard, SermonCard, Avatar, Button } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { getVerseOfTheDay, refreshVerseOfTheDay, VerseOfTheDay } from '../../services/verseOfTheDay';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, mode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dailyVerse, setDailyVerse] = useState<VerseOfTheDay | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const user = auth.currentUser;

  const upcomingSermons = [
    {
      id: '1',
      title: 'Walking in Faith',
      speaker: 'Pastor Ben Mathew',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      category: 'Faith',
    },
    {
      id: '2',
      title: 'Love One Another',
      speaker: 'Pastor Raichu John Mathew',
      imageUrl: 'https://picsum.photos/400/300?random=2',
      category: 'Love',
    },
    {
      id: '3',
      title: 'Finding Strength',
      speaker: 'Pastor Ben Mathew',
      imageUrl: 'https://picsum.photos/400/300?random=3',
      category: 'Hope',
    },
    {
      id: '4',
      title: 'The Light of The World',
      speaker: 'Pastor Raichu John Mathew',
      imageUrl: 'https://picsum.photos/400/300?random=4',
      category: 'Life',
    },
  ];

  const futureEvents = [
    {
      id: '1',
      title: 'The Upperroom',
      date: 'Dec 24',
      imageUrl: 'https://picsum.photos/300/400?random=5',
    },
    {
      id: '2',
      title: 'Christmas Eve',
      date: 'Dec 25',
      imageUrl: 'https://picsum.photos/300/400?random=6',
    },
    {
      id: '3',
      title: 'Cross Over Service',
      date: 'Dec 31',
      imageUrl: 'https://picsum.photos/300/400?random=7',
    },
  ];

  const announcement = {
    title: 'Special Christmas Service',
    description: 'Join us for a night of worship and celebration',
    imageUrl: 'https://picsum.photos/800/300?random=8',
  };

  // Load verse of the day on mount
  useEffect(() => {
    loadVerse();
  }, []);

  const loadVerse = async () => {
    try {
      setLoadingVerse(true);
      const verse = await getVerseOfTheDay();
      setDailyVerse(verse);
    } catch (error) {
      console.error('Error loading verse:', error);
    } finally {
      setLoadingVerse(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh verse of the day
      const verse = await refreshVerseOfTheDay();
      setDailyVerse(verse);
      // TODO: Fetch other fresh data from Firebase
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by auth state listener
            } catch (error: any) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{user?.displayName || 'Friend'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            style={styles.themeToggle}
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Avatar
              imageUrl={user?.photoURL || undefined}
              name={user?.displayName || 'User'}
              size="medium"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Verse */}
      <View style={styles.verseCard}>
        <Text style={styles.verseLabel}>Verse of the Day</Text>
        {loadingVerse ? (
          <View style={styles.verseLoading}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.verseLoadingText}>Loading today's verse...</Text>
          </View>
        ) : dailyVerse ? (
          <>
            <Text style={styles.verseText}>{dailyVerse.text}</Text>
            <Text style={styles.verseReference}>
              {dailyVerse.reference}
              {dailyVerse.translation && ` (${dailyVerse.translation})`}
            </Text>
          </>
        ) : (
          <Text style={styles.verseText}>
            Tap to refresh and load today's verse
          </Text>
        )}
      </View>

      {/* Announcement Banner */}
      <TouchableOpacity
        style={styles.announcement}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('UpdateDetail', {
            id: 'announcement-1',
            title: announcement.title,
            content: announcement.description + '\n\nJoin us for an unforgettable evening of worship, prayer, and fellowship as we celebrate this special Christmas service together as a church family.',
            imageUrl: announcement.imageUrl,
            author: 'Church Admin',
            timestamp: 'Today',
            category: 'announcement',
          })
        }
      >
        <View style={styles.announcementContent}>
          <View style={styles.announcementIcon}>
            <Ionicons name="megaphone" size={24} color={theme.colors.background.white} />
          </View>
          <View style={styles.announcementText}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementDescription}>
              {announcement.description}
            </Text>
          </View>
          <Text style={styles.announcementArrow}>→</Text>
        </View>
      </TouchableOpacity>

      {/* Upcoming Sermons */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Sermons</Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate('Sermons')}
          >
            <Text style={styles.seeAll}>Hear More →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionQuirk}>Faith comes by hearing</Text>

        <View style={styles.sermonsGrid}>
          {upcomingSermons.slice(0, 2).map((sermon) => (
            <View key={sermon.id} style={styles.sermonItem}>
              <SermonCard
                {...sermon}
                onPress={() => navigation.navigate('SermonDetail', sermon)}
              />
            </View>
          ))}
        </View>
        <View style={styles.sermonsGrid}>
          {upcomingSermons.slice(2, 4).map((sermon) => (
            <View key={sermon.id} style={styles.sermonItem}>
              <SermonCard
                {...sermon}
                onPress={() => navigation.navigate('SermonDetail', sermon)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Future Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Future Events</Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => Alert.alert('Events', 'Full events list coming soon!')}
          >
            <Text style={styles.seeAll}>Discover More →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionQuirk}>Where two or three gather</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsScroll}
        >
          {futureEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              variant="small"
              onPress={() => navigation.navigate('EventDetail', event)}
            />
          ))}
        </ScrollView>
      </View>

      {/* See Ya at Church */}
      <View style={styles.churchCallout}>
        <Text style={styles.churchCalloutText}>See ya at Church!</Text>
        <Text style={styles.churchCalloutSubtext}>
          Sunday School: 9:15 AM
        </Text>
        <Text style={styles.churchCalloutSubtext}>
          Sunday Service: 10:30 AM
        </Text>
        <View style={styles.churchLocation}>
          <Ionicons
            name="location"
            size={16}
            color={theme.colors.text.tertiary}
            style={styles.locationIcon}
          />
          <Text style={styles.churchCalloutLocation}>
            Rickmansworth Reach Free School
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[24],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    marginTop: theme.spacing[8],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  greeting: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
  },
  userName: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  verseCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  verseLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing[3],
  },
  verseLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
  },
  verseLoadingText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing[3],
  },
  verseText: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing[3],
  },
  verseReference: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  announcement: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
    ...theme.shadows.card,
    overflow: 'hidden',
  },
  announcementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  announcementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  announcementText: {
    flex: 1,
  },
  announcementTitle: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background.white,
    marginBottom: theme.spacing[1],
  },
  announcementDescription: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.background.white,
    opacity: 0.9,
  },
  announcementArrow: {
    fontSize: 24,
    color: theme.colors.background.white,
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  sectionQuirk: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: theme.spacing[3],
  },
  seeAll: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  sermonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  sermonItem: {
    width: '48%',
  },
  eventsScroll: {
    paddingRight: theme.spacing[6],
  },
  churchCallout: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  churchCalloutText: {
    fontFamily: theme.typography.fonts.schoolbell,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.primary,
    marginBottom: theme.spacing[2],
  },
  churchCalloutSubtext: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  churchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  locationIcon: {
    marginRight: theme.spacing[1],
  },
  churchCalloutLocation: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
});
