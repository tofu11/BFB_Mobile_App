import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { StatusBarComponent } from '@/components/StatusBarComponent';

export default function CreateNewsScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting form submission...');

    try {
      const newsData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        createdAt: new Date(),
        published: true
      };

      console.log('📝 Creating document with data:', newsData);

      const docRef = await addDoc(collection(db, 'news'), newsData);
      
      console.log('✅ Document created successfully:', docRef.id);
      
      Alert.alert('Success', 'News article created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

      // Clear form
      setTitle('');
      setContent('');
      setImageUrl('');

    } catch (error) {
      console.error('❌ Error creating document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to create news article: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Create News" />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create News Article</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter news title"
            multiline={false}
          />

          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Enter news content"
            multiline={true}
            numberOfLines={6}
          />

          <Text style={styles.label}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            multiline={false}
          />

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Article'}
            </Text>
          </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingTop: 0,
  },
  backButton: {
    padding: 15,
    marginTop: 0,
  },
  backText: {
    color: '#FFB703',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FFB703',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
