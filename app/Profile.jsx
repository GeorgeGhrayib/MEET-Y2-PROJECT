// Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Client, Databases } from 'appwrite';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';

// Create the Appwrite client instance.
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67a5ffeb0032bd62ecc9');

const databases = new Databases(client);
const DATABASE_ID = '67a602c6002a8a86591c';
const THEME_COLLECTION_ID = '67a6031a00251ca0d9e3';

export default function ProfilePage({ onGoToHome }) {
  const [deviceId, setDeviceId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme definitions.
  const lightTheme = {
    gradientColors: ['#b3e5fc', '#0288d1'], // light blue gradient
    textColor: '#000000',
    buttonBackground: '#613be9', // vibrant purple
    buttonBorder: '#ffffff',
    purpleText: 'purple',
  };

  const darkTheme = {
    gradientColors: ['#0d47a1', '#01579b'], // dark blue gradient
    textColor: '#ffffff',
    buttonBackground: '#613be9', // vibrant purple (same style)
    buttonBorder: '#ffffff',
    purpleText: 'violet',
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Fetch device ID and theme preference.
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

  // Toggle theme function.
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

  return (
    <LinearGradient colors={currentTheme.gradientColors} style={styles.linearGradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentWrapper}>
            <Text></Text>
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button */}
             <TouchableOpacity style={styles.backButton} onPress={onGoToHome}>
                <Text style={[styles.backButtonText, { color: currentTheme.textColor }]}>{'← Home'}</Text>
            </TouchableOpacity>
            {/* Center Profile Icon with Online Dot */}
            <View style={styles.centerHeader}>
              <Text style={[styles.profileIcon, { color: currentTheme.textColor }]}>{'👤'}</Text>
              <View style={styles.onlineDot} />
            </View>
            {/* Mail Icon with Badge */}
            <TouchableOpacity style={styles.mailButton}>
              <Text style={[styles.mailIcon, { color: currentTheme.textColor }]}>{'✉️'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={[styles.greeting, { color: currentTheme.purpleText }]}>
              {'Hello, [User Name]!'}
            </Text>
            <View style={styles.logoContainer}>
              <Text style={[styles.logoText, { color: currentTheme.textColor }]}>
                {'♿❤️♿'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder },
              ]}
            >
              <Text style={[styles.actionText, { color: currentTheme.textColor }]}>
                {'View My Reviews'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder },
              ]}
            >
              <Text style={[styles.actionText, { color: currentTheme.textColor }]}>
                {'Saved Businesses'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.largeActionButton,
                { backgroundColor: currentTheme.buttonBackground, borderColor: currentTheme.buttonBorder },
              ]}
            >
              <Text style={[styles.largeActionText, { color: currentTheme.textColor }]}>
                {'View/Edit Personal Information'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Options */}
          <View style={styles.additional}>
            <TouchableOpacity>
              <Text style={[styles.toggleContainer, {textDecorationLine: 'underline'}, { color: currentTheme.textColor }]}>{'Log Out'}</Text>
            </TouchableOpacity>
            {/* Toggle Theme Button */}
            <TouchableOpacity style={styles.toggleContainer} onPress={toggleTheme}>
                <Text style={[styles.toggleText, {textDecorationLine: 'underline'}, { color: currentTheme.textColor }]}>Toggle Theme</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpCenter}>
              <Text style={[styles.toggleContainer, {textDecorationLine: 'underline'},  { color: currentTheme.textColor }]}>{'Help Center'}</Text>
              <Text style={[styles.chatIcon, { color: currentTheme.textColor }]}>{'💬'}</Text>
            </TouchableOpacity>
          </View>
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
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 20,
  },
  // Header styles.
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 28,
  },
  centerHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 40,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: '#fff',
  },
  mailButton: {
    padding: 8,
  },
  mailIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  // Main content.
  content: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  logoContainer: {
    marginVertical: 12,
  },
  logoText: {
    fontSize: 40,
  },
  notificationBubble: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  notificationText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  // Action buttons.
  actions: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  actionButton: {
    width: '80%',
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  largeActionButton: {
    width: '90%',
    paddingVertical: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  largeActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Additional options.
  additional: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  additionalText: {
    fontStyle: 'italic',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 14,
  },
  helpCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIcon: {
    marginLeft: 4,
    fontSize: 18,
  },
});