import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebase';

// iOS-specific network timeout configuration
const IOS_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class AuthService {
  // Helper function to create a timeout promise
  static createTimeoutPromise(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  // Helper function to wait for a delay
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced sign in with retry logic
  static async signInWithEmail(email, password) {
    console.log('Starting sign in process...');
    
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Sign in attempt ${attempt}/${MAX_RETRIES}`);
        
        // Create the sign-in promise with timeout
        const signInPromise = signInWithEmailAndPassword(auth, email, password);
        const finalPromise = this.createTimeoutPromise(signInPromise, IOS_TIMEOUT);
        
        const userCredential = await finalPromise;
        console.log('Sign in successful');
        return userCredential.user;
        
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.code, error.message);
        
        // Check if we should retry
        const shouldRetry = (
          error.code === 'auth/network-request-failed' ||
          error.message === 'Request timeout' ||
          error.code === 'auth/timeout'
        ) && attempt < MAX_RETRIES;
        
        if (shouldRetry) {
          const delayTime = RETRY_DELAY * attempt;
          console.log(`Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
          continue;
        }
        
        // If it's not a retryable error, break the loop
        break;
      }
    }
    
    // Handle the final error
    console.error('All sign in attempts failed:', lastError);
    
    if (lastError.code === 'auth/network-request-failed' || lastError.message === 'Request timeout') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (lastError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (lastError.code === 'auth/wrong-password') {
      throw new Error('Incorrect password.');
    } else if (lastError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (lastError.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled.');
    } else if (lastError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    throw new Error(lastError.message || 'Sign in failed');
  }

  // Enhanced sign up with retry logic
  static async signUpWithEmail(email, password) {
    console.log('Starting sign up process...');
    
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Sign up attempt ${attempt}/${MAX_RETRIES}`);
        
        // Create the sign-up promise with timeout
        const signUpPromise = createUserWithEmailAndPassword(auth, email, password);
        const finalPromise = this.createTimeoutPromise(signUpPromise, IOS_TIMEOUT);
        
        const userCredential = await finalPromise;
        console.log('Sign up successful');
        return userCredential.user;
        
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.code, error.message);
        
        // Check if we should retry
        const shouldRetry = (
          error.code === 'auth/network-request-failed' ||
          error.message === 'Request timeout' ||
          error.code === 'auth/timeout'
        ) && attempt < MAX_RETRIES;
        
        if (shouldRetry) {
          const delayTime = RETRY_DELAY * attempt;
          console.log(`Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
          continue;
        }
        
        // If it's not a retryable error, break the loop
        break;
      }
    }
    
    // Handle the final error
    console.error('All sign up attempts failed:', lastError);
    
    if (lastError.code === 'auth/network-request-failed' || lastError.message === 'Request timeout') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (lastError.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists.');
    } else if (lastError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (lastError.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    }
    
    throw new Error(lastError.message || 'Sign up failed');
  }

  // Sign out with error handling
  static async signOut() {
    try {
      await firebaseSignOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Sign out failed');
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Check if user is signed in
  static isSignedIn() {
    return !!auth.currentUser;
  }

  // Test Firebase connection
  static async testConnection() {
    try {
      console.log('Testing Firebase connection...');
      const user = auth.currentUser;
      console.log('Firebase connection test passed, current user:', user?.email || 'none');
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}