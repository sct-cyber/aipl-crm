import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  query, where, onSnapshot, orderBy 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Lead, Account, Opportunity, Interaction, 
  Contact, Task, UserPreferences, DashboardWidget, KPIMetrics 
} from '../types';

export const crmService = {
  // --- User Preferences ---
  subscribeToUserPreferences: (callback: (prefs: UserPreferences | null) => void) => {
    if (!auth.currentUser) return () => {};
    const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
    return onSnapshot(prefRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as UserPreferences) : null);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'userPreferences'));
  },

  // --- Leads ---
  subscribeToLeads: (callback: (leads: Lead[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'leads'), where('ownerId', '==', auth.currentUser.uid), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead))), (error) => handleFirestoreError(error, OperationType.LIST, 'leads'));
  },

  addLead: async (leadData: Omit<Lead, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    try {
      await addDoc(collection(db, 'leads'), { ...leadData, ownerId: auth.currentUser.uid, createdAt: now, updatedAt: now });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  },

  deleteLead: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  },

  // --- Tasks ---
  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'tasks'), where('ownerId', '==', auth.currentUser.uid), orderBy('dueDate', 'asc'));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task))), (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));
  },

  // --- Accounts, Contacts & Opportunities ---
  subscribeToAccounts: (callback: (accounts: Account[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'accounts'), where('ownerId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Account))), (error) => handleFirestoreError(error, OperationType.LIST, 'accounts'));
  },

  subscribeToContacts: (callback: (contacts: Contact[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'contacts'), where('ownerId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contact))), (error) => handleFirestoreError(error, OperationType.LIST, 'contacts'));
  },

  subscribeToOpportunities: (callback: (opps: Opportunity[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'opportunities'), where('ownerId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity))), (error) => handleFirestoreError(error, OperationType.LIST, 'opportunities'));
  },

  // --- KPIs & Interactions (Essential for the Dashboard) ---
  subscribeToKPIs: (callback: (kpis: KPIMetrics[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'kpis'), where('ownerId', '==', auth.currentUser.uid), orderBy('weekEnding', 'desc'));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KPIMetrics))), (error) => handleFirestoreError(error, OperationType.LIST, 'kpis'));
  },

  addInteraction: async (data: Omit<Interaction, 'id' | 'ownerId' | 'createdAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      await addDoc(collection(db, 'interactions'), { ...data, ownerId: auth.currentUser.uid, createdAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'interactions');
    }
  }
};
