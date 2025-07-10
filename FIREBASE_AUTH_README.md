# Firebase Authentication Implementation

This project now includes Firebase Authentication for user registration and sign-in functionality.

## Features Implemented

### 1. Authentication Service (`lib/auth-service.js`)
- **Email/Password Registration**: Users can create accounts with email and password
- **Email/Password Sign In**: Users can sign in with their credentials
- **Google Sign In**: Users can sign in using their Google account
- **Password Reset**: Users can request password reset emails
- **Sign Out**: Users can sign out from their accounts
- **User Profile Management**: Automatic creation of user documents in Firestore

### 2. Authentication Context (`contexts/auth-context.tsx`)
- **Global State Management**: Manages authentication state across the application
- **Real-time Updates**: Automatically updates when user signs in/out
- **Loading States**: Handles loading states during authentication checks

### 3. Updated Components

#### Sign Up Page (`components/sign-up-page.tsx`)
- Added password and confirm password fields
- Integrated with Firebase Authentication
- Added validation for password requirements
- Added error handling and display
- Supports both email/password and Google sign-up

#### Sign In Page (`components/sign-in-page.tsx`)
- Added password field
- Integrated with Firebase Authentication
- Added error handling and display
- Supports both email/password and Google sign-in

### 4. Protected Routes (`components/protected-route.tsx`)
- **Route Protection**: Redirects unauthenticated users to sign-in page
- **Loading States**: Shows loading spinner during authentication checks

### 5. User Profile (`components/user-profile.tsx`)
- **User Information Display**: Shows user details and account status
- **Sign Out Functionality**: Allows users to sign out
- **Multi-language Support**: Supports English and Spanish

## Setup Requirements

### 1. Firebase Configuration
Ensure your Firebase project has the following services enabled:
- **Authentication**: Enable Email/Password and Google sign-in methods
- **Firestore**: For storing user data
- **Storage**: For future file uploads (optional)

### 2. Environment Variables
Make sure these environment variables are set in your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Rules
The Firestore rules have been updated to allow authenticated users to read/write their own user documents:

```javascript
// Users collection - authenticated users can read/write their own documents
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Usage Examples

### 1. Using the Auth Context
```tsx
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Welcome, {user?.displayName}!</div>
}
```

### 2. Protecting Routes
```tsx
import ProtectedRoute from "@/components/protected-route"

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### 3. Manual Authentication
```tsx
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth-service"

// Sign up with email/password
const result = await signUpWithEmail(email, password, {
  firstName: "John",
  lastName: "Doe",
  company: "Acme Inc",
  role: "Developer"
})

// Sign in with Google
const result = await signInWithGoogle()
```

## User Data Structure

When a user registers, a document is created in the `users` collection with the following structure:

```javascript
{
  uid: "user_id",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  company: "Acme Inc",
  role: "Developer",
  organizationSize: "1-50",
  language: "en",
  createdAt: Date,
  lastUpdated: Date,
  emailVerified: false,
  status: "active",
  provider: "email" // or "google"
}
```

## Security Features

1. **Password Validation**: Minimum 6 characters required
2. **Email Validation**: Proper email format validation
3. **Error Handling**: Comprehensive error messages for different scenarios
4. **Rate Limiting**: Built-in rate limiting for authentication attempts
5. **Secure Storage**: User data stored securely in Firestore
6. **Session Management**: Automatic session handling with Firebase Auth

## Available Routes

- `/en/sign-up` - User registration page
- `/es/sign-up` - User registration page (Spanish)
- `/en/sign-in` - User sign-in page
- `/es/sign-in` - User sign-in page (Spanish)
- `/en/profile` - User profile page (protected)
- `/es/profile` - User profile page (protected, Spanish)

## Error Handling

The authentication system handles various error scenarios:

- **Invalid Email**: Shows appropriate error message
- **Weak Password**: Validates password strength
- **Email Already in Use**: Handles duplicate email registration
- **Wrong Password**: Shows authentication error
- **User Not Found**: Handles non-existent accounts
- **Network Errors**: Handles connectivity issues
- **Google Sign-in Errors**: Handles popup blocks and cancellations

## Future Enhancements

1. **Email Verification**: Send verification emails to new users
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add more social login providers (Facebook, Twitter, etc.)
4. **Two-Factor Authentication**: Add 2FA support
5. **User Roles**: Implement role-based access control
6. **Profile Management**: Allow users to edit their profiles
7. **Account Deletion**: Allow users to delete their accounts

## Testing

To test the authentication system:

1. Navigate to `/en/sign-up` or `/es/sign-up`
2. Create a new account with email/password or use Google sign-in
3. Sign out and test sign-in functionality
4. Test the protected profile page at `/en/profile`
5. Verify that unauthenticated users are redirected to sign-in

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check environment variables
2. **Google sign-in not working**: Ensure Google sign-in is enabled in Firebase console
3. **Firestore permission errors**: Check Firestore rules
4. **Network errors**: Check internet connectivity and Firebase project status

### Debug Mode

Enable debug logging by adding this to your browser console:
```javascript
localStorage.setItem('debug', 'firebase:*')
```

This will show detailed Firebase authentication logs in the console. 