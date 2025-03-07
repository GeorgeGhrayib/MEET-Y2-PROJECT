// HomePage.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Client, Databases } from 'appwrite';
import DeviceInfo from 'react-native-device-info';
import MapView, { UrlTile } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import LinearGradient from 'react-native-linear-gradient';

// Create a new Appwrite client instance.
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67a5ffeb0032bd62ecc9');

const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3';

export default function HomePage({ onGoToSignIn, onGoToSignUp, onGoToProfile }) {
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme definitions with gradient colors and vibrant accent (purple).
  const lightTheme = {
    gradientColors: ['#b3e5fc', '#0288d1'], // Light blue gradient (top to bottom)
    textColor: '#000000',
    placeholderColor: '#888888',
    accentColor: '#613be9', // Vibrant purple for buttons
  };

  const darkTheme = {
    gradientColors: ['#0d47a1', '#01579b'], // Dark blue gradient (top to bottom)
    textColor: '#ffffff',
    placeholderColor: '#aaaaaa',
    accentColor: '#613be9', // Vibrant purple for buttons
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Fetch unique device ID.
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

  // Request location permission.
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  // Fetch user location.
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location access is required to show your position.');
        setLoading(false);
        return;
      }
      Geolocation.getCurrentPosition(
        (pos) => {
          setLocation(pos.coords);
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
    <LinearGradient colors={currentTheme.gradientColors} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header & Branding */}
        <Text></Text>
        <View style={styles.headerBranding}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={[styles.iconText, { color: currentTheme.textColor }]}>{'⚙️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={[styles.iconText, { color: currentTheme.textColor }]}>{'🌐'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: currentTheme.textColor }]}>{'Business Owner? Join'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brandingSection}>
            <View style={[styles.logoCircle, { backgroundColor: "#FFFFFF" }]}>
            <Image 
                source={require('../assets/OpenWay.png')}
                style={styles.logoImage}
                resizeMode="contain"
            />
            </View>
            <Text style={[styles.mainTitle, { color: currentTheme.textColor }]}>Welcome to OpenWay!</Text>
            <Text style={[styles.missionText, { color: currentTheme.textColor }]}>
              Our mission is to encourage businesses to be wheelchair-friendly and provide reliable info about accessible locations.
            </Text>
            <TouchableOpacity style={styles.vibrantButton} onPress={toggleTheme}>
              <Text style={styles.vibrantButtonText}>Toggle Theme</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Area */}
        <View style={styles.mapContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={currentTheme.textColor} />
          ) : (
            <MapView
              style={[styles.map, { borderColor: currentTheme.textColor }]}
              initialRegion={{
                latitude: location?.latitude || 37.78825,
                longitude: location?.longitude || -122.4324,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
            >
              <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" zIndex={-1} />
            </MapView>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput]}
            placeholder="Search for a location..."
            placeholderTextColor={currentTheme.placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.vibrantButton} onPress={onGoToSignIn}>
            <Text style={styles.vibrantButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vibrantButton} onPress={onGoToSignUp}>
            <Text style={styles.vibrantButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onGoToProfile}>
            <Text style={[styles.iconText, { color: currentTheme.textColor, fontSize: 28 }]}>{'👤'}</Text>
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
    paddingBottom: 20,
  },
  headerBranding: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  iconText: {
    fontSize: 26,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
  },
  brandingSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  missionText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  vibrantButton: {
    backgroundColor: '#613be9',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  vibrantButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    marginVertical: 20,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '90%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    width: '90%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
});