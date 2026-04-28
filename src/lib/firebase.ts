import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
{
  "projectId": "gen-lang-client-0815291403",
  "appId": "1:259192772382:web:e8a2fdff15f4ceac439b0f",
  "apiKey": "AIzaSyBO9K33tnpwvIugANqm2VAVUmqPTWiNA6U",
  "authDomain": "gen-lang-client-0815291403.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-6e2802ca-edf5-435b-96a6-512b03ff1a9a",
  "storageBucket": "gen-lang-client-0815291403.firebasestorage.app",
  "messagingSenderId": "259192772382",
  "measurementId": ""
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// This tells the app to use your specific AI Studio database
export const db = getFirestore(app, "ai-studio-6e2802ca-edf5-435b-96a6-512b03ff1a9a");
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
