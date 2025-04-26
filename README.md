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
│  ├─ login
│  │  ├─ SignIn.tsx
│  │  ├─ SignUp.tsx
│  │  └─ index.tsx
│  └─ recipient
│     ├─ _layout.tsx
│     ├─ index.tsx
│     └─ receivedDonations
│        └─ index.tsx
├─ assets
├─ babel.config.js
├─ components
├─ config
│  └─ FirebaseConfig.tsx
├─ constants
├─ eas.json
├─ global.css
├─ hooks
├─ metro.config.js
├─ nativewind-env.d.ts
├─ package-lock.json
├─ package.json
├─ scripts
├─ service
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
- **NativeWind** — TailwindCSS styling for React Native.
- **Async Storage** — For storing data locally on device.
- **Expo Location** — Access device’s location.
- **Expo Linear Gradient** — Use linear gradients in components.

### Forms and Pickers
- **@react-native-picker/picker** — Dropdown Picker component.
- **@react-native-community/datetimepicker** — Date and time picker.

### Authentication
- **@react-native-google-signin/google-signin** — Google Sign-In integration.
- **Expo Auth Session** — Authentication flows (OAuth, Google, etc).

### Development & Testing
- **Expo Dev Client** — Development build environment for Expo apps.
- **TypeScript** — Strongly typed programming for JavaScript.
- **Expo Lint** — Linting utility for Expo projects.


In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
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
