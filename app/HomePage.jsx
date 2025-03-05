import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Client, Databases } from 'appwrite';
import DeviceInfo from 'react-native-device-info';
import MapView, { UrlTile } from 'react-native-maps';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// Create a new Appwrite client instance.
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite endpoint.
  .setProject('67a5ffeb0032bd62ecc9');         // Your project ID in Appwrite.

// Access the Databases service from Appwrite.
const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';        // database ID.
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3'; // Collection for storing theme settings.
const SENTIMENT_COLLECTION_ID = '67a602db002416f508b0'; // Collection for storing sentiment data.

// Custom button component with a dynamic style.
function CustomButton({ title, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: theme.textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

// Custom text input that accepts a theme prop for styling.
function CustomTextInput({ placeholder, value, onChangeText, keyboardType, theme }) {
  return (
    <RNTextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.inputBackgroundColor,
          color: theme.textColor,
          borderColor: theme.inputBorderColor,
        },
      ]}
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.placeholderColor}
      keyboardType={keyboardType}
    />
  );
}

export default function HomePage() {
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Light and dark theme definitions.
  const lightTheme = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    inputBackgroundColor: '#f0f0f0',
    inputBorderColor: '#d3d3d3',
    placeholderColor: '#7f7f7f',
  };

  const darkTheme = {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    inputBackgroundColor: '#333333',
    inputBorderColor: '#555555',
    placeholderColor: '#aaaaaa',
  };

  // Pick the current theme based on state.
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Fetch a unique device ID at the start of the component’s lifecycle.
  useEffect(() => {
    async function fetchDeviceId() {
      try {
        const id = await DeviceInfo.getUniqueId();
        // Replace any disallowed characters with an empty string.
        const sanitizedId = (id || '').replace(/[^a-zA-Z0-9-_]/g, '');
        setDeviceId(sanitizedId);
      } catch (err) {
        console.error('Error fetching device ID:', err);
      }
    }
    fetchDeviceId();
  }, []);

  // Load a saved theme preference from Appwrite if available.
  useEffect(() => {
    async function fetchThemePreference() {
      try {
        const doc = await databases.getDocument(DATABASE_ID, THEME_COLLECTION_ID, deviceId);
        setIsDarkMode(doc.isDarkMode);
      } catch (err) {
        console.log('No stored theme preference found.');
      }
    }
    if (deviceId) {
      fetchThemePreference();
    }
  }, [deviceId]);

  // Store or update theme preference in Appwrite.
  const storeThemePreference = async (themePreference) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        THEME_COLLECTION_ID,
        deviceId,
        { isDarkMode: themePreference }
      );
    } catch (err) {
      // If document already exists, update it instead.
      if (err.code === 409) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            THEME_COLLECTION_ID,
            deviceId,
            { isDarkMode: themePreference }
          );
        } catch (updateErr) {
          console.error('Error updating theme preference:', updateErr);
        }
      } else {
        console.error('Error saving theme preference:', err);
      }
    }
  };

  // Switch between light and dark modes, then save preference.
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await storeThemePreference(newTheme);
  };
  
  // Get User Location
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Function to request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // Request iOS permission
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else {
      // Request Android permission (not needed in your case)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };
  
  // Fetch user location
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location access is required to show your position.');
        setLoading(false);
        return;
      }
  
      // Get the user's current location
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={[styles.iconText, { color: currentTheme.textColor }]}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={[styles.iconText, { color: currentTheme.textColor }]}>Language</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.businessButton}>
          <Text style={[styles.businessText, { color: currentTheme.textColor }]}>Business Owner? Join</Text>
        </TouchableOpacity>
      </View>

      {/* Branding & Mission Statement */}
      <View style={styles.branding}>
        <View style={[styles.logoPlaceholder, { backgroundColor: currentTheme.inputBackgroundColor }]}>
          <Text style={[styles.logoText, { color: currentTheme.textColor }]}>Logo</Text>
        </View>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Welcome to OpenWay!</Text>
        <Text style={[styles.mission, { color: currentTheme.textColor }]}>
          Our mission is to encourage businesses to be wheelchair-friendly and provide reliable info about accessible locations.
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
          <Text style={[styles.toggleButtonText, { color: currentTheme.textColor }]}>Toggle Theme</Text>
        </TouchableOpacity>
      </View>

      {/* Functional Map Section */}
      <View style={styles.mapContainer}>
        {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
        ) : (
            <MapView
            style={[styles.map, { borderColor: currentTheme.inputBackgroundColor }]}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            >
            <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" zIndex={-1} />
            </MapView>
        )}
        </View>
      
      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <CustomButton title="Login / Sign Up" onPress={() => {}} theme={currentTheme} />
        <TouchableOpacity style={styles.profileButton}>
          <Text style={[styles.profileText, { color: currentTheme.textColor }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container.
  container: {
    flex: 1,
  },
  // Header styles.
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 10,
  },
  iconText: {
    fontSize: 14,
  },
  businessButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  businessText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Branding styles.
  branding: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  mission: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  toggleButton: {
    marginTop: 10,
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  toggleButtonText: {
    fontSize: 14,
  },
  // Map section styles.
  mapContainer: {
    flex: 1,
    justifyContent: 'center', // Center map vertically
    alignItems: 'center', // Center map horizontally
  },
  map: {
    width: '90%', // Smaller than full width
    height: 300, // Adjust the height
    borderRadius: 10, // Rounded edges
    borderWidth: 2, // Border thickness
    overflow: 'hidden', // Ensures border-radius applies
  },
  // Bottom bar styles.
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 20,
  },
  profileButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  profileText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Base input and button styles.
  input: {
    height: 40,
    width: '80%',
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  button: {
    padding: 10,
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});