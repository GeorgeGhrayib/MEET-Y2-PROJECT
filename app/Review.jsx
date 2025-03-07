// Review.jsx
import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { UrlTile } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import { Client, Databases } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67a5ffeb0032bd62ecc9');
const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3';

export default function ReviewPage({ onGoToHome }) {
  // States for device, theme, location, search text, and loading.
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme definitions
  const lightTheme = {
    gradientColors: ['#b3e5fc', '#0288d1'], // Light blue gradient
    textColor: '#000000',
    buttonBackground: '#613be9', // Vibrant purple for buttons
    buttonBorder: '#ffffff',
  };

  const darkTheme = {
    gradientColors: ['#0d47a1', '#01579b'], // Dark blue gradient
    textColor: '#ffffff',
    buttonBackground: '#613be9', // Vibrant purple remains the same
    buttonBorder: '#ffffff',
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Fetch device ID and stored theme preference.
  useEffect(() => {
    (async () => {
      try {
        const id = await DeviceInfo.getUniqueId();
        const sanitized = (id || '').replace(/[^a-zA-Z0-9-_]/g, '');
        setDeviceId(sanitized);
        try {
          const doc = await databases.getDocument(DATABASE_ID, THEME_COLLECTION_ID, sanitized);
          setIsDarkMode(doc.isDarkMode);
        } catch (err) {
          console.log('No stored theme preference found.');
        }
      } catch (error) {
        console.error('Error fetching device ID:', error);
      }
    })();
  }, []);

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

  // Fetch user location (using same logic as HomePage)
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

  // Toggle theme using Appwrite
  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      await databases.createDocument(
        DATABASE_ID,
        THEME_COLLECTION_ID,
        deviceId,
        { isDarkMode: nextMode }
      );
    } catch (err) {
      if (err.code === 409) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            THEME_COLLECTION_ID,
            deviceId,
            { isDarkMode: nextMode }
          );
        } catch (updateErr) {
          console.error('Error updating theme preference:', updateErr);
        }
      } else {
        console.error('Error saving theme preference:', err);
      }
    }
  };

  // Determine the region for the MapView using the current location; fall back to Los Angeles if not available.
  const mapRegion = {
    latitude: location ? location.latitude : 34.0522,
    longitude: location ? location.longitude : -118.2437,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Text></Text>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoToHome}>
            <Text style={[styles.backButtonText, { color: currentTheme.textColor }]}>{'← Home'}</Text>
          </TouchableOpacity>
        </View>
        {/* Title moved to its own line */}
        <Text style={[styles.headerText, { color: currentTheme.textColor, marginBottom: 20 }]}>
          {'Submit a review ↓'}
        </Text>

        {/* Search & Map Section */}
        <View style={styles.searchMapSection}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
              style={styles.searchInput}
              placeholder="Search for a business..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Text style={styles.micIcon}>🎤</Text>
          </View>
          {/* Map View */}
          <View style={styles.mapContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={currentTheme.textColor} />
            ) : (
              <MapView 
                style={[styles.map, { borderColor: currentTheme.textColor }]}
                initialRegion={mapRegion}
                showsUserLocation={true}
              >
                <UrlTile 
                  urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  zIndex={-1}
                />
              </MapView>
            )}
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
            {'Rate the Business'}
          </Text>
          <View style={styles.starContainer}>
            {[...Array(5)].map((_, index) => (
              <Text key={index} style={styles.starIcon}>
                {index < 3 ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={[styles.sectionSubtitle, { color: currentTheme.textColor }]}>
            {'Accessibility Questions'}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.accessButton, { backgroundColor: '#E1BEE7', borderColor: '#000' }]}>
              <Text style={[styles.accessButtonText, { color: currentTheme.textColor }]}>
                {'Does it have a ramp?'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.accessButton, { backgroundColor: '#E1BEE7', borderColor: '#000' }]}>
              <Text style={[styles.accessButtonText, { color: currentTheme.textColor }]}>
                {'Does it have an accessible door?'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.accessButton, { backgroundColor: '#E1BEE7', borderColor: '#000' }]}>
              <Text style={[styles.accessButtonText, { color: currentTheme.textColor }]}>
                {'Other accessibility factors'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton}>
            <Text style={styles.cameraIcon}>{'📷'}</Text>
            <Text style={styles.photoButtonText}>{'Upload a photo'}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer with Toggle Theme */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.toggleContainer} onPress={toggleTheme}>
                          <Text style={[styles.toggleText, {textDecorationLine: 'underline'}, { color: currentTheme.textColor }]}>Toggle Theme</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  // Header styles.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Search & Map Section.
  searchMapSection: {
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  micIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  // Review Section.
  reviewSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starIcon: {
    fontSize: 30,
    marginHorizontal: 5,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  accessButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 5,
    width: '90%',
    alignItems: 'center',
  },
  accessButtonText: {
    fontSize: 16,
  },
  // Photo Upload Section.
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  cameraIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  photoButtonText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  // Footer.
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
});