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

export default function Index({ onGoToHome, onGoToReview }) {
  const [deviceId, setDeviceId] = useState('');
  
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

  // Store light/dark theme.
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Form input states.
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  
  // States for weather data, time, and showing Tokyo info.
  const [weather, setWeather] = useState(null);
  const [tokyoTime, setTokyoTime] = useState('');
  const [showTokyo, setShowTokyo] = useState(false);
  
  // Loading and error states.
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState('');
  
  // Text input for sentiment analysis.
  const [text, setText] = useState('');

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

  // Fetch current weather in Tokyo using open-meteo API.
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true'
        );
        const data = await response.json();
        setWeather(data.current_weather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
    fetchWeather();
  }, []);

  // Update Tokyo time every second.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      setTokyoTime(formatter.format(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Store sentiment analysis results in Appwrite.
  const storeSentimentHistory = async (sentimentResult) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        SENTIMENT_COLLECTION_ID,
        'unique()',
        {
          deviceId: deviceId,
          text: text,
          sentiment: sentimentResult,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (err) {
      console.error('Error saving sentiment history:', err);
    }
  };

  // Switch between light and dark modes, then save preference.
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await storeThemePreference(newTheme);
  };

  // Analyze sentiment with a Hugging Face model.
  const analyzeSentiment = async () => {
    if (!text) {
      setError('Please enter text before analyzing.');
      return;
    }
    setLoading(true);
    setError('');
    setSentiment(null);
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer API',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        }
      );
      if (!response.ok) throw new Error('Failed to analyze sentiment.');
      const data = await response.json();
      const sentimentResult = data[0][0].label;
      setSentiment(sentimentResult);
      await storeSentimentHistory(sentimentResult);
    } catch (err) {
      setError('Error fetching sentiment data.');
    } finally {
      setLoading(false);
    }
  };

  // Main UI rendering.
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text></Text>
      <Text style={[styles.text, { color: currentTheme.textColor }]}>
        Appwrite integration example.
      </Text>
      <Text style={[styles.text, { color: currentTheme.textColor }]}>
        Welcome to the MEET project.
      </Text>
      <CustomButton
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onPress={toggleTheme}
        theme={currentTheme}
      />
      <CustomTextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        keyboardType="default"
        theme={currentTheme}
      />
      <CustomTextInput
        placeholder="Enter your age"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
        theme={currentTheme}
      />
      {name !== '' && number !== '' && (
        <Text style={[styles.text, { color: currentTheme.textColor }]}>
          WOWWWW {name.toUpperCase()} YOU ARE GETTING PRETTY OLD! YOU'RE {number.toUpperCase()}
        </Text>
      )}
      <CustomButton
        title={showTokyo ? "Hide Tokyo's Information" : "Show Tokyo's Information"}
        onPress={() => setShowTokyo(!showTokyo)}
        theme={currentTheme}
      />
      {showTokyo && (
        <>
          {weather && (
            <Text style={[styles.text, { color: currentTheme.textColor }]}>
              Current Weather in Tokyo: {weather.temperature}°C, Weather Code: {weather.weathercode}
            </Text>
          )}
          <Text style={[styles.text, { color: currentTheme.textColor }]}>
            Current Time in Tokyo: {tokyoTime}
          </Text>
        </>
      )}
      <CustomTextInput
        placeholder="Enter text for sentiment analysis"
        value={text}
        onChangeText={setText}
        keyboardType="default"
        theme={currentTheme}
      />
      <CustomButton
        title="Analyze Sentiment"
        onPress={analyzeSentiment}
        theme={currentTheme}
      />
      {loading && <ActivityIndicator size="large" color={currentTheme.textColor} />}
      {sentiment && (
        <Text style={[styles.text, { color: sentiment === 'POSITIVE' ? 'green' : 'red' }]}>
          Sentiment: {sentiment}
        </Text>
      )}
      {error && <Text style={[styles.text, { color: 'red' }]}>{error}</Text>}

      <CustomButton
        title="HomePage"
        onPress={onGoToHome}
        theme={currentTheme}
      />

      <CustomButton
        title="HomePage"
        onPress={onGoToReview}
        theme={currentTheme}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  // Main screen container with centered content.
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Base text styling with margins.
  text: {
    textAlign: 'center',
    marginBottom: 20,
  },
  // Input styling with border, padding, and width.
  input: {
    height: 40,
    width: '80%',
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  // Button styling with margin, padding, and border.
  button: {
    padding: 10,
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
  },
  // Text inside the button with larger font and bold weight.
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});