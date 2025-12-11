import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SermonCard, FilterPill, ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

export const SermonsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Hope', 'Bible', 'Life', 'Faith'];

  // Sample sermon data - will be replaced with Firebase data
  const sermons = [
    {
      id: '1',
      title: 'Walking in Faith',
      speaker: 'Pastor John Doe',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      category: 'Faith',
    },
    {
      id: '2',
      title: 'Love One Another',
      speaker: 'Pastor Sarah Smith',
      imageUrl: 'https://picsum.photos/400/300?random=2',
      category: 'Life',
    },
    {
      id: '3',
      title: 'Finding Strength in Him',
      speaker: 'Pastor Mike Johnson',
      imageUrl: 'https://picsum.photos/400/300?random=3',
      category: 'Hope',
    },
    {
      id: '4',
      title: 'The Light of The World',
      speaker: 'Pastor David Lee',
      imageUrl: 'https://picsum.photos/400/300?random=4',
      category: 'Bible',
    },
    {
      id: '5',
      title: 'Grace and Mercy',
      speaker: 'Pastor Emma Wilson',
      imageUrl: 'https://picsum.photos/400/300?random=5',
      category: 'Hope',
    },
    {
      id: '6',
      title: 'Living in Purpose',
      speaker: 'Pastor James Brown',
      imageUrl: 'https://picsum.photos/400/300?random=6',
      category: 'Life',
    },
  ];

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = sermon.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' || sermon.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header, Search, and Filters - Sticky */}
        <View style={styles.stickyHeader}>
          {/* Header */}
          <ScreenHeader
            title="Sermons"
            subtitle="Man shall not live by bread alone"
            showLogo={true}
            theme={theme}
          />

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.text.tertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Seek and you shall find"
              placeholderTextColor={theme.colors.text.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {categories.map((category) => (
              <FilterPill
                key={category}
                label={category}
                isActive={activeFilter === category}
                onPress={() => setActiveFilter(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Sermons Grid */}
        {filteredSermons.length > 0 ? (
          <View style={styles.sermonsGrid}>
            {filteredSermons.map((sermon, index) => (
              <View
                key={sermon.id}
                style={[
                  styles.sermonItem,
                  index % 2 === 0 ? styles.sermonLeft : styles.sermonRight,
                ]}
              >
                <SermonCard
                  {...sermon}
                  onPress={() => navigation.navigate('SermonDetail', sermon)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.colors.text.tertiary}
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateText}>No sermons found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  searchIcon: {
    marginRight: theme.spacing[3],
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  stickyHeader: {
    backgroundColor: theme.colors.background.primary,
    paddingBottom: theme.spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing[12],
  },
  sermonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
  },
  sermonItem: {
    marginBottom: theme.spacing[2],
  },
  sermonLeft: {
    width: '48.5%',
  },
  sermonRight: {
    width: '48.5%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[8],
  },
  emptyStateIcon: {
    marginBottom: theme.spacing[4],
  },
  emptyStateText: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptyStateSubtext: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
  },
});
