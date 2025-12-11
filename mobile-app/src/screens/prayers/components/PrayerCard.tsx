import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../components';
import { theme } from '../../../theme';
import { PrayerRequestDisplay } from '../../../types/prayer';

interface PrayerCardProps {
  prayer: PrayerRequestDisplay;
  isOwner: boolean;
  onPray: (prayerId: string) => void;
  onEdit?: (prayerId: string) => void;
  onMarkAnswered?: (prayerId: string) => void;
  onDelete?: (prayerId: string) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  isOwner,
  onPray,
  onEdit,
  onMarkAnswered,
  onDelete,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const closeSwipeable = () => {
    swipeableRef.current?.close();
  };

  const handleEdit = () => {
    closeSwipeable();
    onEdit?.(prayer.id);
  };

  const handleMarkAnswered = () => {
    closeSwipeable();
    onMarkAnswered?.(prayer.id);
  };

  const handleDelete = () => {
    closeSwipeable();
    onDelete?.(prayer.id);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!isOwner) return null;

    return (
      <View style={styles.actionsContainer}>
        {/* Edit Action */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {/* Mark as Answered Action */}
        <TouchableOpacity
          style={[styles.actionButton, styles.answeredButton]}
          onPress={handleMarkAnswered}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Answered</Text>
        </TouchableOpacity>

        {/* Delete Action */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={isOwner ? renderRightActions : undefined}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Avatar
            imageUrl={prayer.userAvatar}
            name={prayer.userName}
            size="medium"
          />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{prayer.userName}</Text>
              {prayer.isEdited && (
                <Text style={styles.editedBadge}>• edited</Text>
              )}
            </View>
            <Text style={styles.timestamp}>{prayer.timeAgo}</Text>
          </View>
        </View>

        <Text style={styles.request}>{prayer.request}</Text>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.prayButton,
              prayer.hasPrayed && styles.prayButtonActive,
            ]}
            onPress={() => onPray(prayer.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.prayIcon,
                prayer.hasPrayed && styles.prayIconActive,
              ]}
            >
              🙏
            </Text>
            <Text
              style={[
                styles.prayText,
                prayer.hasPrayed && styles.prayTextActive,
              ]}
            >
              {prayer.hasPrayed ? 'Praying' : 'Pray'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.prayerCount}>
            {prayer.prayerCount} {prayer.prayerCount === 1 ? 'person' : 'people'} praying
          </Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[4],
  },
  userInfo: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  userName: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  editedBadge: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  timestamp: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  request: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing[4],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background.white,
  },
  prayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  prayIcon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
  },
  prayIconActive: {
    // Icon stays same
  },
  prayText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  prayTextActive: {
    color: theme.colors.background.white,
  },
  prayerCount: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing[2],
  },
  editButton: {
    backgroundColor: '#3B82F6', // Blue
  },
  answeredButton: {
    backgroundColor: '#10B981', // Green
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Red
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing[1],
  },
  actionText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.background.white,
  },
});
