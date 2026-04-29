import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Lead, 
  Account, 
  Opportunity, 
  Interaction, 
  Contact, 
  Task, 
  UserPreferences, 
  DashboardWidget, 
  KPIMetrics 
} from '../types';

export const crmService = {
  // ─── User Preferences ────────────────────────────────────────────────────────
  subscribeToUserPreferences: (callback: (prefs: UserPreferences | null) => void) => {
    if (!auth.currentUser) return () => {};
    const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
    return onSnapshot(prefRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as UserPreferences) : null);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'userPreferences'));
  },

  updateUserPreferences: async (widgets: DashboardWidget[], sheetsSync?: UserPreferences['sheetsSync']) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
      const updateData: any = { userId: auth.currentUser.uid, dashboardWidgets: widgets };
      if (sheetsSync) updateData.sheetsSync = sheetsSync;
      await updateDoc(prefRef, updateData).catch(async (err) => {
        if (err.code === 'not-found') {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(prefRef, updateData);
        } else throw err;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'userPreferences');
    }
  },

  // ─── Leads ───────────────────────────────────────────────────────────────────
  subscribeToLeads: (callback: (leads: Lead[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'leads'), where('ownerId', '==', auth.currentUser.uid), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead))), (error) => handleFirestoreError(error, OperationType.LIST, 'leads'));
  },

  addLead: async (leadData: Omit<Lead, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
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
  }
};
