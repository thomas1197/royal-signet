import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from '../../components';
import { theme } from '../../theme';

interface SermonDetailParams {
  id: string;
  title: string;
  speaker: string;
  imageUrl: string;
  category?: string;
}

export const SermonDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const sermon = route.params as SermonDetailParams;
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    // TODO: Implement video/audio playback
    setIsPlaying(!isPlaying);
    Alert.alert(
      isPlaying ? 'Paused' : 'Playing',
      `${isPlaying ? 'Paused' : 'Now playing'}: ${sermon.title}`
    );
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    Alert.alert('Download', 'Sermon download will be available soon');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share sermon with friends');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sermon</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sermon Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: sermon.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {sermon.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{sermon.category}</Text>
            </View>
          )}
        </View>

        {/* Sermon Info */}
        <Text style={styles.title}>{sermon.title}</Text>
        <Text style={styles.speaker}>by {sermon.speaker}</Text>

        {/* Play Controls */}
        <View style={styles.controlsContainer}>
          <Button
            title={isPlaying ? 'Pause Sermon' : 'Play Sermon'}
            onPress={handlePlayPause}
            variant="primary"
          />
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <Text style={styles.downloadIcon}>↓</Text>
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About this Sermon</Text>
          <Text style={styles.description}>
            Join {sermon.speaker} as they share powerful insights from God's
            Word. This message will encourage, challenge, and inspire you to
            grow deeper in your faith journey.
          </Text>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>45 min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>December 15, 2024</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Series</Text>
            <Text style={styles.infoValue}>Faith & Life</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing[10],
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    marginBottom: theme.spacing[6],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing[4],
    left: theme.spacing[6],
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
  },
  categoryText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background.white,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[2],
    lineHeight: 36,
  },
  speaker: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.tertiary,
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  controlsContainer: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    marginTop: theme.spacing[3],
  },
  downloadIcon: {
    fontSize: 20,
    color: theme.colors.primary,
    marginRight: theme.spacing[2],
  },
  downloadText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
  },
  descriptionSection: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  description: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: theme.colors.background.white,
    marginHorizontal: theme.spacing[6],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    ...theme.shadows.soft,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  infoLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
  },
  infoValue: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
});
