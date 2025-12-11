import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface SermonCardProps {
  id: string;
  title: string;
  speaker: string;
  imageUrl: string;
  category?: string;
  onPress: () => void;
}

export const SermonCard: React.FC<SermonCardProps> = ({
  title,
  speaker,
  imageUrl,
  category,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.speaker}>{speaker}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: theme.layout.sermonCard.width,
    height: theme.layout.sermonCard.height,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing[2],
    ...theme.shadows.card,
    backgroundColor: theme.colors.background.white,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: theme.borderRadius.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing[2],
  },
  categoryText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.background.white,
    fontWeight: theme.typography.weights.bold,
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.background.white,
    textAlign: 'center',
    marginBottom: theme.spacing[1],
    ...theme.shadows.text,
  },
  speaker: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.background.white,
    textAlign: 'center',
  },
});
