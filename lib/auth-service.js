import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

// Check if Firebase is properly initialized
function checkFirebaseInitialization() {
  if (!auth || !db) {
    throw new Error(
      'Firebase is not properly initialized. Please check your environment variables and Firebase configuration.'
    );
  }
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} userData - Additional user data (firstName, lastName, company, role)
 * @returns {Promise<Object>} - User data or error
 */
export async function signUpWithEmail(email, password, userData = {}) {
  try {
    checkFirebaseInitialization();
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    if (userData.firstName && userData.lastName) {
      try {
        await updateProfile(user, {
          displayName: `${userData.firstName} ${userData.lastName}`
        });
      } catch (profileError) {
        console.warn('Could not update user profile:', profileError);
      }
    }

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      company: userData.company || '',
      role: userData.role || '',
      organizationSize: userData.organizationSize || '',
      language: userData.language || 'en',
      createdAt: new Date(),
      lastUpdated: new Date(),
      emailVerified: user.emailVerified,
      status: 'active',
      provider: 'email'
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userDoc);
      console.log('✅ Created user document for email sign-up');
    } catch (firestoreError) {
      console.error('Error creating user document:', firestoreError);
      // Return success anyway since the user is authenticated
      // The document can be created later if needed
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      userData: userDoc
    };
  } catch (error) {
    console.error('Error signing up with email:', error);
    
    let errorMessage = 'An error occurred during sign up.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Please sign in instead.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'permission-denied':
        errorMessage = 'Permission denied. Please try again or contact support.';
        break;
      default:
        errorMessage = error.message || 'An error occurred during sign up.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data or error
 */
export async function signInWithEmail(email, password) {
  try {
    checkFirebaseInitialization();
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } catch (firestoreError) {
      console.warn('Could not read user document:', firestoreError);
      // Continue without user data - the user is still authenticated
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      userData
    };
  } catch (error) {
    console.error('Error signing in with email:', error);
    
    let errorMessage = 'An error occurred during sign in.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'permission-denied':
        errorMessage = 'Permission denied. Please try again or contact support.';
        break;
      default:
        errorMessage = error.message || 'An error occurred during sign in.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} - User data or error
 */
export async function signInWithGoogle() {
  try {
    checkFirebaseInitialization();
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    let userDoc;
    let userData = null;

    try {
      userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
    } catch (firestoreError) {
      console.warn('Could not read existing user document:', firestoreError);
      // Continue with creating new user document
    }

    if (!userDoc || !userDoc.exists()) {
      // Create new user document for Google sign-in
      const newUserData = {
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        company: '',
        role: '',
        organizationSize: '',
        language: 'en',
        createdAt: new Date(),
        lastUpdated: new Date(),
        emailVerified: user.emailVerified,
        status: 'active',
        provider: 'google'
      };

      try {
        await setDoc(userDocRef, newUserData);
        userData = newUserData;
        console.log('✅ Created new user document for Google sign-in');
      } catch (setDocError) {
        console.error('Error creating user document:', setDocError);
        // Return success anyway since the user is authenticated
        // The document can be created later if needed
      }
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      userData
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    let errorMessage = 'An error occurred during Google sign in.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign in was cancelled.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign in popup was blocked. Please allow popups for this site.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with this email using a different sign-in method.';
        break;
      case 'permission-denied':
        errorMessage = 'Permission denied. Please try again or contact support.';
        break;
      default:
        errorMessage = error.message || 'An error occurred during Google sign in.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Success or error
 */
export async function resetPassword(email) {
  try {
    checkFirebaseInitialization();
    
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent successfully.'
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    let errorMessage = 'An error occurred while sending the reset email.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      default:
        errorMessage = error.message || 'An error occurred while sending the reset email.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    checkFirebaseInitialization();
    
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: 'An error occurred while signing out.'
    };
  }
}

/**
 * Get current user
 * @returns {Object|null} - Current user or null
 */
export function getCurrentUser() {
  if (!auth) {
    console.warn('Firebase auth is not initialized');
    return null;
  }
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} - Unsubscribe function
 */
export function onAuthStateChange(callback) {
  if (!auth) {
    console.warn('Firebase auth is not initialized');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
} 

/**
 * Update user data in Firestore
 * @param {string} uid - User's UID
 * @param {Object} userData - User data to update
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} - Success or error
 */
export async function updateUserData(uid, userData) {
  try {
    checkFirebaseInitialization();
    
    const userDocRef = doc(db, 'users', uid);
    
    // Add lastUpdated timestamp
    const updateData = {
      ...userData,
      lastUpdated: new Date()
    };
    
    await updateDoc(userDocRef, updateData);
    
    return {
      success: true,
      message: 'User data updated successfully.'
    };
  } catch (error) {
    console.error('Error updating user data:', error);
    
    let errorMessage = 'An error occurred while updating user data.';
    
    switch (error.code) {
      case 'permission-denied':
        errorMessage = 'Permission denied. Please try again or contact support.';
        break;
      default:
        errorMessage = error.message || 'An error occurred while updating user data.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
} 