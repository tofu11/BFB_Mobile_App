import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export const StatusBarComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
});