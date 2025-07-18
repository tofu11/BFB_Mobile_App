import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { getAuth } from 'firebase/auth';  // Web SDK version
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type definitions for navigation
type RootStackParamList = {
  Explore: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  'Explore'
>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

export default function Login({ navigation }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.navigate('Explore');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily locked. Try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3a86ff" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#3a86ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#3a86ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  signUpButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a86ff',
  },
  signUpText: {
    color: '#3a86ff',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});