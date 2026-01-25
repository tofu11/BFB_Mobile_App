import { getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
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

// Initialize Auth with platform-specific handling
let auth;
try {
  if (Platform.OS === 'ios') {
    // For iOS, try a different approach
    console.log('Initializing Firebase Auth for iOS...');

    // Try to use initializeAuth first
    try {
      auth = initializeAuth(app, {
        // Add iOS-specific configuration if needed
      });
      console.log('iOS: initializeAuth successful');
    } catch (initError) {
      console.log('iOS: initializeAuth failed, trying getAuth:', initError.message);
      auth = getAuth(app);
    }
  } else {
    // For web and other platforms
    auth = getAuth(app);
    console.log('Non-iOS: getAuth successful');
  }
} catch (error) {
  console.error('Auth initialization failed:', error);
  // Final fallback
  auth = getAuth(app);
}

export const db = getFirestore(app);

export { auth };
  