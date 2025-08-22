import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './firebase';

/**
 * Robust Authentication Service with comprehensive error handling
 * and network retry logic for React Native and Web platforms
 */
export class RobustAuthService {
  static MAX_RETRIES = 3;
  static RETRY_DELAYS = [1000, 2000, 4000]; // Progressive delays
  static TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Create a promise that times out after specified milliseconds
   */
  static createTimeoutPromise(promise, timeoutMs = this.TIMEOUT_MS) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * Wait for specified milliseconds
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test Firebase connection with comprehensive network testing
   */
  static async testConnection() {
    try {
      console.log(`${Platform.OS}: Testing Firebase connection...`);

      // First check if auth instance is available
      if (!auth) {
        console.log(`${Platform.OS}: Firebase auth instance not available`);
        return false;
      }

      console.log(`${Platform.OS}: Firebase auth instance available`);

      // Run network connectivity test
      const networkStatus = await NetworkTest.getNetworkStatus();
      console.log(`${Platform.OS}: Network status:`, networkStatus.status);
      console.log(`${Platform.OS}: Network message:`, networkStatus.message);

      if (networkStatus.status === 'All Good' || networkStatus.status === 'Auth Issues') {
        console.log(`${Platform.OS}: Firebase connection test passed`);
        return true;
      } else {
        console.log(`${Platform.OS}: Firebase connection test failed due to network issues`);
        return false;
      }
    } catch (error) {
      console.error(`${Platform.OS}: Firebase connection test failed:`, error);
      return false;
    }
  }

  /**
   * Sign in with email and password with retry logic
   */
  static async signInWithEmail(email, password) {
    console.log(`${Platform.OS}: Starting sign in process`);
    
    let lastError;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`${Platform.OS}: Sign in attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        
        // Create sign-in promise with timeout
        const signInPromise = signInWithEmailAndPassword(auth, email, password);
        const result = await this.createTimeoutPromise(signInPromise);
        
        console.log(`${Platform.OS}: Sign in successful`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`${Platform.OS}: Attempt ${attempt + 1} failed:`, error.code || error.message);
        
        // Check if we should retry
        const shouldRetry = this.shouldRetryError(error) && attempt < this.MAX_RETRIES - 1;
        
        if (shouldRetry) {
          const delayTime = this.RETRY_DELAYS[attempt] || 4000;
          console.log(`${Platform.OS}: Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
          continue;
        }
        
        // If it's not a retryable error or we've exhausted retries, break
        break;
      }
    }
    
    // Handle the final error
    console.error(`${Platform.OS}: All sign in attempts failed`);
    throw this.createUserFriendlyError(lastError);
  }

  /**
   * Sign up with email and password with retry logic
   */
  static async signUpWithEmail(email, password) {
    console.log(`${Platform.OS}: Starting sign up process`);
    
    let lastError;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`${Platform.OS}: Sign up attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        
        // Create sign-up promise with timeout
        const signUpPromise = createUserWithEmailAndPassword(auth, email, password);
        const result = await this.createTimeoutPromise(signUpPromise);
        
        console.log(`${Platform.OS}: Sign up successful`);
        return result;
        
      } catch (error) {
        lastError = error;
        console.log(`${Platform.OS}: Attempt ${attempt + 1} failed:`, error.code || error.message);
        
        // Check if we should retry
        const shouldRetry = this.shouldRetryError(error) && attempt < this.MAX_RETRIES - 1;
        
        if (shouldRetry) {
          const delayTime = this.RETRY_DELAYS[attempt] || 4000;
          console.log(`${Platform.OS}: Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
          continue;
        }
        
        // If it's not a retryable error or we've exhausted retries, break
        break;
      }
    }
    
    // Handle the final error
    console.error(`${Platform.OS}: All sign up attempts failed`);
    throw this.createUserFriendlyError(lastError);
  }

  /**
   * Sign out user
   */
  static async signOut() {
    try {
      await signOut(auth);
      console.log(`${Platform.OS}: Sign out successful`);
    } catch (error) {
      console.error(`${Platform.OS}: Sign out error:`, error);
      throw this.createUserFriendlyError(error);
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Check if user is signed in
   */
  static isSignedIn() {
    return !!auth.currentUser;
  }

  /**
   * Determine if an error should trigger a retry
   */
  static shouldRetryError(error) {
    const retryableErrors = [
      'auth/network-request-failed',
      'auth/timeout',
      'Request timeout'
    ];
    
    return retryableErrors.some(retryableError => 
      error.code === retryableError || error.message === retryableError
    );
  }

  /**
   * Create user-friendly error messages
   */
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
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
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
