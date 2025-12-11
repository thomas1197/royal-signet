import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar, ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

type UpdateCategory = 'announcement' | 'event' | 'news' | 'testimony';

interface Update {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  category: UpdateCategory;
}

export const UpdatesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Sample updates data - will be replaced with Firebase data
  const updates: Update[] = [
    {
      id: '1',
      title: 'Christmas Service Schedule',
      content:
        'Join us for our special Christmas services! We have multiple services planned throughout the week to celebrate the birth of our Savior. December 24th at 6PM - Christmas Eve Service. December 25th at 10AM - Christmas Morning Celebration.',
      imageUrl: 'https://picsum.photos/800/400?random=20',
      author: 'Pastor John',
      authorAvatar: 'https://i.pravatar.cc/150?img=10',
      timestamp: '2 hours ago',
      category: 'announcement',
    },
    {
      id: '2',
      title: 'Youth Group Mission Trip',
      content:
        "Our youth group is preparing for an amazing mission trip this summer! We'll be serving communities in need and sharing God's love. Registration is now open for students grades 6-12.",
      imageUrl: 'https://picsum.photos/800/400?random=21',
      author: 'Sarah Miller',
      authorAvatar: 'https://i.pravatar.cc/150?img=11',
      timestamp: '1 day ago',
      category: 'event',
    },
    {
      id: '3',
      title: 'New Bible Study Starting',
      content:
        "Starting next Wednesday, we're launching a new Bible study on the Book of Romans. All are welcome to join us as we dive deep into Paul's letter and discover the power of the Gospel.",
      author: 'Elder Mike',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      timestamp: '2 days ago',
      category: 'news',
    },
    {
      id: '4',
      title: "Testimony: God's Faithfulness",
      content:
        "I want to share how God has been faithful in my life this past year. Despite facing challenges, His grace has sustained me. If you're going through a difficult time, remember that God is with you.",
      author: 'Emma Johnson',
      authorAvatar: 'https://i.pravatar.cc/150?img=13',
      timestamp: '3 days ago',
      category: 'testimony',
    },
    {
      id: '5',
      title: 'Community Outreach Success',
      content:
        'Thank you to everyone who participated in our community outreach last weekend! We served over 200 families and shared the love of Christ in practical ways. Your generosity makes a difference!',
      imageUrl: 'https://picsum.photos/800/400?random=22',
      author: 'Pastor David',
      authorAvatar: 'https://i.pravatar.cc/150?img=14',
      timestamp: '5 days ago',
      category: 'news',
    },
  ];

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

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch fresh data from Firebase
    setTimeout(() => setRefreshing(false), 1000);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title="Updates"
        subtitle="Good news from the Kingdom"
        showLogo={true}
        theme={theme}
      />

      {/* Updates Feed */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.updatesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {updates.map((update) => (
          <TouchableOpacity
            key={update.id}
            style={styles.updateCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('UpdateDetail', update)}
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

            {/* Author Info */}
            <View style={styles.updateHeader}>
              <Avatar
                imageUrl={update.authorAvatar}
                name={update.author}
                size="small"
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{update.author}</Text>
                <Text style={styles.timestamp}>{update.timestamp}</Text>
              </View>
            </View>

            {/* Update Content */}
            <Text style={styles.updateTitle}>{update.title}</Text>
            <Text style={styles.updateContent} numberOfLines={3}>
              {update.content}
            </Text>

            {/* Image (if exists) */}
            {update.imageUrl && (
              <Image
                source={{ uri: update.imageUrl }}
                style={styles.updateImage}
                resizeMode="cover"
              />
            )}

            {/* Read More */}
            <TouchableOpacity
              style={styles.readMore}
              onPress={() => navigation.navigate('UpdateDetail', update)}
            >
              <Text style={styles.readMoreText}>Read more →</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  updatesContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[24],
  },
  updateCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[5],
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing[3],
  },
  categoryText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background.white,
    textTransform: 'uppercase',
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  authorInfo: {
    marginLeft: theme.spacing[2],
    flex: 1,
  },
  authorName: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  timestamp: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  updateTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  updateContent: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: theme.spacing[3],
  },
  updateImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[3],
  },
  readMore: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },
});
