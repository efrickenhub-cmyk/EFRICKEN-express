/**
 * Google Authentication & Token Management Service
 * Follows AI Studio Workspace Integration guidelines:
 * - Uses client-side Firebase Auth with GoogleAuthProvider
 * - Keeps OAuth access tokens strictly in-memory (cachedAccessToken)
 * - Never persists access tokens to localStorage or sessionStorage
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);

// Gmail Scopes required by the application
export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
];

// IN-MEMORY access token cache - NEVER stored in localStorage or sessionStorage
let cachedAccessToken: string | null = null;
let tokenExpiryTimestamp: number = 0;

/**
 * Configure Google Auth Provider with necessary Gmail scopes
 */
function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  GMAIL_SCOPES.forEach((scope) => {
    provider.addScope(scope);
  });
  // Prompt user to select account if needed
  provider.setCustomParameters({
    prompt: 'select_account',
    access_type: 'online',
  });
  return provider;
}

/**
 * Sign in with Google using popup
 * Returns the authenticated user and stores access token in memory
 */
export async function signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    const provider = createGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Google sign-in succeeded but no access token was returned.');
    }

    cachedAccessToken = token;
    // Set a safe 50-minute expiry for in-memory token
    tokenExpiryTimestamp = Date.now() + 50 * 60 * 1000;

    return {
      user: result.user,
      accessToken: token,
    };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

/**
 * Get the current in-memory access token.
 * If expired or null and user is signed in, triggers popup to re-acquire token.
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (cachedAccessToken && Date.now() < tokenExpiryTimestamp) {
    return cachedAccessToken;
  }

  // Token missing or expired. If a user is already authenticated, re-authenticate to get fresh token
  if (auth.currentUser) {
    try {
      const { accessToken } = await signInWithGoogle();
      return accessToken;
    } catch {
      cachedAccessToken = null;
      return null;
    }
  }

  return null;
}

/**
 * Check if we currently have an in-memory valid token
 */
export function hasActiveGoogleToken(): boolean {
  return Boolean(cachedAccessToken && Date.now() < tokenExpiryTimestamp);
}

/**
 * Sign out from Google Auth and clear in-memory token
 */
export async function signOutGoogle(): Promise<void> {
  cachedAccessToken = null;
  tokenExpiryTimestamp = 0;
  await firebaseSignOut(auth);
}

/**
 * Subscribe to Auth state changes
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
      tokenExpiryTimestamp = 0;
    }
    callback(user);
  });
}
