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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Lead, Account, Opportunity, Interaction, Contact, Task, UserPreferences, DashboardWidget, KPIMetrics } from '../types';

export const crmService = {
  // --- User Preferences ---
  subscribeToUserPreferences: (callback: (prefs: UserPreferences | null) => void) => {
    if (!auth.currentUser) return () => {};
    const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
    return onSnapshot(prefRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as UserPreferences);
        } else {
          callback(null);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'userPreferences')
    );
  },

  updateUserPreferences: async (widgets: DashboardWidget[], sheetsSync?: UserPreferences['sheetsSync']) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const prefRef = doc(db, 'userPreferences', auth.currentUser.uid);
      const updateData: any = {
        userId: auth.currentUser.uid,
        dashboardWidgets: widgets
      };
      if (sheetsSync) {
        updateData.sheetsSync = sheetsSync;
      }
      
      await updateDoc(prefRef, updateData).catch(async (err) => {
        // If doc doesn't exist, set it
        if (err.code === 'not-found') {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(prefRef, updateData);
        } else {
          throw err;
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'userPreferences');
    }
  },

  // --- KPI Metrics ---
  subscribeToKPIs: (callback: (kpis: KPIMetrics[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'kpis'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('weekEnding', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const kpis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KPIMetrics));
        callback(kpis);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'kpis');
    }
  },

  // --- Leads ---
  subscribeToLeads: (callback: (leads: Lead[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'leads'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        callback(leads);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  },

  updateLead: async (id: string, updates: Partial<Lead>) => {
    try {
      const leadRef = doc(db, 'leads', id);
      await updateDoc(leadRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  },

  // --- Accounts ---
  subscribeToAccounts: (callback: (accounts: Account[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'accounts'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        callback(accounts);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accounts');
    }
  },

  // --- Contacts ---
  subscribeToContacts: (callback: (contacts: Contact[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'contacts'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
        callback(contacts);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    }
  },

  // --- Tasks ---
  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('dueDate', 'asc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        callback(tasks);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  },

  // --- Opportunities ---
  subscribeToOpportunities: (callback: (opps: Opportunity[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'opportunities'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const opps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        callback(opps);
      },
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
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'opportunities');
    }
  },

  // --- Interactions ---
  subscribeToInteractions: (relatedToId: string, callback: (interactions: Interaction[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(
      collection(db, 'interactions'),
      where('ownerId', '==', auth.currentUser.uid),
      where('relatedToId', '==', relatedToId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, 
      (snapshot) => {
        const interactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Interaction));
        callback(interactions);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'interactions')
    );
  },

  addInteraction: async (interactionData: Omit<Interaction, 'id' | 'ownerId' | 'createdAt'>) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      await addDoc(collection(db, 'interactions'), {
        ...interactionData,
        ownerId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'interactions');
    }
  }
};
