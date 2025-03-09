# OpenWay

OpenWay is a React Native application focused on helping wheelchair users easily discover, review, and encourage accessible businesses. Built using React Native and integrated with Appwrite for data management, OpenWay emphasizes user-friendly interactions, accessibility, and personalized experiences.

## 📌 Features

### ✅ Implemented Features

- **Dynamic Theme Toggle**: Users can switch between dark and light modes, saved via Appwrite.
- **Real-Time Location Mapping**: Displays your current location using OpenStreetMap.
- **User Interface & Navigation**: Fully functional navigation across Home, Profile, Sign-In, Sign-Up, and Review pages.

#### Index/Demo Page

- **Sentiment Analysis Demo**: Uses an NLP model (from Hugging Face API) to analyze user-entered text and identify sentiment (positive or negative). Results are saved using Appwrite.
- **Real-Time Tokyo Info**: Displays Tokyo’s current weather and time, updated every second, showcasing real-time API integrations.
- **User Input Handling**: Demonstrates handling both text and numeric input, providing instant feedback.
- **Navigation**: Provides buttons that lead users to the main Home and Review pages of the app.

### ⚠️ Partially Implemented Features

- **Accessibility Review Interface**: Users can submit reviews, answer specific accessibility questions, and upload photos.
- **Search Bar Integration**: Users can type to search for locations.
- **User Authentication UI**: Sign-in and sign-up pages exist but do not currently authenticate users or store credentials.
- **Interactive Map**: Map displays the user’s location but doesn’t yet mark wheelchair-accessible businesses.
- **Profile Page**: Layout and buttons are available but not fully connected to backend data or user activities.
- **Review Submission**: UI for reviews exists, but submitted reviews are not stored in the database yet.

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
npm install react-native appwrite react-native-device-info react-native-maps react-native-geolocation-service react-native-linear-gradient
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

- **Complete Authentication**: Implement Appwrite’s authentication module for secure login and signup.
- **Database Integration**: Store and manage submitted reviews and user profiles in Appwrite.
- **Mark Accessible Businesses on Map**: Display existing businesses with reviews and accessibility scores on the map.
- **Voice-Enabled Search**: Integrate speech-to-text functionality.
- **Push Notifications**: Notify users of interactions on their reviews or updates about accessibility.
- **Business Owner Portal**: Allow businesses to respond to reviews and manage their accessibility listings.
- **AI-driven Sentiment Analysis:** Automatically categorize user reviews.

## 📝 Developer Credits & Contributions

- **Lead Developer**: George Ghrayib
- **Support**: MEET Developer Team