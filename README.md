# RideConnect — Universal Rider & Passenger Website

Responsive ride-request website prototype with Firebase Authentication, Firestore driver/booking records, Cloudinary driver and vehicle photos, and Firebase Storage for driving-licence files.

## Included
- Passenger search by country, city/area, pickup and destination.
- Drivers must provide licence details, vehicle details, photos, routes and prices.
- Driver and vehicle photos upload to Cloudinary using the supplied cloud name and unsigned preset.
- Licence file upload uses Firebase Storage; licence metadata is stored separately in a private Firestore document. Licence expiry is checked in the browser; actual licence verification still requires a trusted admin/backend process.
- Firebase Authentication for driver and passenger accounts.
- Firestore shared driver profiles, route prices and ride requests.
- Drivers can accept/decline; passengers can cancel pending requests.
- No payment gateway or in-app payment collection.

## Setup before testing
1. Extract this ZIP and deploy the folder to HTTPS hosting (Firebase Hosting or another static host). ES modules generally should not be opened as `file://`.
2. In Firebase Console for project `neostore-81b57`, enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database. Publish `firestore.rules` as the starting rules, then review and tighten them before launch.
4. Enable **Firebase Storage** and publish `storage.rules`. The licence files contain sensitive personal data; use least-privilege rules and a trusted admin review process.
5. In Cloudinary, ensure preset `starcode` is configured as an **unsigned image upload preset**. The website uploads only driver profile and vehicle photos to Cloudinary.
6. Deploy and test registration, login, image upload, driver search, bookings and status changes with two separate accounts/devices.

## Important production notes
- Firebase browser configuration is designed to be included in web apps, but access must be secured with Firebase Security Rules, App Check, quotas and monitoring. Never place service-account/private keys in this folder.
- The provided rules are a starting point, not a complete production authorization design. In particular, booking updates need stricter field-level validation, driver identity/licence review should be performed by a trusted admin or backend, and licence document access must not be made public.
- The current `online` field is a manually selected profile setting, not true real-time presence. For accurate online status, implement Firebase Realtime Database presence with connection monitoring and heartbeat/expiry logic.
- Exact route matching is currently text-based. GPS-based proximity, maps, geocoding, notifications, driver/passenger messaging and regional compliance are future additions.
- No payment processing is included.


## Account access and email verification update
- Passenger and driver registrations send a Firebase email-verification link. The account is signed out after registration; the user must verify the email and then log in.
- Unverified accounts cannot log in to use booking/request features. A login attempt can resend the verification email.
- Navigation switches between **Log in** and **Log out** based on the authenticated session. Log out signs out of Firebase and returns to the home page; the navigation then shows **Log in**.
- Passenger accounts cannot open the driver registration page while logged in or use the driver-request tab. Driver accounts are routed to their driver requests after login.
- The updated `firestore.rules` also restricts booking creation to verified passenger accounts, passenger updates to cancelling their own pending request, and driver updates to accepting/declining pending requests for their own driver profile. Publish the new rules in Firebase Console.
- Firebase Authentication must have **Email/Password** enabled. For local development, serve the files through an HTTP/HTTPS web server; do not open them directly with `file://`.

## Fix Firebase Storage CORS errors during driver registration
If the browser reports that the request to `firebasestorage.googleapis.com` was blocked by CORS during licence upload, this cannot be fixed by JavaScript alone. The Storage bucket must exist, Storage must be enabled, the rules must be published, and the bucket CORS configuration must allow your development/production origins.

1. In Firebase Console → **Storage**, make sure a default bucket has been created for this project. Check the exact bucket name in the Storage page and make sure it matches `storageBucket` in `js/firebase-config.js`.
2. Publish the included `storage.rules` in Firebase Storage → Rules.
3. Install Google Cloud CLI and authenticate with an account that has permission to configure the bucket. Edit `cors.json`: replace `https://YOUR-PRODUCTION-DOMAIN` with your real HTTPS site origin (no path or trailing slash). Keep `http://localhost:8080` for local testing.
4. Apply the CORS file to the exact bucket name shown in Firebase Console. For the configured bucket, the command is:

   `gcloud storage buckets update gs://neostore-81b57.firebasestorage.app --cors-file=cors.json`

   If Firebase Console shows a different bucket name, use that exact bucket instead. CORS changes may take a few minutes to propagate.
5. Reload the site and retry the driver registration. If the error persists, inspect the Network tab for the failed OPTIONS request's HTTP status. A 404 usually means the bucket name/bucket is wrong or not created; a 401/403 points to permissions/rules or Storage setup.

**Important:** the CORS configuration is project/bucket-side configuration; adding `cors.json` to the website alone does not apply it. Do not make licence documents public to work around this error.

## Staged onboarding, ride search and dashboards (latest update)
- Driver onboarding is now split into five saved stages at `driver.html?stage=profile`, `licence`, `vehicle`, `routes`, and `verification`. Each stage saves before moving to the next. The verification stage sends/resends the Firebase email verification link and lets the driver refresh verification status before opening `driver-dashboard.html`.
- Home-page search redirects to `find-ride.html`, which lists online drivers whose saved routes match the pickup and destination. A driver must be online and have a verified email to appear.
- Selecting a driver opens a ride request page. A passenger must register/log in and verify their email before submitting a booking. The request then appears in the driver's dashboard/request list.
- Passengers can cancel pending and accepted requests. A required reason is saved with the cancellation so the driver can see it. Publish the included updated `firestore.rules` to allow cancellation with a reason.
- Driver dashboard at `driver-dashboard.html` includes an online/offline toggle and route management (add, edit and delete). Turning availability off removes the driver from search.
- The home page cycles its registration CTA between driver registration and passenger registration every five seconds.
- Passenger dashboard is `bookings.html`; driver requests are shown at `bookings.html?view=driver` and from the dedicated driver dashboard.

**Reminder:** These pages use client-side Firebase SDK code. Review the Firestore rules and add server-side/Admin SDK validation before production. The online toggle is manual availability, not a guaranteed live GPS presence indicator. Licence review remains a separate administrative process.

## Licence-stage save fix and admin account moderation
- Fixed the driver licence stage's expiry-field bug that could stop the stage from saving. Licence metadata is saved to the private `driverPrivate/{uid}` record, and the onboarding advances to vehicle information after a successful save.
- Licence uploads now use Cloudinary rather than Firebase Storage, avoiding the Firebase Storage browser CORS preflight that blocked local registration. The Cloudinary unsigned upload preset must allow the image formats in use and PDF/raw uploads if you want to upload PDF licences. Licence links are kept in the private Firestore record and are shown to administrators only in the admin UI; Cloudinary unsigned delivery URLs are not true access-controlled storage, so for a production service use a private document-storage service or authenticated delivery for identity documents.
- New admin page: `admin.html`. It shows passenger and driver profiles, private driver licence details, vehicle information and available profile/vehicle/licence links. Admins can tick incorrect fields, add correction instructions, suspend the account for seven days, and approve/reinstate an account after reviewing corrections.
- To grant admin access, create or use an Auth account, copy its Firebase Auth UID, then create a Firestore document `admins/{UID}` with `{ "role": "admin" }` using the Firebase Console. The web rules intentionally prevent users from granting themselves admin status. Log in with that email and open `admin.html`.
- Suspended users see a correction form in their own dashboard. They can submit corrected information and the account remains suspended with `correctionStatus: "pending_review"` until an admin approves it. The correction submission creates an unread admin notification record.
- Added scheduled Cloud Function at `functions/index.js`. It checks hourly and deletes the Firebase Auth account, profile document, private driver licence record and related bookings when a seven-day suspension expires without a correction submission. If the user submitted corrections on time, the account remains suspended pending admin review rather than being deleted while the admin decision is pending.
- To enable automatic deletion, install Firebase CLI, run `firebase login`, then from this `ridefix` directory run `firebase deploy --only firestore:rules,functions`. Scheduled functions require the Firebase project to use the Blaze (pay-as-you-go) plan and Cloud Scheduler billing/setup. Review and test deletion behavior with test accounts before production.
- The updated `firestore.rules` lets only admins review all user/private licence data and change suspension status. Publish these rules in Firebase Console or deploy them using Firebase CLI. Create the `admins/{UID}` document in the console before opening the admin page.
