import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  onPress: () => void;
  variant?: 'small' | 'large';
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  imageUrl,
  onPress,
  variant = 'small',
}) => {
  const isSmall = variant === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSmall ? styles.smallContainer : styles.largeContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.77)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.card,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  smallContainer: {
    width: theme.layout.eventCard.width,
    height: theme.layout.eventCard.height,
    marginRight: theme.spacing[2],
  },
  largeContainer: {
    width: theme.layout.contentWidth,
    height: 200,
    marginBottom: theme.spacing[4],
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: theme.borderRadius.card,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: theme.spacing[3],
  },
  date: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.background.white,
    marginBottom: theme.spacing[1],
  },
  title: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.background.white,
    ...theme.shadows.text,
  },
});
