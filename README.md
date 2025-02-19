# MEET-Y2-PROJECT

A React Native application integrating Appwrite for data management. This project features theme preferences, weather data, sentiment analysis, and real-time Tokyo time updates. However, the main goal of this application is to practice React Native and prepare for building start-ups.

## 📌 Features

- **Dark/Light Mode Toggle**: Saves user preference using Appwrite.
- **Weather Updates**: Displays real-time weather data for Tokyo.
- **Real-time Tokyo Time**: Automatically updates every second.
- **Sentiment Analysis**: Analyzes text using an NLP model.
- **User Input Handling**: Supports text and numeric input.

## 🛠 Installation (Mac Only)

### 1️⃣ Install Prerequisites
Make sure you have the following installed:

- **Node.js** (version 18+)
- **Java JDK** (version 11+)
- **Xcode** (for running on iOS, Mac only)
- **CocoaPods** (for iOS dependencies, Mac only)  
  ```sh
  sudo gem install cocoapods
  ```

### 2️⃣ Clone the Repository
```sh
git clone https://github.com/GeorgeGhrayib/MEET-Y2-PROJECT.git
cd MEET-Y2-PROJECT
```

### 3️⃣ Install Dependencies
```sh
npm install
npm install --include=dev
```

### 4️⃣ Set Up iOS (Mac Only)
```sh
cd ios
pod install
cd ..
```

### 5️⃣ Start the Metro Bundler
```sh
npx react-native start --reset-cache
```
(*Reset cache is optional but useful for resolving issues.*)

### 6️⃣ Run the App
#### For iOS (Mac Only)
```sh
npx react-native run-ios
```

---

## 🎯 Future Roadmap & Upcoming Features

- **Android Support**: Set up support for Android users.
- **Customizable Themes**: Allow users to create and save their own themes.
- **Multi-City Weather Support**: Expand weather tracking to multiple locations.
- **Speech-to-Text Integration**: Enable hands-free text input for sentiment analysis.
- **User Authentication**: Implement secure login/signup using Appwrite’s authentication module.
- **Push Notifications**: Notify users about weather changes and sentiment analysis insights.

## 📝 Developer Credits & Contributions

- **Lead Developer**: George Ghrayib
- **Support**: MEET Developer Team