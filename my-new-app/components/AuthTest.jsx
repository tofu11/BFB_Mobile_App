import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthService } from '../lib/authService';

export default function AuthTest() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Testing...');

  useEffect(() => {
    // Test Firebase connection
    AuthService.testConnection().then(connected => {
      setConnectionStatus(connected ? 'Connected ✅' : 'Connection Failed ❌');
    });

    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting sign in...');
      const user = await AuthService.signInWithEmail(email, password);
      console.log('Sign in successful:', user.email);
      Alert.alert('Success', `Signed in as ${user.email}`);
    } catch (error) {
      console.error('Sign in failed:', error.message);
      Alert.alert('Sign In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting sign up...');
      const user = await AuthService.signUpWithEmail(email, password);
      console.log('Sign up successful:', user.email);
      Alert.alert('Success', `Account created for ${user.email}`);
    } catch (error) {
      console.error('Sign up failed:', error.message);
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      Alert.alert('Success', 'Signed out successfully!');
    } catch (error) {
      console.error('Sign out failed:', error.message);
      Alert.alert('Sign Out Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('Testing...');
    const connected = await AuthService.testConnection();
    setConnectionStatus(connected ? 'Connected ✅' : 'Connection Failed ❌');
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.email}>Email: {user.email}</Text>
        <Text style={styles.status}>Platform: {Platform.OS}</Text>
        <Text style={styles.status}>Status: {connectionStatus}</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonText}>Signing Out...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Auth Test</Text>
      <Text style={styles.status}>Platform: {Platform.OS}</Text>
      <Text style={styles.status}>Status: {connectionStatus}</Text>
      
      <TouchableOpacity style={styles.testButton} onPress={testConnection}>
        <Text style={styles.testButtonText}>Test Connection</Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.buttonText}>Signing In...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.buttonText}>Creating Account...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
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
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
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
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  testButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
});