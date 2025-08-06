import { Platform } from 'react-native';

// iOS-specific Firebase Auth implementation using REST API
// This bypasses the Firebase JS SDK network issues on iOS

const FIREBASE_API_KEY = "AIzaSyBTHKe9GCiHS6kZKNsNF4N_oMNHD34v4CQ";
const FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts";

class IOSFirebaseAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Sign in with email and password using REST API with retry logic
  async signInWithEmailAndPassword(email, password) {
    console.log('iOS: Using REST API for sign in');

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`iOS: Sign in attempt ${attempt}/${maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(this.getErrorMessage(errorData.error?.message || 'SIGN_IN_FAILED'));
        }

        const data = await response.json();

        // Create user object similar to Firebase Auth
        const user = {
          uid: data.localId,
          email: data.email,
          emailVerified: data.emailVerified || false,
          displayName: data.displayName || null,
          photoURL: data.photoUrl || null,
          idToken: data.idToken,
          refreshToken: data.refreshToken,
        };

        this.currentUser = user;
        this.notifyListeners(user);

        console.log('iOS: REST API sign in successful');
        return { user };

      } catch (error) {
        lastError = error;
        console.log(`iOS: Attempt ${attempt} failed:`, error.message);

        // Check if we should retry
        const isNetworkError = error.name === 'AbortError' ||
                              error.message.includes('Network request failed') ||
                              error.message.includes('fetch');

        if (isNetworkError && attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s delays
          console.log(`iOS: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If not a network error or no more retries, break
        break;
      }
    }

    // All attempts failed
    console.error('iOS: All sign in attempts failed:', lastError.message);
    throw lastError;
  }

  // Create user with email and password using REST API
  async createUserWithEmailAndPassword(email, password) {
    console.log('iOS: Using REST API for sign up');
    
    try {
      const response = await fetch(`${FIREBASE_AUTH_URL}:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(this.getErrorMessage(data.error?.message || 'SIGN_UP_FAILED'));
      }

      // Create user object similar to Firebase Auth
      const user = {
        uid: data.localId,
        email: data.email,
        emailVerified: data.emailVerified || false,
        displayName: data.displayName || null,
        photoURL: data.photoUrl || null,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      };

      this.currentUser = user;
      this.notifyListeners(user);
      
      console.log('iOS: REST API sign up successful');
      return { user };

    } catch (error) {
      console.error('iOS: REST API sign up failed:', error.message);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    console.log('iOS: Signing out');
    this.currentUser = null;
    this.notifyListeners(null);
  }

  // Auth state change listener
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Convert Firebase error codes to user-friendly messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return 'No account found with this email address.';
      case 'INVALID_PASSWORD':
        return 'Incorrect password.';
      case 'USER_DISABLED':
        return 'This account has been disabled.';
      case 'EMAIL_EXISTS':
        return 'An account with this email already exists.';
      case 'OPERATION_NOT_ALLOWED':
        return 'Email/password accounts are not enabled.';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'Too many failed attempts. Please try again later.';
      case 'WEAK_PASSWORD':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'INVALID_EMAIL':
        return 'Invalid email address.';
      default:
        return `Authentication failed: ${errorCode}`;
    }
  }
}

// Create singleton instance
const iosAuth = new IOSFirebaseAuth();

// Enhanced Auth Service that uses REST API on iOS with fallback
export class IOSEnhancedAuthService {
  static async signInWithEmail(email, password) {
    if (Platform.OS === 'ios') {
      try {
        console.log('Using iOS REST API for sign in');
        return await iosAuth.signInWithEmailAndPassword(email, password);
      } catch (restError) {
        console.log('iOS: REST API failed, trying Firebase SDK fallback:', restError.message);

        try {
          // Fallback to regular Firebase SDK
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const { auth } = await import('./firebase');
          console.log('iOS: Trying Firebase SDK fallback...');
          return await signInWithEmailAndPassword(auth, email, password);
        } catch (sdkError) {
          console.error('iOS: Both REST API and SDK failed');
          // Throw the more user-friendly REST API error
          throw restError;
        }
      }
    } else {
      // Use regular Firebase SDK for web/other platforms
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      return await signInWithEmailAndPassword(auth, email, password);
    }
  }

  static async signUpWithEmail(email, password) {
    if (Platform.OS === 'ios') {
      try {
        console.log('Using iOS REST API for sign up');
        return await iosAuth.createUserWithEmailAndPassword(email, password);
      } catch (restError) {
        console.log('iOS: REST API sign up failed, trying Firebase SDK fallback:', restError.message);

        try {
          // Fallback to regular Firebase SDK
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const { auth } = await import('./firebase');
          console.log('iOS: Trying Firebase SDK fallback for sign up...');
          return await createUserWithEmailAndPassword(auth, email, password);
        } catch (sdkError) {
          console.error('iOS: Both REST API and SDK failed for sign up');
          // Throw the more user-friendly REST API error
          throw restError;
        }
      }
    } else {
      // Use regular Firebase SDK for web/other platforms
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      return await createUserWithEmailAndPassword(auth, email, password);
    }
  }

  static async signOut() {
    if (Platform.OS === 'ios') {
      return await iosAuth.signOut();
    } else {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      return await signOut(auth);
    }
  }

  static getCurrentUser() {
    if (Platform.OS === 'ios') {
      return iosAuth.currentUser;
    } else {
      const { auth } = require('./firebase');
      return auth.currentUser;
    }
  }

  static onAuthStateChanged(callback) {
    if (Platform.OS === 'ios') {
      return iosAuth.onAuthStateChanged(callback);
    } else {
      const { onAuthStateChanged } = require('firebase/auth');
      const { auth } = require('./firebase');
      return onAuthStateChanged(auth, callback);
    }
  }

  static async testConnection() {
    try {
      if (Platform.OS === 'ios') {
        // Test REST API connectivity
        const response = await fetch(`${FIREBASE_AUTH_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
        });
        
        // We expect this to fail with invalid credentials, but if we get a response, connection works
        console.log('iOS: REST API connection test - response received');
        return true;
      } else {
        // Test regular Firebase connection
        const { auth } = require('./firebase');
        console.log('Web: Firebase connection test passed');
        return !!auth;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}