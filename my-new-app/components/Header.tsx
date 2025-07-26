import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { BridgesText } from './BridgesText';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/bcb87ae6fcefa53ae362bfbc02af0c5b6d79638d?width=110' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <BridgesText />
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 103,
  },
  logoContainer: {
    width: 55,
    height: 63,
    position: 'absolute',
    left: 4,
    top: 0,
  },
  logo: {
    width: 55,
    height: 63,
  },
  titleContainer: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
