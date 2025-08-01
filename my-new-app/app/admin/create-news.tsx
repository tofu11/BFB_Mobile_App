import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { Header } from '@/components/Header';
import { router } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateNewsScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = async () => {
    if (!title || !content || !author) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newsItem = {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        priority,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        published: true
      };

      const docRef = await addDoc(collection(db, 'news'), newsItem);
      Alert.alert('Success', `News article created! ID: ${docRef.id}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
      setTitle('');
      setContent('');
      setAuthor('');
      setPriority('medium');
      
    } catch (error: any) {
      Alert.alert('Error', `Failed to create news: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="Create News" />
      
      <ScrollView style={styles.content}>
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

          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Enter author name"
            multiline={false}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Article</Text>
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
    marginTop: 120,
  },
  backButton: {
    padding: 15,
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
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});