import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBTHKe9GCiHS6kZKNsNF4N_oMNHD34v4CQ",
  authDomain: "one-world-chair.firebaseapp.com",
  projectId: "one-world-chair",
  storageBucket: "one-world-chair.firebasestorage.app",
  messagingSenderId: "960188613404",
  appId: "1:960188613404:web:81157a366404f92aa970d9",
  measurementId: "G-5PJ74W6MN8"
};

// Test Firebase configuration
console.log('Testing Firebase configuration...');
console.log('API Key present:', !!firebaseConfig.apiKey);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);
 
// Log configuration for debugging
console.log('Firebase Config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase - prevent multiple instances
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized for platform:', Platform.OS);
} else {
  app = getApps()[0];
  console.log('Using existing Firebase app');
}

// Initialize Auth with proper persistence
let auth;
try {
  if (Platform.OS === 'web') {
    // For web platforms, use getAuth
    auth = getAuth(app);
    console.log('Web: getAuth successful');
  } else {
    // For React Native (iOS/Android), use initializeAuth with AsyncStorage persistence
    console.log('Initializing Firebase Auth for React Native with AsyncStorage...');

    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('React Native: initializeAuth with AsyncStorage successful');
    } catch (initError) {
      // If initializeAuth fails (e.g., already initialized), use getAuth
      console.log('initializeAuth failed, using getAuth:', initError.message);
      auth = getAuth(app);
    }
  }
} catch (error) {
  console.error('Auth initialization failed:', error);
  // Final fallback
  auth = getAuth(app);
}

export const db = getFirestore(app);

export { auth };
  