import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { Header } from '@/components/Header';
import { ScreenTitle } from '@/components/ScreenTitle';
import { MenuIcon } from '@/components/MenuIcon';
import { router } from 'expo-router';


export default function AdminScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Admin" />
      <ScreenTitle title="Admin Panel" />
      <MenuIcon />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            Admin tools and management options
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.adminCard}
            onPress={() => router.push('/admin/create-news')}
          >
            <Text style={styles.cardTitle}>Create News Article</Text>
            <Text style={styles.cardDescription}>
              Publish news and announcements for users
            </Text>
          </TouchableOpacity>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,

    backgroundColor: '#FFB703',
  },
  whiteBackground: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: 180,
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  adminCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },

});