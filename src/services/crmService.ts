import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Lead, Account, Opportunity, Interaction, Contact, Task, UserPreferences, DashboardWidget, KPIMetrics } from '../types';

export const crmService = {

  // ─── User Preferences ────────────────────────────────────────────────────────

  subscribeToUserPreferences: (callback: (prefs: UserPreferences | null) => void) => {
    if (!auth.currentUser) return () => {};
    const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
    return onSnapshot(prefRef,
      (snapshot) => {
        callback(snapshot.exists() ? (snapshot.data() as UserPreferences) : null);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'userPreferences')
    );
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

  // ─── KPI Metrics ─────────────────────────────────────────────────────────────

  subscribeToKPIs: (callback: (kpis: KPIMetrics[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'kpis'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('weekEnding', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KPIMetrics))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'kpis')
    );
  },

  addKPI: async (kpiData: Omit<KPIMetrics, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'kpis'), {
        ...kpiData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'kpis');
    }
  },

  updateKPI: async (id: string, updates: Partial<KPIMetrics>) => {
    try {
      await updateDoc(doc(db, 'kpis', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `kpis/${id}`);
    }
  },

  deleteKPI: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'kpis', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `kpis/${id}`);
    }
  },

  // ─── Leads ───────────────────────────────────────────────────────────────────

  subscribeToLeads: (callback: (leads: Lead[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'leads'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'leads')
    );
  },

  addLead: async (leadData: Omit<Lead, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'leads'), {
        ...leadData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  },

  updateLead: async (id: string, updates: Partial<Lead>) => {
    try {
      await updateDoc(doc(db, 'leads', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  },

  deleteLead: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  },

  // ─── Accounts ────────────────────────────────────────────────────────────────

  subscribeToAccounts: (callback: (accounts: Account[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'accounts'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Account))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'accounts')
    );
  },

  addAccount: async (accountData: Omit<Account, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'accounts'), {
        ...accountData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accounts');
    }
  },

  updateAccount: async (id: string, updates: Partial<Account>) => {
    try {
      await updateDoc(doc(db, 'accounts', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `accounts/${id}`);
    }
  },

  deleteAccount: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'accounts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accounts/${id}`);
    }
  },

  // ─── Contacts ────────────────────────────────────────────────────────────────

  subscribeToContacts: (callback: (contacts: Contact[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'contacts'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contact))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'contacts')
    );
  },

  addContact: async (contactData: Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'contacts'), {
        ...contactData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    }
  },

  updateContact: async (id: string, updates: Partial<Contact>) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
    }
  },

  deleteContact: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
    }
  },

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('dueDate', 'asc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'tasks')
    );
  },

  addTask: async (taskData: Omit<Task, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  },

  deleteTask: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  },

  // ─── Opportunities ───────────────────────────────────────────────────────────

  subscribeToOpportunities: (callback: (opps: Opportunity[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'opportunities'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'opportunities')
    );
  },

  addOpportunity: async (oppData: Omit<Opportunity, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, 'opportunities'), {
        ...oppData,
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'opportunities');
    }
  },

  updateOpportunity: async (id: string, updates: Partial<Opportunity>) => {
    try {
      await updateDoc(doc(db, 'opportunities', id), { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `opportunities/${id}`);
    }
  },

  deleteOpportunity: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'opportunities', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `opportunities/${id}`);
    }
  },

  // ─── Interactions ────────────────────────────────────────────────────────────

  subscribeToInteractions: (relatedToId: string, callback: (interactions: Interaction[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'interactions'),
      where('ownerId', '==', auth.currentUser.uid),
      where('relatedToId', '==', relatedToId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Interaction))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'interactions')
    );
  },

  // Subscribe to ALL interactions (for the Timeline view)
  subscribeToAllInteractions: (callback: (interactions: Interaction[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'interactions'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Interaction))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'interactions')
    );
  },

  addInteraction: async (interactionData: Omit<Interaction, 'id' | 'ownerId' | 'createdAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      await addDoc(collection(db, 'interactions'), {
        ...interactionData,
        ownerId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'interactions');
    }
  },

  deleteInteraction: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'interactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `interactions/${id}`);
    }
  },
};
