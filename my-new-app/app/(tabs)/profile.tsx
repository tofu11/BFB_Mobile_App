import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { Header } from '@/components/Header';
import { ScreenTitle } from '@/components/ScreenTitle';
import { MenuIcon } from '@/components/MenuIcon';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Profile" />
      <ScreenTitle title="Profile" />
      <MenuIcon />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText>Your profile information will go here.</ThemedText>
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
