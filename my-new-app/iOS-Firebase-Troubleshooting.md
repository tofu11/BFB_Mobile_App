# iOS Firebase Auth Network Error Troubleshooting

## The Problem
You're getting `Error: Firebase: Error (auth/network-request-failed)` on iOS but not on web. This is a common issue with Firebase JS SDK in React Native/Expo environments.

## Root Causes
1. **Network restrictions in iOS simulator/device**
2. **Firebase JS SDK limitations in React Native**
3. **Expo Go environment restrictions**
4. **iOS network security policies**
5. **Timeout issues with slow connections**

## Solutions Implemented

### 1. Enhanced Auth Service (`iosAuthFix.ts`)
- **Retry Logic**: Automatically retries failed requests up to 3 times
- **Timeout Handling**: 30-second timeout for iOS requests
- **Better Error Messages**: User-friendly error descriptions
- **Platform Detection**: Different handling for iOS vs web

### 2. Improved Firebase Configuration (`firebaseConfig.ts`)
- **Proper Initialization**: Prevents multiple Firebase app instances
- **Platform-Specific Auth**: Different auth initialization for web vs native
- **Error Handling**: Graceful fallbacks if initialization fails

### 3. Network Connection Testing
- **Connection Test**: Verify Firebase connectivity before auth attempts
- **Debug Logging**: Detailed console logs for troubleshooting

## Additional Troubleshooting Steps

### If the issue persists:

1. **Check Network Connection**
   ```bash
   # Test if you can reach Firebase servers
   ping identitytoolkit.googleapis.com
   ```

2. **Try Different Networks**
   - Switch between WiFi and cellular data
   - Try a different WiFi network
   - Use a VPN if corporate firewall is blocking requests

3. **Clear Expo Cache**
   ```bash
   npx expo start --clear
   ```

4. **Reset iOS Simulator**
   - Device → Erase All Content and Settings
   - Or use: `npx expo run:ios --device`

5. **Check Firebase Project Settings**
   - Ensure your Firebase project is active
   - Verify API keys are correct
   - Check if there are any quota limits

6. **Enable Debug Mode**
   ```javascript
   // Add to your app.json
   {
     "expo": {
       "extra": {
         "firebaseDebug": true
       }
     }
   }
   ```

### Alternative Solutions

#### Option A: Use Firebase Emulator (Development Only)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start auth emulator
firebase emulators:start --only auth
```

#### Option B: Switch to React Native Firebase
```bash
# Install React Native Firebase (requires custom dev build)
npx expo install @react-native-firebase/app @react-native-firebase/auth
```

#### Option C: Use Expo AuthSession for OAuth
```bash
# For Google/social login only
npx expo install expo-auth-session expo-crypto
```

## Testing Your Fix

1. **Use the Enhanced Auth Service**
   ```typescript
   import { IOSAuthService } from './lib/iosAuthFix';
   
   // Test sign in
   await IOSAuthService.signInWithEmail(email, password);
   ```

2. **Monitor Console Logs**
   - Look for retry attempts
   - Check connection test results
   - Watch for timeout messages

3. **Test on Real Device**
   - iOS Simulator sometimes has different network behavior
   - Test on actual iPhone/iPad

## Expected Behavior

With the enhanced auth service:
- **First attempt fails**: You'll see retry messages in console
- **Automatic retries**: Up to 3 attempts with increasing delays
- **Better error messages**: User-friendly descriptions instead of technical codes
- **Timeout protection**: Requests won't hang indefinitely

## When to Use Each Solution

- **iosAuthFix.ts**: Use this for immediate fix with current setup
- **React Native Firebase**: Use for production apps needing full Firebase features
- **Expo AuthSession**: Use for social login only
- **Firebase Emulator**: Use for development/testing only

## Success Indicators

✅ Sign in works on both web and iOS
✅ Retry logic activates on network failures
✅ Clear error messages for users
✅ No hanging/frozen requests
✅ Consistent behavior across platforms
