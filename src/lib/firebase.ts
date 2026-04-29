import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBO9K33tnpwvIugANqm2VAVUmqPTWiNA6U",
  authDomain: "gen-lang-client-0815291403.firebaseapp.com",
  projectId: "gen-lang-client-0815291403",
  storageBucket: "gen-lang-client-0815291403.firebasestorage.app",
  messagingSenderId: "259192772382",
  appId: "1:259192772382:web:e8a2fdff15f4ceac439b0f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, "ai-studio-6e2802ca-edf5-435b-96a6-512b03ff1a9a");

export enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write'
}

export function handleFirestoreError(error: any, operation: OperationType, path: string | null) {
  console.error(`Firestore Error [${operation}] at ${path}:`, error);
  throw error;
}
