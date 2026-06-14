# 🔥 Firebase Full-Stack Deployment - TPPO Whiteboard

## ⚠️ IMPORTANT

Firebase Full-Stack requires:
- ✅ Google Cloud Account (free tier available)
- ✅ Firebase Project setup
- ✅ Firestore Database (replaces PostgreSQL)
- ✅ Firebase CLI installed

---

## 📋 SETUP (30 minutes)

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com
2. Click **+ Add project**
3. **Project name:** `bangtrang-app`
4. Accept terms & **Create project**
5. Wait for project creation (2-3 min)

### Step 2: Enable Services

In Firebase Console:
1. **Firestore Database**
   - Click **Build** → **Firestore Database**
   - Click **Create Database**
   - Location: **asia-southeast1** (Singapore)
   - Security rules: **Start in test mode**
   - Click **Create**

2. **Cloud Functions**
   - Click **Build** → **Functions**
   - Enable if not already enabled
   - Choose region: **asia-southeast1**

### Step 3: Get Credentials

1. Click **⚙️ Settings** → **Project settings**
2. Click **Service Accounts**
3. Click **Generate New Private Key**
4. Save JSON file as `firebase-key.json` (DON'T commit!)

### Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use bangtrang-app
```

---

## 🚀 DEPLOY

### Step 1: Build Frontend

```bash
cd packages/client
npm install
npm run build
```

### Step 2: Deploy to Firebase

```bash
# From root directory
firebase deploy

# This will:
# ✅ Deploy frontend to Hosting
# ✅ Deploy backend to Cloud Functions
# ✅ Create API endpoint
```

### Step 3: Get URLs

After deployment:

```
Frontend: https://bangtrang-app.web.app
API:      https://asia-southeast1-bangtrang-app.cloudfunctions.net/api
```

---

## 📝 Update Frontend API URL

In `packages/client/.env.production`:

```
VITE_API_URL=https://asia-southeast1-bangtrang-app.cloudfunctions.net/api
```

Or in Vercel/Hosting environment variables.

---

## ⚠️ LIMITATIONS

### WebSocket Not Supported

Firebase Cloud Functions don't support long-running connections.

**Solution:** Use REST API instead of WebSocket (will need code changes)

### Firestore vs PostgreSQL

Need to rewrite database code:
- PostgreSQL → Firestore
- SQL queries → Firestore queries
- Connection strings → Firebase SDK

---

## 🔧 NEXT STEPS

1. ✅ Firebase project created
2. ✅ Config files added
3. ⏳ Database: Rewrite PostgreSQL code for Firestore
4. ⏳ Backend: Update API routes for Firestore
5. ⏳ Deploy

---

## 💡 RECOMMENDATION

Given WebSocket & database complexity, consider:

**Alternative: Keep Vercel + Railway**
- Simpler setup
- Full WebSocket support
- PostgreSQL unchanged
- Already partially working

vs

**Full Firebase**
- Requires significant code changes
- No WebSocket support
- Different database (Firestore)
- Takes 2-3 hours to implement

---

## 📞 SUPPORT

For Firebase deployment questions:
- https://firebase.google.com/docs
- https://cloud.google.com/functions/docs

---

**Decision needed:** Proceed with Firebase rewrite, or fallback to Vercel + Railway?
