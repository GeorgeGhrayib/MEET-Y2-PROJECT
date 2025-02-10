import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

// Reusable Button Component
function CustomButton({ title, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: theme.textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

// Reusable TextInput Component
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

export default function Index() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Light mode settings
  const lightTheme = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    inputBackgroundColor: '#f0f0f0',
    inputBorderColor: '#d3d3d3',
    placeholderColor: '#7f7f7f',
  };

  // Dark mode settings
  const darkTheme = {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    inputBackgroundColor: '#333333',
    inputBorderColor: '#555555',
    placeholderColor: '#aaaaaa',
  };

  // Select theme
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const [name, setName] = useState(''); // State for Name
  const [number, setNumber] = useState(''); // State for Age

  const [weather, setWeather] = useState(null); // State for Tokyo weather
  const [tokyoTime, setTokyoTime] = useState(''); // State for Tokyo time
  const [showTokyo, SetShowTokyo] = useState(false); // State for Tokyo time

  // States for sentiment analysis
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState(''); 

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true'
        );
        const data = await response.json();
        setWeather(data.current_weather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, []);

  // Update Tokyo time every second
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

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

    // Function to fetch sentiment analysis
    const analyzeSentiment = async () => {
      if (!text) {
        setError('Please enter text before analyzing.');
        return;
      }
    
      setLoading(true);
      setError('');
      setSentiment(null);
    
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        });
    
        if (!response.ok) throw new Error('Failed to analyze sentiment.');
    
        const data = await response.json();
        setSentiment(data[0][0].label);
      } catch (err) {
        setError('Error fetching sentiment data.');
      } finally {
        setLoading(false);
      }
    };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Text style={[styles.text, { color: currentTheme.textColor }]}>
        Welcome to the MEET project!
      </Text>
      <Text style={[styles.text, { color: currentTheme.textColor }]}>
        This is going to be where I test out new code and do MEET tasks before we actually start coding.
      </Text>
  
      {/* Reusable Button */}
      <CustomButton
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onPress={() => setIsDarkMode(!isDarkMode)}
        theme={currentTheme}
      />
  
      {/* Reusable TextInput Components */}
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
  
      {/* Button to Toggle Tokyo Information */}
      <CustomButton
        title={showTokyo ? "Hide Tokyo's Information" : "Show Tokyo's Information"}
        onPress={() => SetShowTokyo(!showTokyo)}
        theme={currentTheme}
      />
  
      {/* Conditionally Render Tokyo Information */}
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

        {/* User Input */}
        <CustomTextInput
        placeholder="Enter text for sentiment analysis"
        value={text}
        onChangeText={setText}
        keyboardType="default"
        theme={currentTheme}
      />

      {/* Analyze Button */}
      <CustomButton
        title="Analyze Sentiment"
        onPress={analyzeSentiment}
        theme={currentTheme}
      />

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color={currentTheme.textColor} />}

      {/* Display Sentiment Result */}
      {sentiment && (
        <Text style={[styles.text, { color: sentiment === 'POSITIVE' ? 'green' : 'red' }]}>
          Sentiment: {sentiment}
        </Text>
      )}

      {/* Error Message */}
      {error && <Text style={[styles.text, { color: 'red' }]}>{error}</Text>}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
  },
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