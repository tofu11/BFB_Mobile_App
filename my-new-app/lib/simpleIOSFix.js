import { Platform } from 'react-native';

// Simple iOS fix that focuses on Firebase SDK configuration
export class SimpleIOSAuthService {
  static async signInWithEmail(email, password) {
    console.log(`${Platform.OS}: Starting sign in process`);
    
    if (Platform.OS === 'ios') {
      return await this.signInWithRetryIOS(email, password);
    } else {
      return await this.signInWeb(email, password);
    }
  }

  static async signUpWithEmail(email, password) {
    console.log(`${Platform.OS}: Starting sign up process`);
    
    if (Platform.OS === 'ios') {
      return await this.signUpWithRetryIOS(email, password);
    } else {
      return await this.signUpWeb(email, password);
    }
  }

  // iOS-specific sign in with enhanced retry and configuration
  static async signInWithRetryIOS(email, password) {
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`iOS: Sign in attempt ${attempt}/${maxRetries}`);
        
        // Dynamic import to ensure fresh Firebase instance
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('./firebase');
        
        // Add timeout wrapper
        const signInPromise = signInWithEmailAndPassword(auth, email, password);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 25000)
        );
        
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        console.log('iOS: Sign in successful');
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`iOS: Attempt ${attempt} failed:`, error.code || error.message);
        
        // Check if we should retry
        const shouldRetry = (
          error.code === 'auth/network-request-failed' ||
          error.message === 'Request timeout' ||
          error.code === 'auth/timeout' ||
          error.message.includes('Network request failed')
        ) && attempt < maxRetries;
        
        if (shouldRetry) {
          // Progressive delay: 1s, 2s, 4s, 8s
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`iOS: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a retryable error, break immediately
        break;
      }
    }
    
    // All attempts failed
    console.error('iOS: All sign in attempts failed');
    throw this.createUserFriendlyError(lastError);
  }

  // iOS-specific sign up with enhanced retry
  static async signUpWithRetryIOS(email, password) {
    const maxRetries = 5;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`iOS: Sign up attempt ${attempt}/${maxRetries}`);
        
        // Dynamic import to ensure fresh Firebase instance
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('./firebase');
        
        // Add timeout wrapper
        const signUpPromise = createUserWithEmailAndPassword(auth, email, password);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 25000)
        );
        
        const result = await Promise.race([signUpPromise, timeoutPromise]);
        
        console.log('iOS: Sign up successful');
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`iOS: Attempt ${attempt} failed:`, error.code || error.message);
        
        // Check if we should retry
        const shouldRetry = (
          error.code === 'auth/network-request-failed' ||
          error.message === 'Request timeout' ||
          error.code === 'auth/timeout' ||
          error.message.includes('Network request failed')
        ) && attempt < maxRetries;
        
        if (shouldRetry) {
          // Progressive delay: 1s, 2s, 4s, 8s
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`iOS: Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a retryable error, break immediately
        break;
      }
    }
    
    // All attempts failed
    console.error('iOS: All sign up attempts failed');
    throw this.createUserFriendlyError(lastError);
  }

  // Web sign in (standard Firebase)
  static async signInWeb(email, password) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw this.createUserFriendlyError(error);
    }
  }

  // Web sign up (standard Firebase)
  static async signUpWeb(email, password) {
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw this.createUserFriendlyError(error);
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      await signOut(auth);
      console.log(`${Platform.OS}: Sign out successful`);
    } catch (error) {
      console.error(`${Platform.OS}: Sign out error:`, error);
      throw this.createUserFriendlyError(error);
    }
  }

  // Get current user
  static getCurrentUser() {
    try {
      const { auth } = require('./firebase');
      return auth.currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Auth state listener
  static onAuthStateChanged(callback) {
    try {
      const { onAuthStateChanged } = require('firebase/auth');
      const { auth } = require('./firebase');
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Test connection
  static async testConnection() {
    try {
      console.log(`${Platform.OS}: Testing Firebase connection...`);
      const { auth } = await import('./firebase');
      
      // Simple test - check if auth instance exists
      if (auth && auth.app) {
        console.log(`${Platform.OS}: Firebase connection test passed`);
        return true;
      } else {
        console.log(`${Platform.OS}: Firebase connection test failed - no auth instance`);
        return false;
      }
    } catch (error) {
      console.error(`${Platform.OS}: Firebase connection test failed:`, error);
      return false;
    }
  }

  // Create user-friendly error messages
  static createUserFriendlyError(error) {
    let message = 'Authentication failed. Please try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          message = 'Network connection failed. Please check your internet connection and try again.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled.';
          break;
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        default:
          message = error.message || 'Authentication failed. Please try again.';
      }
    } else if (error.message === 'Request timeout') {
      message = 'Request timed out. Please check your connection and try again.';
    } else if (error.message) {
      message = error.message;
    }
    
    const friendlyError = new Error(message);
    friendlyError.code = error.code;
    return friendlyError;
  }
}
