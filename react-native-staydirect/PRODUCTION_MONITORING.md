# StayDirect Pune — Production Monitoring & Launch Runbook

## 1. Production Monitoring Architecture

### 1.1 Error and Crash Reporting
StayDirect uses a two-tier monitoring approach:
1. **Client-Side (React Native / Android)**:
   - Exception boundary captures runtime JavaScript errors before rendering breaks.
   - Sentry / Datadog integration catches native Android ANRs and crashes.
   - Initialized without PII leakage via `src/lib/logger.ts`.

2. **Server-Side (Supabase Edge Functions & Database)**:
   - Supabase Edge Function logs viewable under:
     `https://app.supabase.com/project/<project-id>/functions`
   - Real-time invocation error rates, execution duration, and CPU memory limits.
   - PostgreSQL logs for slow queries, deadlock detection, and connection pool saturation under:
     `https://app.supabase.com/project/<project-id>/database/logs`

### 1.2 Safe Logging Policy (Zero PII / PCI Compliance)
All log messages routed through `src/lib/logger.ts` are automatically scrubbed:
- **Payment Information**: Card numbers (16 digits) and CVVs are completely masked (`XXXX-XXXX-XXXX-1234`).
- **Razorpay Keys & Secrets**: Secret tokens redacted (`rzp_live_****`).
- **Student Contact Details**: Phone numbers partially masked (`+91-XXXXX-1234`), email addresses masked (`ad***@gmail.com`).
- **Authentication**: Bearer tokens and session refresh secrets replaced with `[REDACTED_SECURITY_DATA]`.

---

## 2. Viewing Production Logs

| Service | Log Location | What to Monitor |
| :--- | :--- | :--- |
| **Supabase Auth** | Supabase Dashboard > Auth > Logs | High failed OTP/login attempts, brute force rate-limits |
| **Database & RLS** | Supabase Dashboard > Database > Logs | `permission denied for table`, slow queries (>200ms) |
| **Edge Functions** | Supabase Dashboard > Edge Functions > `create-payment-order` & `verify-payment` | Non-200 responses, signature mismatch errors |
| **Razorpay Webhooks** | Razorpay Dashboard > Settings > Webhooks > Logs | `payment.captured`, `refund.processed` delivery failures |
| **Mobile App (Android)** | Google Play Console > Android Vitals | Crash rate (< 1.09% target), ANR rate (< 0.47% target) |

---

## 3. Emergency Maintenance & Incident Response

### 3.1 Maintenance Mode Trigger
In the event of a payment gateway outage or urgent database migration:
1. Navigate to **Admin Dashboard > Platform & Escrow Settings**.
2. Toggle **Maintenance Mode** to `ON`.
3. Set the student announcement banner (e.g., *"Scheduled maintenance until 05:00 AM IST"*).
4. All booking creation and deposit checkouts are gracefully halted with a friendly alert.

### 3.2 Payment Escrow Dispute Handling
If a student reports that room conditions do not match the listing:
1. Admin visits **Admin Dashboard > Payments & Refunds**.
2. Locate the transaction ID or student name.
3. Click **"Initiate Refund"** — calls `supabase.functions.invoke('process-refund')`.
4. Razorpay returns funds directly to the student's original UPI/account within 2–3 business days.

---

## 4. Final Launch Verification Checklist

- [x] **Database & Migrations**: All 8 migration files verified and synced to root `/supabase/migrations/`.
- [x] **Zero Brokerage Policies**: RLS policies enforce student and owner roles; admin functions restricted via `is_admin()`.
- [x] **Soft-Deletion Enabled**: `deleted_at` filters active on hostels, bookings, and reviews.
- [x] **Reviews & Ratings**: Student reviews system complete with category breakdowns (Cleanliness, Food, Safety, Value).
- [x] **Deposit Escrow & Payments**: Razorpay order generation and signature verification abstraction prepared.
- [x] **Recently Viewed Hostels**: Local cache allows rapid re-access of inspected properties.
- [x] **Admin Moderation**: Complete with Verifications, Listings, Payments, Audit logs, and Platform settings.
- [x] **Android Configuration**: `app.json` configured with permissions, package `com.staydirect.pune`, and portrait orientation.
- [x] **Safety & Error States**: `StateFeedback` component with tailored states for offline, empty results, payment failures, and verification reviews.
- [x] **Play Store Assets**: Complete description, short description, keywords, and data safety specifications documented in `PLAY_STORE_RELEASE.md`.
