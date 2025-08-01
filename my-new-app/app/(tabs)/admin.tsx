import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { StatusBarComponent } from '@/components/StatusBarComponent';

export default function AdminScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Admin" />
      
      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage your content</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Management</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/admin/create-news')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📰</Text>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>Create News Article</Text>
                  <Text style={styles.buttonSubtitle}>Add new news content</Text>
                </View>
                <Text style={styles.buttonArrow}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/news')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📋</Text>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>View All News</Text>
                  <Text style={styles.buttonSubtitle}>Manage existing articles</Text>
                </View>
                <Text style={styles.buttonArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
    height: 120,
    backgroundColor: '#FFB703',
  },
  whiteBackground: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    marginTop: 120,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonArrow: {
    fontSize: 20,
    color: '#FFB703',
    fontWeight: 'bold',
  },
});