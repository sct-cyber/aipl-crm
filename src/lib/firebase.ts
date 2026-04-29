import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBO9K33tnpwvIugANqm2VAVUmqPTWiNA6U",
  authDomain: "gen-lang-client-0815291403.firebaseapp.com",
  projectId: "gen-lang-client-0815291403",
  storageBucket: "gen-lang-client-0815291403.firebasestorage.app",
  messagingSenderId: "259192772382",
  appId: "1:259192772382:web:e8a2fdff15f4ceac439b0f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
}

export const handleFirestoreError = (error: any, operation: OperationType, resource: string): never => {
  console.error(`[Firestore ${operation}] Error on ${resource}:`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error.code === 'permission-denied') {
    message = 'You do not have permission to perform this action';
  } else if (error.code === 'not-found') {
    message = 'The requested resource was not found';
  } else if (error.code === 'already-exists') {
    message = 'This resource already exists';
  } else if (error.code === 'unauthenticated') {
    message = 'You must be logged in to perform this action';
  }
  
  throw new Error(message);
};

export const handleAuthError = (error: any): string => {
  console.error('[Auth] Error:', error);
  
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    default:
      return 'Authentication failed. Please try again.';
  }
};
