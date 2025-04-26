# KindNest: Empowering Donations, Connecting Communities

**KindNest** is a full-featured mobile application built with **React Native (Expo)** and **Firebase**, designed to create a seamless platform for donations. The app connects donors with recipients across food, clothing, money, and other essential needs, while also helping users find nearby NGOs, orphanages, and old age homes. It features secure user authentication, real-time updates, location-based services, and AI-powered Chat assistance.

---

## Features

### Auth/Security Features
- **User Authentication**: Secure signup and login with Firebase Authentication.
- **Persistent Login**: Users stay signed in unless they manually log out.

### Donor Features
- **Donation Categories**: Donate food, clothes, money, and other essentials through easy-to-use forms.
- **Live Updates**: Donations are instantly reflected in the database and available for recipients.
- **Profile Management**: Donors can manage personal information and view past donations.
- **Donation History**: Donors can track their previous donations.

### Recipient Features
- **Food Request System**: Recipients can view available food donations, request items, and specify the number of people to be served.
- **Browse Donations**: Recipients can browse through all available donations across multiple categories with filter options.
- **Location-Based Discovery**: Find donations nearest to your location for faster access.

### Maps & Location Features
- **Nearby Places Finder**: Locate Old Age Homes, Orphanages, and NGOs using free/open-source map APIs.
- **Category Filters**: Filter map results based on the type of place you're looking for.
- **Get Directions**: Navigate from current location to selected destinations within the app.

### AI Features
- **KindNest Chatbot**: Interactive chatbot assistance for donor/recipient queries, integrated into the app using AI and Firebase backend.

### Admin Features (Upcoming)
- **Donation Moderation**: Monitor and manage donation activities to ensure a safe and helpful environment.
- **User Management**: Oversee and assist users across the platform.

---

## Directory Structure
```
📦 
├─ .env.sample
├─ .gitignore
├─ README.md
├─ android
│  ├─ .gitignore
│  ├─ app
│  │  ├─ build.gradle
│  │  ├─ debug.keystore
│  │  ├─ proguard-rules.pro
│  │  └─ src
│  │     ├─ debug
│  │     │  └─ AndroidManifest.xml
│  │     └─ main
│  │        ├─ AndroidManifest.xml
│  │        ├─ java
│  │        │  └─ com
│  │        │     └─ giri12345
│  │        │        └─ rnf_tut
│  │        │           ├─ MainActivity.kt
│  │        │           └─ MainApplication.kt
│  │        └─ res
│  │           ├─ drawable-hdpi
│  │           │  └─ splashscreen_logo.png
│  │           ├─ drawable-mdpi
│  │           │  └─ splashscreen_logo.png
│  │           ├─ drawable-xhdpi
│  │           │  └─ splashscreen_logo.png
│  │           ├─ drawable-xxhdpi
│  │           │  └─ splashscreen_logo.png
│  │           ├─ drawable-xxxhdpi
│  │           │  └─ splashscreen_logo.png
│  │           ├─ drawable
│  │           │  ├─ ic_launcher_background.xml
│  │           │  └─ rn_edit_text_material.xml
│  │           ├─ mipmap-anydpi-v26
│  │           │  ├─ ic_launcher.xml
│  │           │  └─ ic_launcher_round.xml
│  │           ├─ mipmap-hdpi
│  │           │  ├─ ic_launcher.webp
│  │           │  ├─ ic_launcher_foreground.webp
│  │           │  └─ ic_launcher_round.webp
│  │           ├─ mipmap-mdpi
│  │           │  ├─ ic_launcher.webp
│  │           │  ├─ ic_launcher_foreground.webp
│  │           │  └─ ic_launcher_round.webp
│  │           ├─ mipmap-xhdpi
│  │           │  ├─ ic_launcher.webp
│  │           │  ├─ ic_launcher_foreground.webp
│  │           │  └─ ic_launcher_round.webp
│  │           ├─ mipmap-xxhdpi
│  │           │  ├─ ic_launcher.webp
│  │           │  ├─ ic_launcher_foreground.webp
│  │           │  └─ ic_launcher_round.webp
│  │           ├─ mipmap-xxxhdpi
│  │           │  ├─ ic_launcher.webp
│  │           │  ├─ ic_launcher_foreground.webp
│  │           │  └─ ic_launcher_round.webp
│  │           ├─ values-night
│  │           │  └─ colors.xml
│  │           └─ values
│  │              ├─ colors.xml
│  │              ├─ strings.xml
│  │              └─ styles.xml
│  ├─ build.gradle
│  ├─ gradle.properties
│  ├─ gradle
│  │  └─ wrapper
│  │     ├─ gradle-wrapper.jar
│  │     └─ gradle-wrapper.properties
│  ├─ gradlew
│  ├─ gradlew.bat
│  └─ settings.gradle
├─ app.config.js
├─ app.json
├─ app
│  ├─ (tabsDonor)
│  │  ├─ Events.tsx
│  │  ├─ Profile.tsx
│  │  ├─ RequestedDonations.tsx
│  │  ├─ Track.tsx
│  │  ├─ _layout.tsx
│  │  └─ index.tsx
│  ├─ (tabsRecipient)
│  │  ├─ Profile.tsx
│  │  ├─ ReceivedDonations.tsx
│  │  ├─ Track.tsx
│  │  ├─ Wishlist.tsx
│  │  ├─ _layout.tsx
│  │  └─ index.tsx
│  ├─ +not-found.tsx
│  ├─ _layout.tsx
│  ├─ category
│  │  └─ index.tsx
│  ├─ chat
│  │  └─ index.tsx
│  ├─ donor
│  │  ├─ _layout.tsx
│  │  ├─ clothes
│  │  │  └─ index.tsx
│  │  ├─ donationHistory
│  │  │  └─ index.tsx
│  │  ├─ food
│  │  │  └─ index.tsx
│  │  ├─ index.tsx
│  │  ├─ money
│  │  │  └─ index.tsx
│  │  └─ other
│  │     └─ index.tsx
│  ├─ features
│  │  ├─ contact.tsx
│  │  └─ donations.tsx
│  ├─ login
│  │  ├─ SignIn.tsx
│  │  ├─ SignUp.tsx
│  │  └─ index.tsx
│  └─ recipient
│     ├─ _layout.tsx
│     ├─ food
│     │  └─ index.tsx
│     ├─ index.tsx
│     └─ receivedDonations
│        └─ index.tsx
├─ assets
│  ├─ fonts
│  │  ├─ Poppins-Bold.ttf
│  │  ├─ Poppins-Medium.ttf
│  │  ├─ Poppins-Regular.ttf
│  │  └─ SpaceMono-Regular.ttf
│  └─ images
│     ├─ clothes.png
│     ├─ default-profile-pic.png
│     ├─ favicon.png
│     ├─ food.png
│     ├─ icon.png
│     ├─ image.png
│     ├─ login_image.png
│     ├─ logo.png
│     ├─ logoColor.png
│     ├─ logoDark.jpg
│     ├─ money.png
│     ├─ other.png
│     ├─ partial-react-logo.png
│     ├─ profile.jpg
│     ├─ react-logo.png
│     ├─ react-logo@2x.png
│     ├─ react-logo@3x.png
│     ├─ toys.png
│     ├─ welcome.png
│     └─ welcome1.png
├─ babel.config.js
├─ components
│  ├─ Collapsible.tsx
│  ├─ ExternalLink.tsx
│  ├─ HapticTab.tsx
│  ├─ HelloWave.tsx
│  ├─ ParallaxScrollView.tsx
│  ├─ ThemedText.tsx
│  ├─ ThemedView.tsx
│  ├─ __tests__
│  │  ├─ ThemedText-test.tsx
│  │  └─ __snapshots__
│  │     └─ ThemedText-test.tsx.snap
│  └─ ui
│     ├─ IconSymbol.ios.tsx
│     ├─ IconSymbol.tsx
│     ├─ TabBarBackground.ios.tsx
│     └─ TabBarBackground.tsx
├─ config
│  └─ FirebaseConfig.tsx
├─ constants
│  └─ Colors.tsx
├─ eas.json
├─ global.css
├─ hooks
│  ├─ useColorScheme.ts
│  ├─ useColorScheme.web.ts
│  └─ useThemeColor.ts
├─ metro.config.js
├─ nativewind-env.d.ts
├─ package-lock.json
├─ package.json
├─ scripts
│  └─ reset-project.js
├─ service
│  └─ Storage.tsx
├─ tailwind.config.js
└─ tsconfig.json
```
## Instructions to run the app on your local machine.

Make sure you have Node.js and Expo CLI installed.

Clone the project and navigate into the project directory.

Install dependencies:
```
npm install
```
Start the Expo development server:
```
npx expo start
```
You can now open the app in one of the following ways:

- Expo Go App: Scan the QR code displayed in your terminal or browser.

- Android Emulator: Open the app on an Android virtual device.

- iOS Simulator: Open the app on an iOS virtual device (macOS only).

Note:

- Ensure that your .env file is properly configured with your Firebase credentials and any map API keys if required.

- If you encounter dependency warnings, you can try:
```
npm audit fix
```
Make sure the backend Firebase services (Authentication, Firestore, Storage) are set up and ready.

## Dependencies Used

### Core Packages
- **React Native** — Mobile app framework for building native apps using React.
- **Expo** — Open-source platform for making universal native apps for Android, iOS, and web.
- **Expo Router** — File-based routing for Expo projects.

### Navigation
- **@react-navigation/native** — Routing and navigation for React Native apps.
- **@react-navigation/native-stack** — Stack navigation for screens.
- **@react-navigation/bottom-tabs** — Bottom tab navigation.

### Backend Services & API
- **Firebase** — Backend-as-a-Service (BaaS) for authentication, database, and storage.
- **Axios** — Promise-based HTTP client for making API requests.
- **OpenAI** — Interacting with OpenAI APIs.

### UI Libraries
- **React Native Paper** — UI component library following Material Design.
- **React Native Maps** — Map component for React Native.
- **React Native Gifted Chat** — Building chat UIs quickly.
- **React Native Markdown Display** — Render Markdown in React Native apps.
- **React Native Tab View** — Swipeable tab view component.
- **React Native Feather** — Feather icons for React Native.
- **React Native Vector Icons** — Popular icon sets for React Native.
- **@expo/vector-icons** — Expo-friendly version of Vector Icons.

### Utilities
- **Day.js** — Lightweight JavaScript date library.
- **NativeWind** — TailwindCSS styling for React Native.
- **TailwindCSS** — Utility-first CSS framework.
- **Async Storage** — For storing data locally on device.
- **Expo Location** — Access device’s location.
- **Expo Constants** — System information and environment constants.
- **Expo Web Browser** — Provides a browser within your app.
- **Expo Haptics** — Tactile feedback on supported devices.
- **Expo Blur** — Apply blur effects.
- **Expo Linear Gradient** — Use linear gradients in components.

### Forms and Pickers
- **@react-native-picker/picker** — Dropdown Picker component.
- **@react-native-community/datetimepicker** — Date and time picker.

### Authentication
- **@react-native-google-signin/google-signin** — Google Sign-In integration.
- **Expo Auth Session** — Authentication flows (OAuth, Google, etc).

### Other Libraries
- **Expo Splash Screen** — Manage and customize splash screens.
- **Expo Status Bar** — Manage app status bar appearance.
- **Expo System UI** — Control system UI appearance.

### Development & Testing
- **Expo Dev Client** — Development build environment for Expo apps.
- **Jest** — JavaScript testing framework.
- **Jest Expo** — Jest preset for testing Expo apps.
- **TypeScript** — Strongly typed programming for JavaScript.
- **React Test Renderer** — For snapshot testing of React components.
- **Expo Lint** — Linting utility for Expo projects.


In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

  ### .env config
      EXPO_PUBLIC_FIREBASE_API_KEY =
      EXPO_PUBLIC_AUTH_DOMAIN = 
      EXPO_PUBLIC_PROJECT_ID =
      EXPO_PUBLIC_MESSAGING_SENDER_ID =  
      EXPO_PUBLIC_APP_ID =
      EXPO_PUBLIC_STORAGE_BUCKET = 
      EXPO_PUBLIC_WEB_CLIENT_ID = 
      EXPO_PUBLIC_ANDROID_CLIENT_ID = 
      EXPO_PUBLIC_IOS_CLIENT_ID = 
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 
      EXPO_PUBLIC_RAZORPAY_API_KEY = 
      EXPO_PUBLIC_RAZORPAY_API_SECRET = 
      EXPO_PUBLIC_OPEN_AI_API_KEY = 
      EXPO_PUBLIC_GEMINI_API_KEY = 

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
