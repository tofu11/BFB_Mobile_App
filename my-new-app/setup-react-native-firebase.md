# Setup React Native Firebase (Alternative Solution)

If you want to use React Native Firebase instead of the JS SDK, follow these steps:

## 1. Install React Native Firebase

```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth
```

## 2. Configure for Expo (requires custom development build)

Note: This requires ejecting from Expo Go or using EAS Build.

### Create app.config.js:

```javascript
export default {
  expo: {
    name: "my-new-app",
    slug: "my-new-app",
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ],
    ios: {
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      googleServicesFile: "./google-services.json"
    }
  }
};
```

## 3. Add Firebase config files

- Download `GoogleService-Info.plist` for iOS
- Download `google-services.json` for Android
- Place them in your project root

## 4. Create custom development build

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

## 5. Use React Native Firebase Auth

```typescript
import auth from '@react-native-firebase/auth';

// Sign in with email
const signIn = async (email: string, password: string) => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error(error);
  }
};

// Google Sign In (requires additional setup)
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const signInWithGoogle = async () => {
  try {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error(error);
  }
};
```

This approach gives you full native Firebase functionality but requires a custom development build.
