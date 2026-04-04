# MyPregnancyJourney - Mobile App

React Native mobile app for pregnancy tracking. Built with Expo SDK 54 and TypeScript.

## Features

- **Week-by-week timeline** -- track your entire pregnancy, one week at a time
- **Notes** -- up to 14 diary entries per week
- **Weight tracking** -- simple input per week
- **Symptoms** -- preset checklist + custom symptoms
- **Medications** -- name, dosage, week range
- **Photos** -- camera and gallery upload ("belly evolution")
- **Appointments** -- date, doctor, notes with upcoming list
- **Feedback** -- submit bugs or suggestions to the admin team
- **Internationalization** -- auto-detects device language; Spanish LATAM primary, English fallback

## Requirements

- Node.js 18+
- Expo Go app on your phone (for development)
- Backend API running at `localhost:8000` (see [backend README](https://github.com/dreanox/my-pregnacy-journey-backend))

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/          # Login and register screens
│   ├── (tabs)/          # Main tab screens (Timeline, Gallery, Appointments, Profile)
│   └── week/[id].tsx    # Week detail screen (weight, notes, symptoms, photos, etc.)
├── lib/
│   ├── api.ts           # Axios instance (base URL from lib/constants/network)
│   ├── constants/       # network IP/URLs, timeline layout, health limits, etc.
│   ├── auth.tsx         # AuthContext provider (SecureStore-based)
│   ├── i18n.ts          # i18next config with expo-localization detection
│   ├── types.ts         # TypeScript interfaces + symptom i18n mapping
│   └── queryClient.ts   # React Query client
├── locales/
│   ├── en.json          # English translations (fallback)
│   └── es.json          # Spanish LATAM translations (primary)
├── constants/
│   └── Colors.ts        # Theme colors
└── app.json             # Expo config
```

## Key Libraries

| Library | Purpose |
|---------|---------|
| Expo Router | File-based navigation |
| React Query | Data fetching and caching |
| Axios | HTTP client with interceptors |
| Expo SecureStore | Secure token storage |
| Expo Image Picker | Camera and gallery access |
| expo-localization | Device language detection |
| i18next + react-i18next | Translation framework (hooks-based) |

## API Connection

In development, the app connects to:
- **iOS**: `http://localhost:8000/api/v1`
- **Android**: `http://10.0.2.2:8000/api/v1` (emulator alias)

Update `PRODUCTION_API_ORIGIN` in `lib/constants/network.ts` before deploying.

## Adding a New Language

1. Create `locales/<code>.json` (copy from `en.json` and translate)
2. Import the file in `lib/i18n.ts` and add it to the `resources` object
3. That's it -- the app will auto-select the language if the device matches

## Build & Deploy

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA update (no store review needed)
eas update
```
