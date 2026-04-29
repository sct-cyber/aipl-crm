import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded config to ensure Vercel always has the correct keys
const firebaseConfig = {
  apiKey: "AIzaSyBO9K33tnpwvIugANqm2VAVUmqPTWiNA6U",
  authDomain: "gen-lang-client-0815291403.firebaseapp.com",
  projectId: "gen-lang-client-0815291403",
  storageBucket: "gen-lang-client-0815291403.firebasestorage.app",
  messagingSenderId: "259192772382",
  appId: "1:259192772382:web:e8a2fdff15f4ceac439b0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Firestore with your specific AI Studio database ID
export const db = getFirestore(app, "ai-studio-6e2802ca-edf5-435b-96a6-512b03ff1a9a");

// --- Helper Types and Functions for CRM Services ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

/**
 * Global error handler for Firestore operations used by crmService.ts
 */
export function handleFirestoreError(error: any, operation: OperationType, path: string | null) {
  const errorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    path,
    timestamp: new Date().toISOString(),
    authContext: {
      loggedIn: !!auth.currentUser,
      userId: auth.currentUser?.uid
    }
  };
  
  console.error("Firestore Operation Failed:", errorInfo);
  throw error;
}
