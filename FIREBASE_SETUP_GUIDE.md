# Firebase Setup Guide

This guide will help you set up Firebase Authentication for your project.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "hermes-dot-science")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", configure OAuth consent screen if needed, and save

## Step 3: Get Your Firebase Configuration

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Hermes Web App")
5. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Create Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables with your actual Firebase values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Configure Firestore Database

1. In your Firebase project, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click **Done**

## Step 6: Update Firestore Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leads collection - only Cloud Functions can write, authenticated users can read their own
    match /leads/{leadId} {
      allow read: if request.auth != null && 
        (request.auth.token.email == resource.data.email || 
         request.auth.token.email_verified == true);
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Requests collection - only Cloud Functions can write, authenticated users can read their own
    match /requests/{requestId} {
      allow read: if request.auth != null && 
        (
          // User can read if they are the requester (lead or user)
          (resource.data.requester.type == "lead" && 
           exists(/databases/$(database)/documents/leads/$(resource.data.requester.id)) &&
           request.auth.token.email == get(/databases/$(database)/documents/leads/$(resource.data.requester.id)).data.email) ||
          (resource.data.requester.type == "user" && 
           resource.data.requester.id == request.auth.uid) ||
          // User can read if they are the recipient
          (resource.data.recipient.type == "user" && 
           resource.data.recipient.id == request.auth.uid) ||
          // User can read if they belong to the recipient unit (you can implement unit membership logic)
          (resource.data.recipient.type == "unit" && 
           request.auth.token.email_verified == true)
        );
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

## Step 7: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Check the browser console for Firebase initialization messages:
   - ✅ "Firebase initialized successfully" = Good
   - ❌ "Firebase Configuration Error" = Check your environment variables

3. Test the authentication:
   - Go to `http://localhost:3000/en/sign-up`
   - Try creating an account
   - Check if the user appears in Firebase Console > Authentication > Users

## Troubleshooting

### Error: "auth/invalid-api-key"
- **Cause**: Missing or incorrect API key
- **Solution**: Check your `.env.local` file and ensure `NEXT_PUBLIC_FIREBASE_API_KEY` is correct

### Error: "auth/operation-not-allowed"
- **Cause**: Email/password authentication not enabled
- **Solution**: Enable Email/Password in Firebase Console > Authentication > Sign-in method

### Error: "auth/unauthorized-domain"
- **Cause**: Domain not authorized for Firebase
- **Solution**: Add `localhost` to authorized domains in Firebase Console > Authentication > Settings > Authorized domains

### Environment Variables Not Loading
- **Cause**: Next.js not reading `.env.local`
- **Solution**: 
  1. Make sure the file is named exactly `.env.local`
  2. Restart your development server
  3. Check that variables start with `NEXT_PUBLIC_`

### Google Sign-in Not Working
- **Cause**: Google provider not configured
- **Solution**: 
  1. Enable Google sign-in in Firebase Console
  2. Configure OAuth consent screen if needed
  3. Add your domain to authorized domains

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use environment-specific configurations** for production
3. **Enable email verification** for production apps
4. **Set up proper Firestore rules** before going live
5. **Monitor authentication logs** in Firebase Console

## Production Deployment

When deploying to production:

1. **Update authorized domains** in Firebase Console
2. **Set production environment variables** in your hosting platform
3. **Update Firestore rules** for production security
4. **Enable email verification** and other security features
5. **Set up monitoring** and error tracking

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled in your project
4. Check the Firebase Console for any configuration issues
5. Review the [Firebase Documentation](https://firebase.google.com/docs)

## Quick Test

To quickly test if your Firebase setup is working:

1. Open browser console
2. Look for Firebase initialization messages
3. Try the sign-up page
4. Check if users appear in Firebase Console

If you see "✅ Firebase initialized successfully" in the console, your setup is working correctly! 