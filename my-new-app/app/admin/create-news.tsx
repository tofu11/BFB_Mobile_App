import React, { useState, useEffect } from 'react';
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
import { collection, addDoc, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default function CreateNewsScreen() {
  const [db, setDb] = useState<Firestore | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    console.log('🚀 Initializing Firebase inside component...');
    
    const firebaseConfig = {
      apiKey: "AIzaSyBTHKe9GCiHS6kZKNsNF4N_oMNHD34v4CQ",
      authDomain: "one-world-chair.firebaseapp.com",
      projectId: "one-world-chair",
      storageBucket: "one-world-chair.firebasestorage.app",
      messagingSenderId: "960188613404",
      appId: "1:960188613404:web:81157a366404f92aa970d9",
      measurementId: "G-5PJ74W6MN8"
    };

    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('🆕 New Firebase app created inside component');
    } else {
      app = getApp();
      console.log('♻️ Using existing Firebase app inside component');
    }

    console.log('📱 All Firebase apps:', getApps().length);
    const firestoreDb = getFirestore(app);
    console.log('🔥 Firestore instance created:', firestoreDb);
    console.log('🔥 Firestore type:', typeof firestoreDb);
    
    setDb(firestoreDb);
  }, []);

  useEffect(() => {
    console.log('🔍 Testing Firebase connection...');
    console.log('Firebase db object:', db);
    console.log('Firebase db type:', typeof db);
    
    if (!db) {
      console.error('❌ Firebase db is undefined!');
      return;
    }
    
    console.log('Firebase db app:', db.app);
    
    try {
      const testCollection = collection(db, 'news');
      console.log('✅ Collection reference created:', testCollection);
    } catch (error) {
      console.error('❌ Failed to create collection reference:', error);
    }
  }, [db]);

  const handleSubmit = async () => {
    console.log('=== SUBMIT BUTTON PRESSED ===');
    console.log('Form values:', { title, content, author, priority });
    
    if (!title || !content || !author) {
      console.log('❌ Validation failed - missing required fields');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!db) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    console.log('✅ Validation passed, attempting to save...');

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

      console.log('📝 News item object created:', newsItem);
      console.log('🔥 Firebase db reference:', db);
      console.log('🔥 Database type:', typeof db);
      
      console.log('🚀 Calling addDoc...');
      const docRef = await addDoc(collection(db, 'news'), newsItem);
      console.log('🎉 SUCCESS! Document ID:', docRef.id);
      
      Alert.alert('Success', `News article created! ID: ${docRef.id}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
      // Clear form
      setTitle('');
      setContent('');
      setAuthor('');
      setPriority('medium');
      
    } catch (error: any) {
      console.error('💥 ERROR occurred:');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error stack:', error?.stack);
      Alert.alert('Error', `Failed to create news: ${error?.message || 'Unknown error'}`);
    }
  };

  const testFirebase = async () => {
    if (!db) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    try {
      console.log('🧪 Testing Firebase with simple document...');
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Hello Firebase!',
        timestamp: new Date()
      });
      console.log('✅ Test document created:', testDoc.id);
      Alert.alert('Success', `Test document created: ${testDoc.id}`);
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    }
  };

  const PriorityButton = ({ level, label }: { level: 'high' | 'medium' | 'low', label: string }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === level && styles.priorityButtonActive,
        { borderColor: getPriorityColor(level) }
      ]}
      onPress={() => setPriority(level)}
    >
      <Text style={[
        styles.priorityButtonText,
        priority === level && { color: getPriorityColor(level) }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF8C00';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBarComponent />
      <Header title="Admin" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.pageTitle}>Create News Article</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter news title"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={content}
                onChangeText={setContent}
                placeholder="Enter news content"
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author *</Text>
              <TextInput
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Enter author name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                <PriorityButton level="high" label="High" />
                <PriorityButton level="medium" label="Medium" />
                <PriorityButton level="low" label="Low" />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: 'green', marginBottom: 10 }]}
                onPress={testFirebase}
              >
                <Text style={styles.submitButtonText}>Test Firebase</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Publish News</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 44,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#f8f8f8',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
