import { Header } from '@/components/Header';
import { MenuIcon } from '@/components/MenuIcon';
import { ScreenTitle } from '@/components/ScreenTitle';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Settings" />
      <ScreenTitle title="Settings" />
      <MenuIcon />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText>App settings and preferences will go here.</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    width: '100%',
    height: 103,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#88C8E4',
  },
  whiteBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 103,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    padding: 20,
  },
});
