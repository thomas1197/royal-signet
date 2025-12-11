import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

interface LogoProps {
  variant?: 'red' | 'black';
  width?: number;
  height?: number;
  style?: ImageStyle;
}

const logoSources = {
  red: require('../../../assets/logo-red.png'),
  black: require('../../../assets/logo-black.png'),
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'red',
  width = 150,
  height,
  style,
}) => {
  // Maintain aspect ratio (the logos are square, so height = width by default)
  const imageHeight = height || width;

  return (
    <Image
      source={logoSources[variant]}
      style={[
        styles.logo,
        {
          width,
          height: imageHeight,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Base styles if needed
  },
});
