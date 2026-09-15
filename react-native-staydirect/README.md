# StayDirect Pune — React Native (Expo) Mobile App

Production-ready native Android and iOS mobile application for **StayDirect**, the Pune hostel and PG marketplace connecting students directly with property owners with **zero brokerage**.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: React Native with Expo SDK 52 (TypeScript)
- **Design System**: Forest Green (`#173B2C`), Sage Green (`#DDE9D5`), Warm Cream (`#F8F7F1`), Warm Gold (`#C28A52`)
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **Authentication**: Supabase Auth (Email/Password, auto session persistence via AsyncStorage, role metadata: `student` vs. `owner`)
- **Storage**: Supabase Storage bucket `hostel-images` with public CDN URLs
- **Server State**: TanStack Query (React Query) with optimistic updates and local fallback cache
- **Device Capabilities**: `expo-image-picker` for photo uploads, `Linking` for direct WhatsApp & phone calls, Google Maps integration

---

## 🗄️ Supabase Database Setup

### 1. Apply Migration
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to the **SQL Editor** tab.
3. Open and run the migration file located at:
   ```
   /react-native-staydirect/supabase/migrations/20250101_init.sql
   ```
4. This creates:
   - `profiles` with role-based metadata (`student` | `owner`)
   - `hostels` with coordinates, rent ranges, and Pune areas (Hinjewadi, Kothrud, Wakad, Viman Nagar, etc.)
   - `hostel_images` and `rooms` (single, double, triple sharing)
   - `bookings` with ₹0 brokerage enforcement
   - `inquiries` for free physical visit scheduling
   - `favorites` and `conversations`
   - Complete Row Level Security (RLS) policies for student and owner isolation

### 2. Configure Environment Variables
Create a `.env` file inside `/react-native-staydirect`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 How to Run on Your Mobile Phone (in 60 Seconds)

### Step 1: Install Free "Expo Go" on your Phone
- **Android**: [Expo Go on Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone / iPad**: [Expo Go on Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Start Expo Dev Server
```bash
cd react-native-staydirect
npm install
npx expo start
```

### Step 3: Scan the QR Code
- **Android**: Open Expo Go, tap **"Scan QR code"**, point at your terminal.
- **iPhone**: Open Camera app, tap the prompt to open in Expo Go.

---

## 📦 Building Standalone Android APK (.apk / Play Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login and build APK in the cloud
eas login
eas build --platform android --profile preview
```
