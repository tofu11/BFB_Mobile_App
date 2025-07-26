import { Header } from '@/components/Header';
import { MenuIcon } from '@/components/MenuIcon';
import { ProgramsList } from '@/components/ProgramsList';
import { ScreenTitle } from '@/components/ScreenTitle';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function EventsScreen() {
  const handleProgramPress = (programId: string) => {
    if (programId === '1') {
      router.push('/(tabs)/../program1-detail');
    } else if (programId === '2') {
      router.push('/(tabs)/../program2-detail');
    } else if (programId === '3') {
      router.push('/(tabs)/../program3-detail');
    } else if (programId === '4') {
      router.push('/(tabs)/../program4-detail');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.blueBackground} />
      <StatusBarComponent />
      <Header title="Events" />
      <ScreenTitle title="Events" />
      <MenuIcon />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProgramsList onProgramPress={handleProgramPress} />
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
  blueBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 103,
    backgroundColor: '#FFFFFF', // White background
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
});
