// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Check if environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Function to check if all required environment variables are available
const checkEnvVars = () => {
  return requiredEnvVars.filter(varName => !process.env[varName]);
};

// Function to initialize Firebase with retry mechanism
const initializeFirebaseWithRetry = (maxRetries = 5, delay = 1000) => {
  return new Promise<{
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
    analytics: Analytics | null;
  }>((resolve, reject) => {
    let attempts = 0;
    
    const tryInitialize = () => {
      attempts++;
      const missingVars = checkEnvVars();
      
      if (missingVars.length === 0) {
        // All environment variables are available, proceed with initialization
        try {
          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: "dot-science",
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Only if you use Analytics
          };

          const app = initializeApp(firebaseConfig);
          
          // Initialize Firebase services
          const auth = getAuth(app);
          const db = getFirestore(app);
          const storage = getStorage(app);
          
          // Initialize Analytics only in browser environment
          let analytics: Analytics | null = null;
          if (typeof window !== 'undefined') {
            analytics = getAnalytics(app);
          }
          
          console.log('✅ Firebase initialized successfully');
          resolve({ app, auth, db, storage, analytics });
        } catch (error) {
          console.error('❌ Firebase initialization failed:', error);
          reject(error);
        }
      } else if (attempts < maxRetries) {
        // Environment variables not ready yet, retry after delay
        console.log(`⏳ Environment variables not ready (attempt ${attempts}/${maxRetries}), retrying in ${delay}ms...`);
        setTimeout(tryInitialize, delay);
      } else {
        // Max retries reached, use fallback
        console.warn('⚠️  Max retries reached, using mock Firebase objects');
        resolve({ app: null, auth: null, db: null, storage: null, analytics: null });
      }
    };
    
    tryInitialize();
  });
};

// Initialize Firebase with retry mechanism
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

// Start initialization immediately
initializeFirebaseWithRetry().then((firebaseServices) => {
  app = firebaseServices.app;
  auth = firebaseServices.auth;
  db = firebaseServices.db;
  storage = firebaseServices.storage;
  analytics = firebaseServices.analytics;
}).catch((error) => {
  console.error('❌ Firebase initialization failed after retries:', error);
  
  // Create mock objects for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using mock Firebase objects for development');
    app = null;
    auth = null;
    db = null;
    storage = null;
    analytics = null;
  } else {
    throw error;
  }
});

export { app, auth, db, storage, analytics };