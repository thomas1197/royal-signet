import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Avatar } from '../../components';
import { theme } from '../../theme';

export const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use route params if available, otherwise use sample data
  const event = {
    id: params.id || '1',
    title: params.title || 'The Upperroom',
    imageUrl: params.imageUrl || 'https://picsum.photos/800/600?random=10',
    date: params.date || 'December 24, 2024',
    time: '6:00 PM - 9:00 PM',
    location: 'Main Sanctuary, Royal Signet Church',
    about:
      'Join us for an evening of worship, prayer, and fellowship as we gather in The Upperroom. Experience the presence of God in a powerful way as we come together as a community of believers. This special service will feature live worship, testimonies, and a powerful message from our lead pastor.',
    attendees: [
      { id: '1', name: 'John Doe', imageUrl: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', name: 'Jane Smith', imageUrl: 'https://i.pravatar.cc/150?img=2' },
      { id: '3', name: 'Mike Johnson', imageUrl: 'https://i.pravatar.cc/150?img=3' },
      { id: '4', name: 'Sarah Lee', imageUrl: 'https://i.pravatar.cc/150?img=4' },
      { id: '5', name: 'Tom Wilson', imageUrl: 'https://i.pravatar.cc/150?img=5' },
    ],
    totalAttendees: 127,
  };

  const handleBookSpot = async () => {
    setLoading(true);
    try {
      // TODO: Implement booking logic with Firebase
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Success!',
          'You are called and chosen! Your spot has been reserved.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to book spot. Please try again.');
      setLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert('Share Event', 'Share functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Image */}
        <ImageBackground source={{ uri: event.imageUrl }} style={styles.heroImage}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']}
            style={styles.gradient}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Text style={styles.actionIcon}>↗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Text style={styles.actionIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>

            {/* Event Title */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{event.title}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          {/* Date & Time */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>📅</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{event.date}</Text>
              <Text style={styles.infoSubvalue}>{event.time}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>📍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{event.about}</Text>
          </View>

          {/* Attendees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who's Going</Text>
            <View style={styles.attendeesContainer}>
              <View style={styles.avatarGroup}>
                {event.attendees.slice(0, 5).map((attendee, index) => (
                  <View
                    key={attendee.id}
                    style={[styles.avatarWrapper, { marginLeft: index === 0 ? 0 : -10 }]}
                  >
                    <Avatar
                      imageUrl={attendee.imageUrl}
                      name={attendee.name}
                      size="small"
                    />
                  </View>
                ))}
                {event.totalAttendees > 5 && (
                  <View style={[styles.avatarWrapper, { marginLeft: -10 }]}>
                    <View style={styles.moreAvatars}>
                      <Text style={styles.moreAvatarsText}>
                        +{event.totalAttendees - 5}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <Text style={styles.attendeesText}>
                {event.totalAttendees} people are going
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <Button
          title="Book your spot now"
          onPress={handleBookSpot}
          loading={loading}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 400,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing[6],
  },
  backButton: {
    width: theme.layout.backButton,
    height: theme.layout.backButton,
    borderRadius: theme.layout.backButton / 2,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[8],
    ...theme.shadows.soft,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: theme.spacing[8] + theme.spacing[6],
    right: theme.spacing[6],
    gap: theme.spacing[2],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
  heroContent: {
    marginBottom: theme.spacing[4],
  },
  heroTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.background.white,
    ...theme.shadows.text,
  },
  detailsContainer: {
    padding: theme.spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[5],
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
    ...theme.shadows.soft,
  },
  infoIconText: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },
  infoValue: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  infoSubvalue: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  aboutText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: theme.spacing[3],
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
    borderRadius: theme.layout.avatar.small / 2,
  },
  moreAvatars: {
    width: theme.layout.avatar.small,
    height: theme.layout.avatar.small,
    borderRadius: theme.layout.avatar.small / 2,
    backgroundColor: theme.colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  attendeesText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.white,
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.navigation,
  },
  bookButton: {
    width: '100%',
  },
});
