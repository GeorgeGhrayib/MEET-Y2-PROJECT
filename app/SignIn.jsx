import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Client, Databases } from 'appwrite';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';

// Create a new Appwrite client instance.
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67a5ffeb0032bd62ecc9');

const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3';

export default function SignInPage() {
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Theme definitions with gradient colors and a vibrant purple accent for buttons.
  const lightTheme = {
    gradientColors: ['#b3e5fc', '#0288d1'], // Light blue gradient (top to bottom)
    textColor: '#000000',
    buttonBackground: '#613be9', // Vibrant purple
    buttonBorder: '#ffffff', // Thin white border
    inputBackground: '#ffffff',
    inputBorder: '#cccccc',
    placeholderColor: '#888888',
  };

  const darkTheme = {
    gradientColors: ['#0d47a1', '#01579b'], // Dark blue gradient (top to bottom)
    textColor: '#ffffff',
    buttonBackground: '#613be9', // Vibrant purple
    buttonBorder: '#ffffff',
    inputBackground: '#333333',
    inputBorder: '#555555',
    placeholderColor: '#aaaaaa',
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Get unique device ID on mount.
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

  // Load stored theme preference from Appwrite.
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

  // Store or update theme preference.
  const storeThemePreference = async (themeValue) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        THEME_COLLECTION_ID,
        deviceId,
        { isDarkMode: themeValue }
      );
    } catch (err) {
      if (err.code === 409) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            THEME_COLLECTION_ID,
            deviceId,
            { isDarkMode: themeValue }
          );
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

  // Dummy sign-in handler.
  const handleSignIn = () => {
    Alert.alert('Sign In', `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={[styles.headerText, { color: currentTheme.textColor }]}>Sign In</Text>
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentTheme.inputBackground,
                borderColor: currentTheme.inputBorder,
                color: currentTheme.textColor,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={currentTheme.placeholderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentTheme.inputBackground,
                borderColor: currentTheme.inputBorder,
                color: currentTheme.textColor,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={currentTheme.placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder }]}
            onPress={handleSignIn}
          >
            <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder }]}
            onPress={() => Alert.alert('Sign Up', 'Navigate to Sign Up')}
          >
            <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleContainer} onPress={toggleTheme}>
            <Text style={[styles.toggleText, { color: currentTheme.textColor }]}>Toggle Theme</Text>
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
  container: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
});