# Environment Variables

This document describes all environment variables used in the project.

## Configuration Files

- `.env` - Local development (never commit this file)
- `.env.example` - Template with placeholder values (safe to commit)

## Firebase Configuration

Required for Firebase services (auth, firestore, storage).

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://project-default-rtdb...firebasedatabase.app` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (optional) | `G-XXXXXXXXXX` |

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Register a web app if not already registered
6. Copy the config values

## Third-Party API Keys

These keys are for external AI services and integrations.

| Variable | Service | Status |
|----------|---------|--------|
| `OPENCODE_API_KEY` | OpenCode AI | Configured |
| `GOOGLE_API_KEY` | Google AI services | Configured |
| `OPENROUTER_API_KEY` | OpenRouter AI gateway | Configured |
| `MINIMAX_API_KEY` | MiniMax AI | Configured |
| `STRIPE_KEY` | Stripe payments | Reserved for future use |

## Local Tooling

| Variable | Description | Values |
|----------|-------------|--------|
| `OPENCODE_PERMISSION` | OpenCode agent permissions | `all` (default) |

## Setup Instructions

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Fill in Firebase credentials

Get values from your Firebase project settings (see above).

### 3. Add API keys

Enter your API keys for the services you plan to use.

### 4. Restart the dev server

```bash
npm run dev
```

## Security Notes

- **Never commit `.env`** to version control
- The `.env` file is already in `.gitignore`
- Use `.env.local` for environment-specific overrides
- Prefix `NEXT_PUBLIC_` exposes variables to the browser - only use for Firebase config
