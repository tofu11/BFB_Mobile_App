import { Platform } from 'react-native';

/**
 * Network connectivity and Firebase reachability test utility
 */
export class NetworkTest {
  
  /**
   * Test basic internet connectivity
   */
  static async testInternetConnectivity() {
    try {
      console.log(`${Platform.OS}: Testing internet connectivity...`);
      
      // Test with a reliable endpoint
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 10000
      });
      
      const isConnected = response.ok;
      console.log(`${Platform.OS}: Internet connectivity test result:`, isConnected);
      return isConnected;
    } catch (error) {
      console.error(`${Platform.OS}: Internet connectivity test failed:`, error);
      return false;
    }
  }

  /**
   * Test Firebase Auth endpoint connectivity
   */
  static async testFirebaseAuthConnectivity() {
    try {
      console.log(`${Platform.OS}: Testing Firebase Auth connectivity...`);
      
      // Test Firebase Auth endpoint
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // This will fail but should reach the server
          idToken: 'test'
        }),
        timeout: 15000
      });
      
      // Even if the request fails due to invalid token, 
      // a response means we can reach Firebase
      const canReachFirebase = response.status !== undefined;
      console.log(`${Platform.OS}: Firebase Auth connectivity test result:`, canReachFirebase);
      return canReachFirebase;
    } catch (error) {
      console.error(`${Platform.OS}: Firebase Auth connectivity test failed:`, error);
      return false;
    }
  }

  /**
   * Test Firestore connectivity
   */
  static async testFirestoreConnectivity() {
    try {
      console.log(`${Platform.OS}: Testing Firestore connectivity...`);
      
      // Test Firestore endpoint
      const response = await fetch('https://firestore.googleapis.com/v1/projects/one-world-chair/databases/(default)/documents', {
        method: 'GET',
        timeout: 15000
      });
      
      const canReachFirestore = response.status !== undefined;
      console.log(`${Platform.OS}: Firestore connectivity test result:`, canReachFirestore);
      return canReachFirestore;
    } catch (error) {
      console.error(`${Platform.OS}: Firestore connectivity test failed:`, error);
      return false;
    }
  }

  /**
   * Comprehensive network and Firebase connectivity test
   */
  static async runComprehensiveTest() {
    console.log(`${Platform.OS}: Running comprehensive network test...`);
    
    const results = {
      internet: false,
      firebaseAuth: false,
      firestore: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Test internet connectivity first
      results.internet = await this.testInternetConnectivity();
      
      if (results.internet) {
        // Only test Firebase if internet is working
        results.firebaseAuth = await this.testFirebaseAuthConnectivity();
        results.firestore = await this.testFirestoreConnectivity();
      }
    } catch (error) {
      console.error(`${Platform.OS}: Comprehensive test failed:`, error);
    }

    console.log(`${Platform.OS}: Comprehensive test results:`, results);
    return results;
  }

  /**
   * Get network status summary
   */
  static async getNetworkStatus() {
    const results = await this.runComprehensiveTest();
    
    let status = 'Unknown';
    let message = 'Unable to determine network status';
    
    if (!results.internet) {
      status = 'No Internet';
      message = 'No internet connection detected. Please check your network settings.';
    } else if (!results.firebaseAuth && !results.firestore) {
      status = 'Firebase Blocked';
      message = 'Internet is working but Firebase services are not reachable. This might be due to firewall or network restrictions.';
    } else if (!results.firebaseAuth) {
      status = 'Auth Issues';
      message = 'Internet and Firestore are working but Firebase Auth is not reachable.';
    } else if (!results.firestore) {
      status = 'Firestore Issues';
      message = 'Internet and Firebase Auth are working but Firestore is not reachable.';
    } else {
      status = 'All Good';
      message = 'All network services are reachable.';
    }

    return {
      status,
      message,
      details: results
    };
  }
}
