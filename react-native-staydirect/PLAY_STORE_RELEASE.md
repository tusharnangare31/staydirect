# StayDirect Pune — Google Play Store Release & Listing Package

## 1. Google Play Console Listing Metadata

### App Title
**StayDirect Pune - Zero Brokerage Hostels & PGs** (48/50 characters)

### Short Description (Max 80 characters)
**Zero brokerage student hostels & PGs in Pune. Direct owner contact & verified stays.** (80/80 characters)

### Full Description
```text
Are you a student or young professional looking for safe, affordable, and verified hostel or PG accommodation in Pune without paying hefty brokerage fees?

Welcome to StayDirect Pune — Maharashtra's dedicated zero-brokerage student housing marketplace.

Connect directly with genuine property owners across major educational hubs and IT parks in Pune. Schedule physical visits, chat directly on WhatsApp, and secure your room deposit with 100% escrow protection.

🎯 WHY STUDENTS LOVE STAYDIRECT PUNE:

✅ 100% ZERO BROKERAGE GUARANTEE
Never pay 15-day or 1-month brokerage to middlemen. Save between ₹5,000 to ₹25,000 upfront on every booking.

✅ VERIFIED PROPERTY OWNERS & LISTINGS
Every listing undergoes on-ground and document verification — including electricity bill and PMC property tax cross-checks.

✅ TOP PUNE STUDENT HUBS COVERED
Find twin-sharing, triple-sharing, and private single rooms near your college or company:
• Fergusson College Road (FC Road) & Deccan Gymkhana
• Kothrud (MIT, Bharati Vidyapeeth, Cummins)
• Viman Nagar (Symbiosis Campus, Phoenix Marketcity)
• Hinjawadi IT Park (Phase 1, 2, 3)
• Wakad & Pimple Saudagar
• Shivaji Nagar & COEP Tech
• Karve Nagar, Baner, and SB Road

✅ TRANSPARENT PRICING & DEPOSIT ESCROW
Clear monthly rent breakdowns including meals (mess), high-speed Wi-Fi, laundry, and electricity policies. Pay token deposits securely through Razorpay UPI, Netbanking, or debit card — held safely in escrow until you verify the room in person.

✅ GENUINE STUDENT REVIEWS
Read authentic feedback from students who have actually stayed at the property. Ratings cover cleanliness, mess food quality, 24/7 CCTV safety, and warden support.

✅ DIRECT OWNER CONTACT
Call or WhatsApp verified landlords in one tap. No fake contact numbers or broker callbacks.

---
🏢 FOR HOSTEL & PG OWNERS:
• List your property in under 3 minutes
• Zero commission on bookings
• Reach thousands of students from COEP, Symbiosis, MIT-WPU, Bharati Vidyapeeth, and Fergusson
• Dedicated Pune support team for instant listing verification

Download StayDirect Pune today and find your verified college stay without middleman broker fees!
```

---

## 2. Store Assets & Visual Specifications

| Asset | Dimensions | Format | Requirement |
| :--- | :--- | :--- | :--- |
| **App Icon** | 512 x 512 px | 32-bit PNG (no alpha) | Deep Forest Green (`#00362A`) background with minimalist StayDirect roof icon |
| **Feature Graphic** | 1024 x 500 px | JPG or 24-bit PNG | Bold headline: "Zero Brokerage Hostels in Pune", high-contrast badges |
| **Phone Screenshots** | 1080 x 1920 px (min 4) | PNG/JPG | 1. Discovery & Search<br>2. Verified Listing Details<br>3. Room Sharing Tiers<br>4. Deposit Escrow & Reviews |
| **Tablet Screenshots** | 7-inch & 10-inch | PNG/JPG | Optional, recommended for Play Store tablet badge |

---

## 3. Data Safety Form & Declarations

| Category | Data Collected | Purpose | Shared with 3rd Parties? |
| :--- | :--- | :--- | :--- |
| **Personal Info** | Name, Phone Number, College/Company | Account authentication & Direct owner chat | No |
| **Financial Info** | UPI / Transaction ID (via Razorpay SDK) | Booking deposits and refund processing | Processed securely by PCI-DSS certified Razorpay |
| **Location** | Approximate & Precise Location | Distance calculations to colleges & Pune maps | No |
| **Photos & Videos** | Property photos, Electricity bills | Owner property verification | Stored in Supabase encrypted storage |

- **Encryption in Transit**: Yes (HTTPS / TLS 1.3 enforced)
- **Account Deletion**: Yes (Students and owners can delete account and personal profile in Settings)
- **Target Audience**: 18+ (College students & young professionals)
- **Content Rating**: Everyone / PEGI 3

---

## 4. Production Release Build Commands (EAS / Android)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Configure EAS Build
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://<your-project-id>.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "<your-production-anon-key>",
        "EXPO_PUBLIC_RAZORPAY_KEY_ID": "rzp_live_XXXXXXXXXXXX"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Step 3: Run Android App Bundle (AAB) Build
```bash
eas build --platform android --profile production
```

### Step 4: Submission Workflow
1. Upload generated `.aab` file to **Google Play Console > Internal Testing Track**.
2. Invite Pune campus ambassadors for test runs across various Android devices (Samsung OneUI, Xiaomi MIUI, Google Pixel).
3. Promote to **Closed Testing**, verify crash logs and analytics for 7 days.
4. Promote to **Production Track** with staged rollout (20% -> 50% -> 100%).
