import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ScreenTitleProps {
  title: string;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.titleText}>{title}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
