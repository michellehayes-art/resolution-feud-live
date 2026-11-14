# Resolution Feud — Google Play Publishing & Monetization Guide

Save this file for whenever you are ready to publish your app to the Google Play Store. Everything has already been pre-configured in your codebase!

---

## 1. Your Live App Links (Permanent & Free)
Your app is already live and hosted online. You do NOT have to pay anything to keep it running or to share it with friends and family:

- **Live App URL (Share with anyone):**  
  `https://ais-pre-2xpp4t4vthuz7h5hbcoabj-32559284583.us-east5.run.app`
- **Your Project ID:** `953ca022-a7ad-472b-93be-edd79ddc68f6`
- **Account:** Associated with `michellehayes5117@gmail.com`

---

## 2. Install on Your Android Phone Today for $0 (No Fee)
You do not need to pay the $25 Google Play fee to put the app on your phone:
1. Open Chrome on your Android phone.
2. Go to: `https://ais-pre-2xpp4t4vthuz7h5hbcoabj-32559284583.us-east5.run.app`
3. Tap **"Install App"** in the top bar, or tap the three dots in Chrome $\rightarrow$ **"Install App"** / **"Add to Home Screen"**.
4. The app icon will appear on your home screen and in your phone's app list. It opens fullscreen just like a native store app!

---

## 3. When You Are Ready to Publish to Google Play ($25 One-Time)
Whenever you are ready in the future, follow these 4 simple steps:

### Step 1: Generate your Google Play Package (.aab)
1. Go to the free tool [PWABuilder.com](https://www.pwabuilder.com).
2. Enter your app URL:  
   `https://ais-pre-2xpp4t4vthuz7h5hbcoabj-32559284583.us-east5.run.app`
3. Click **Start**. The score will be 100% because all icons, manifests, and service workers are already built.
4. Click **Package for Store** $\rightarrow$ select **Android**.
5. Download the `.aab` (Android App Bundle) file to your computer.

### Step 2: Create Your Google Play Developer Account with Your New Gmail
1. Open your browser and go to [play.google.com/console](https://play.google.com/console).
2. **Important**: Make sure you are signed in with your **new personal Gmail account** (tap the profile icon in the top right to verify).
3. When asked for account type, select **"Yourself / Personal"** (do NOT pick Organization, Business, or Non-profit).
4. Pay the one-time $25 registration fee (this lets you publish unlimited apps for life with no monthly fees).
5. Complete standard identity verification (government ID).

> **Note**: You do NOT need to "move" or "transfer" your code from AI Studio. Google Play connects to your app through the `.aab` file you download from PWABuilder!

### Step 3: Fill Out Your Store Listing
- **App Name:** Resolution Feud
- **Category:** Games $\rightarrow$ Trivia / Casual
- **Short Description:** The conflict-resolution game show where couples and friends buzz in, solve disputes, and discover top survey answers.
- **App Icon:** Already saved in your project at `public/pwa-512x512.png`.
- **Screenshots:** Take 2 to 4 screenshots of the Face-Off podium and the 3D flip board directly from your browser or phone.

### Step 4: Upload and Publish
- Go to **Release** $\rightarrow$ **Production** in the Google Play Console.
- Upload the `.aab` file you downloaded from PWABuilder.
- Click **Review and Rollout**. Google will review your app (typically 1–3 days) and it will go live for everyone on Google Play!

---

## 4. Making It a Paid App Only (Upfront Purchase)

**Yes, you can absolutely make Resolution Feud a paid-only app!**

When set up as a Paid App, anyone who finds your game on Google Play must purchase it (e.g., **$1.99, $2.99, or $4.99**) before the "Download / Install" button unlocks.

### Why Paid-Only is a Great Strategy for This Game:
1. **100% Ad-Free**: Couples and party players prefer paying once rather than suffering annoying banner ads mid-argument.
2. **No Coding Needed**: Google Play acts as the gatekeeper. You don't need any in-app billing code because Google will not allow anyone to download the app without paying first.
3. **Keep 85% of Every Sale**: Google takes only 15% (under Google's 15% tier for your first $1,000,000/year). On a $2.99 download, you receive **~$2.54 directly deposited to your bank**.

### How to Set It as a Paid App in Google Play Console:

#### Step A: Select "Paid" During App Creation
1. Inside [play.google.com/console](https://play.google.com/console), click **Create app**.
2. Under **"Free or Paid"**, select **Paid**!
   > ⚠️ **CRITICAL RULE**: Google allows you to change a *Paid* app into a *Free* app later, but **you can NEVER change a Free app into a Paid app**. You MUST select **Paid** when first creating the app!

#### Step B: Link Your Bank Account (Merchant Profile)
1. In Google Play Console, open the left menu $\rightarrow$ scroll down to **Settings** $\rightarrow$ click **Payments profile**.
2. Click **Create payments profile**.
3. Enter your legal name/business info and link your bank account (routing & account number).
4. Google will send a tiny deposit (a few cents) to verify your account, and all your monthly earnings will go straight to this bank account!

#### Step C: Set Your App Price
1. In Google Play Console, go to **Monetize with Play** $\rightarrow$ **App pricing**.
2. Choose your default price:
   - **$1.99**: Fast impulse buy (high volume).
   - **$2.99 (Recommended)**: The gold standard for indie party games (like *Heads Up!*).
   - **$4.99**: Premium edition.
3. Google will automatically calculate equivalent local currency pricing for 170+ countries worldwide.
4. Click **Save changes**!

---

## 5. Do You Need to Add the Romance Version in the Price on Google Play Console?

You have two choices, depending on how you want to charge your players:

### Choice 1 (Recommended for Paid Apps): Bundle Everything into ONE Upfront App Price
If you want **Resolution Feud** to be a **Paid-Only App** (e.g. $2.99 to download):
- **NO**, you do **NOT** need to add a separate price for the Romance Version!
- In Google Play Console, you only set the **App pricing** once under **Monetize with Play > App pricing** (e.g., $2.99).
- When players purchase and download the game, **all game modes are automatically unlocked**, including:
  - Couples Face-Off
  - **Spicy Romance Edition**
  - Solo vs Coach Bot
  - Party / Friends Mode
- **Why this is the easiest**: Zero extra configuration. Google handles the $2.99 payment upfront, and you never have to configure in-app purchases.

---

### Choice 2: Selling the Romance Edition as an In-App Purchase (Extra Add-On)
If you prefer to sell the Romance Version as a separate add-on inside the app:
1. In Google Play Console, go to **Monetize with Play** $\rightarrow$ **Products** $\rightarrow$ **In-app products**.
2. Click **Create product**.
3. Fill in the details:
   - **Product ID**: `spicy_romance_pack`
   - **Name**: `Spicy & Romance Edition`
   - **Description**: `20 intimate relationship questions, date night priorities, and communication tips.`
   - **Price**: `$2.99`
4. Click **Save** and **Activate**.
*(Note: This is only needed if you want players to pay an extra fee inside the game after installing).*

---

## 6. Summary of Your Revenue Strategy
1. **Paid App Only ($2.99 upfront)**: Best experience. Players pay once to download, get all modes including Romance, with zero ads.
2. **You keep 85% of every sale**: Deposited automatically to your bank account every month by Google.

---

## 5. How App Updates Work on Google Play

### The Best Part: Automatic Live Updates (No Re-upload Needed!)
Because Resolution Feud is a modern Progressive Web App (PWA) running via Google's Trusted Web Activity (TWA):
- Whenever you make changes in AI Studio (like adding questions, changing colors, or adding animations), **the changes are automatically and instantly live on your users' devices**!
- You do **NOT** have to re-build or re-submit a new `.aab` file to Google Play for regular game updates. The app's service worker automatically refreshes and serves your latest code!

### When You DO Need to Upload a New Package to Google Play:
You only need to upload an update to Google Play Console if you want to change:
- The app's native name or home screen launcher icon.
- Google Play Store screenshots or store description.
- Major native version increments.

### Steps to Upload a New Version (e.g. Version 1.1 or 2.0):
1. Open [PWABuilder.com](https://www.pwabuilder.com) and paste your live app URL.
2. In the Android settings, increase the **Version Code** by 1 (e.g., from `1` to `2`) and set the new **Version Name** (e.g., `1.1.0`).
3. Click **Package** and download the new `.aab` file.
4. In your [Google Play Console](https://play.google.com/console):
   - Go to **Release** $\rightarrow$ **Production**.
   - Click **Create new release**.
   - Upload the new `.aab` file and write your release notes (e.g., *"Added celebratory confetti animations and audio status indicators!"*).
   - Click **Save** and **Rollout Release**!

---

*This guide is permanently saved in your project root at `GOOGLE_PLAY_PUBLISHING_GUIDE.md`.*
