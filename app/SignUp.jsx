// SignUp.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Client, Databases } from 'appwrite';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';

// Initialize Appwrite client.
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67a5ffeb0032bd62ecc9');

const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3';

export default function SignUpPage({ onGoToHome, onGoToSignIn }) {
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [location, setLocation] = useState(null);

  // Theme definitions (same as SignIn).
  const lightTheme = {
    gradientColors: ['#b3e5fc', '#0288d1'], // Light blue gradient
    textColor: '#000000',
    buttonBackground: '#613be9',
    buttonBorder: '#ffffff',
    inputBackground: '#ffffff',
    inputBorder: '#cccccc',
    placeholderColor: '#888888',
  };

  const darkTheme = {
    gradientColors: ['#0d47a1', '#01579b'], // Dark blue gradient
    textColor: '#ffffff',
    buttonBackground: '#613be9',
    buttonBorder: '#ffffff',
    inputBackground: '#333333',
    inputBorder: '#555555',
    placeholderColor: '#aaaaaa',
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Fetch device ID.
  useEffect(() => {
    (async () => {
      try {
        const id = await DeviceInfo.getUniqueId();
        const sanitized = (id || '').replace(/[^a-zA-Z0-9-_]/g, '');
        setDeviceId(sanitized);
      } catch (err) {
        console.error('Error fetching device ID:', err);
      }
    })();
  }, []);

  // Load stored theme preference.
  useEffect(() => {
    async function fetchThemePreference() {
      if (!deviceId) return;
      try {
        const doc = await databases.getDocument(DATABASE_ID, THEME_COLLECTION_ID, deviceId);
        setIsDarkMode(doc.isDarkMode);
      } catch (err) {
        console.log('No stored theme preference found.');
      }
    }
    fetchThemePreference();
  }, [deviceId]);

  const storeThemePreference = async (themeValue) => {
    try {
      await databases.createDocument(DATABASE_ID, THEME_COLLECTION_ID, deviceId, { isDarkMode: themeValue });
    } catch (err) {
      if (err.code === 409) {
        try {
          await databases.updateDocument(DATABASE_ID, THEME_COLLECTION_ID, deviceId, { isDarkMode: themeValue });
        } catch (updateErr) {
          console.error('Error updating theme preference:', updateErr);
        }
      } else {
        console.error('Error saving theme preference:', err);
      }
    }
  };

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await storeThemePreference(nextMode);
  };

  // Dummy sign-up handler.
  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    // Simulate sign-up process.
    setTimeout(() => {
      setLoading(false);
      onGoToHome();
    }, 2000);
  };

  // Request location permission.
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }
      Geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []);

  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <Text></Text>
        <TouchableOpacity style={styles.backButton} onPress={onGoToHome}>
          <Text style={[styles.backButtonText, { color: currentTheme.textColor }]}>{'← Home'}</Text>
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={[styles.headerText, { color: currentTheme.textColor }]}>Sign Up</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.inputBorder, color: currentTheme.textColor }]}
            placeholder="Full Name"
            placeholderTextColor={currentTheme.placeholderColor}
            value={fullName}
            onChangeText={setFullName}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.inputBorder, color: currentTheme.textColor }]}
            placeholder="Email"
            placeholderTextColor={currentTheme.placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.inputBorder, color: currentTheme.textColor }]}
            placeholder="Password"
            placeholderTextColor={currentTheme.placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.inputBorder, color: currentTheme.textColor }]}
            placeholder="Confirm Password"
            placeholderTextColor={currentTheme.placeholderColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          {loading ? (
            <ActivityIndicator size="large" color={currentTheme.textColor} />
          ) : (
            <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder }]} onPress={handleSignUp}>
              <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Create Account</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.toggleContainer} onPress={toggleTheme}>
            <Text style={[styles.toggleText, { color: currentTheme.textColor }]}>Toggle Theme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkContainer} onPress={onGoToSignIn}>
            <Text style={[styles.linkText, { color: currentTheme.textColor }]}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 18,
  },
  container: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 60, // Leave space for the back button
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 20,
  },
  toggleText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});