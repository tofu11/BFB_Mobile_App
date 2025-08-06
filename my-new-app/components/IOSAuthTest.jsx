import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IOSEnhancedAuthService } from '../lib/iosFirebaseFix';

export default function IOSAuthTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      const connected = await IOSEnhancedAuthService.testConnection();
      setConnectionStatus(connected ? 'Connected ✅' : 'Failed ❌');
      Alert.alert('Connection Test', connected ? 'Success!' : 'Failed');
    } catch (error) {
      setConnectionStatus('Error ❌');
      Alert.alert('Connection Test', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log(`${Platform.OS}: Testing sign up with REST API`);
      const result = await IOSEnhancedAuthService.signUpWithEmail(email, password);
      console.log(`${Platform.OS}: Sign up successful:`, result.user.uid);
      Alert.alert('Success', `Account created! UID: ${result.user.uid}`);
    } catch (error) {
      console.error(`${Platform.OS}: Sign up failed:`, error.message);
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log(`${Platform.OS}: Testing sign in with REST API`);
      const result = await IOSEnhancedAuthService.signInWithEmail(email, password);
      console.log(`${Platform.OS}: Sign in successful:`, result.user.uid);
      Alert.alert('Success', `Signed in! UID: ${result.user.uid}`);
    } catch (error) {
      console.error(`${Platform.OS}: Sign in failed:`, error.message);
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iOS Firebase Auth Test</Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>
      <Text style={styles.status}>Connection: {connectionStatus}</Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Test Sign Up'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.signInButton]} 
        onPress={testSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing In...' : 'Test Sign In'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        {Platform.OS === 'ios' 
          ? 'Using Firebase REST API for iOS' 
          : 'Using Firebase JS SDK for Web'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  platform: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#34C759',
  },
  testButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});