import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Avatar } from '../../components';
import { theme } from '../../theme';

type UpdateCategory = 'announcement' | 'event' | 'news' | 'testimony';

interface UpdateDetailParams {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  category: UpdateCategory;
}

export const UpdateDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const update = route.params as UpdateDetailParams;

  const getCategoryColor = (category: UpdateCategory) => {
    switch (category) {
      case 'announcement':
        return theme.colors.primary;
      case 'event':
        return '#4BB543';
      case 'news':
        return '#2196F3';
      case 'testimony':
        return '#FFA500';
      default:
        return theme.colors.gray[400];
    }
  };

  const getCategoryLabel = (category: UpdateCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
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
        <Text style={styles.headerTitle}>Update</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Badge */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(update.category) },
          ]}
        >
          <Text style={styles.categoryText}>
            {getCategoryLabel(update.category)}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{update.title}</Text>

        {/* Author Info */}
        <View style={styles.authorSection}>
          <Avatar
            imageUrl={update.authorAvatar}
            name={update.author}
            size="medium"
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{update.author}</Text>
            <Text style={styles.timestamp}>{update.timestamp}</Text>
          </View>
        </View>

        {/* Image (if exists) */}
        {update.imageUrl && (
          <Image
            source={{ uri: update.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <Text style={styles.content}>{update.content}</Text>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[4],
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
    marginBottom: theme.spacing[5],
    lineHeight: 36,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  authorInfo: {
    marginLeft: theme.spacing[3],
  },
  authorName: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  timestamp: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
  },
  content: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
});
