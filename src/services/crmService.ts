import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  Lead,
  Contact,
  Account,
  Deal,
  Product,
  Quote,
  Task,
  Event,
  Call,
  Note,
  Email,
  Attachment,
  WorkflowRule,
  EmailTemplate,
  EmailCampaign,
  Report,
  Dashboard,
  User,
  Notification,
  ActivityLog,
} from '../types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCurrentUserId = (): string => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  return auth.currentUser.uid;
};

const addTimestamps = <T extends Record<string, any>>(data: T) => {
  const now = new Date().toISOString();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
};

const updateTimestamp = <T extends Record<string, any>>(data: T) => {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
};

// ============================================================================
// LEADS
// ============================================================================

export const leadsService = {
  subscribe: (callback: (leads: Lead[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'leads'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'leads')
    );
  },

  getById: async (id: string): Promise<Lead | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'leads', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Lead : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `leads/${id}`);
    }
  },

  create: async (leadData: Omit<Lead, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'leads'), addTimestamps({
        ...leadData,
        ownerId: userId,
        isConverted: false,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  },

  update: async (id: string, updates: Partial<Lead>) => {
    try {
      await updateDoc(doc(db, 'leads', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  },

  convert: async (leadId: string, createAccount: boolean, createDeal: boolean, dealData?: Partial<Deal>) => {
    try {
      const lead = await leadsService.getById(leadId);
      if (!lead) throw new Error('Lead not found');

      const userId = getCurrentUserId();
      const batch = writeBatch(db);

      // Create Contact
      const contactRef = doc(collection(db, 'contacts'));
      const contact: Omit<Contact, 'id'> = {
        ownerId: userId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        title: lead.title,
        mailingStreet: lead.street,
        mailingCity: lead.city,
        mailingState: lead.state,
        mailingZip: lead.zipCode,
        mailingCountry: lead.country,
        leadSource: lead.source,
        description: lead.description,
        tags: lead.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(contactRef, contact);

      let accountId: string | undefined;
      if (createAccount && lead.company) {
        const accountRef = doc(collection(db, 'accounts'));
        accountId = accountRef.id;
        const account: Omit<Account, 'id'> = {
          ownerId: userId,
          accountName: lead.company,
          phone: lead.phone,
          industry: lead.industry,
          annualRevenue: lead.annualRevenue,
          numberOfEmployees: lead.numberOfEmployees,
          billingStreet: lead.street,
          billingCity: lead.city,
          billingState: lead.state,
          billingZip: lead.zipCode,
          billingCountry: lead.country,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        batch.set(accountRef, account);
      }

      let dealId: string | undefined;
      if (createDeal && dealData) {
        const dealRef = doc(collection(db, 'deals'));
        dealId = dealRef.id;
        const deal: Omit<Deal, 'id'> = {
          ...dealData,
          ownerId: userId,
          accountId,
          accountName: lead.company,
          contactId: contactRef.id,
          contactName: `${lead.firstName} ${lead.lastName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Omit<Deal, 'id'>;
        batch.set(dealRef, deal);
      }

      // Update lead as converted
      batch.update(doc(db, 'leads', leadId), {
        isConverted: true,
        convertedDate: new Date().toISOString(),
        convertedContactId: contactRef.id,
        convertedAccountId: accountId,
        convertedDealId: dealId,
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
    }
  },
};

// ============================================================================
// CONTACTS
// ============================================================================

export const contactsService = {
  subscribe: (callback: (contacts: Contact[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'contacts'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contact))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'contacts')
    );
  },

  getById: async (id: string): Promise<Contact | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'contacts', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Contact : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `contacts/${id}`);
    }
  },

  create: async (contactData: Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'contacts'), addTimestamps({
        ...contactData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
    }
  },

  update: async (id: string, updates: Partial<Contact>) => {
    try {
      await updateDoc(doc(db, 'contacts', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
    }
  },
};

// ============================================================================
// ACCOUNTS
// ============================================================================

export const accountsService = {
  subscribe: (callback: (accounts: Account[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'accounts'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Account))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'accounts')
    );
  },

  getById: async (id: string): Promise<Account | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'accounts', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Account : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `accounts/${id}`);
    }
  },

  create: async (accountData: Omit<Account, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'accounts'), addTimestamps({
        ...accountData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accounts');
    }
  },

  update: async (id: string, updates: Partial<Account>) => {
    try {
      await updateDoc(doc(db, 'accounts', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `accounts/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'accounts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accounts/${id}`);
    }
  },
};

// ============================================================================
// DEALS
// ============================================================================

export const dealsService = {
  subscribe: (callback: (deals: Deal[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'deals'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Deal))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'deals')
    );
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'deals', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Deal : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `deals/${id}`);
    }
  },

  create: async (dealData: Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'deals'), addTimestamps({
        ...dealData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'deals');
    }
  },

  update: async (id: string, updates: Partial<Deal>) => {
    try {
      await updateDoc(doc(db, 'deals', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `deals/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deals/${id}`);
    }
  },
};

// ============================================================================
// TASKS
// ============================================================================

export const tasksService = {
  subscribe: (callback: (tasks: Task[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'tasks'),
      where('ownerId', '==', userId),
      orderBy('dueDate', 'asc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'tasks')
    );
  },

  create: async (taskData: Omit<Task, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'tasks'), addTimestamps({
        ...taskData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  update: async (id: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const productsService = {
  subscribe: (callback: (products: Product[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'products'),
      where('ownerId', '==', userId),
      orderBy('productName', 'asc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'products')
    );
  },

  create: async (productData: Omit<Product, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'products'), addTimestamps({
        ...productData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  },

  update: async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updateTimestamp(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  },
};

// ============================================================================
// NOTES
// ============================================================================

export const notesService = {
  subscribeToRelated: (relatedId: string, callback: (notes: Note[]) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'notes'),
      where('ownerId', '==', userId),
      where('relatedTo.id', '==', relatedId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Note))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'notes')
    );
  },

  create: async (noteData: Omit<Note, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userId = getCurrentUserId();
      await addDoc(collection(db, 'notes'), addTimestamps({
        ...noteData,
        ownerId: userId,
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  },

  delete: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  },
};

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export const activityService = {
  logActivity: async (
    module: string,
    recordId: string,
    action: ActivityLog['action'],
    changes?: Record<string, { old: any; new: any }>
  ) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const activity: Omit<ActivityLog, 'id'> = {
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown',
        module,
        recordId,
        action,
        changes,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'activityLogs'), activity);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - activity logging shouldn't break the main flow
    }
  },

  subscribeToRecordActivity: (recordId: string, callback: (logs: ActivityLog[]) => void) => {
    const q = query(
      collection(db, 'activityLogs'),
      where('recordId', '==', recordId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q,
      (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog))),
      (error) => console.error('Activity log subscription error:', error)
    );
  },
};

// ============================================================================
// SEARCH
// ============================================================================

export const searchService = {
  searchAll: async (searchTerm: string) => {
    try {
      const userId = getCurrentUserId();
      const results: any[] = [];

      // Search leads
      const leadsQuery = query(
        collection(db, 'leads'),
        where('ownerId', '==', userId),
        limit(5)
      );
      const leadsSnap = await getDocs(leadsQuery);
      leadsSnap.forEach(doc => {
        const lead = { id: doc.id, ...doc.data() } as Lead;
        const searchableText = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.company}`.toLowerCase();
        if (searchableText.includes(searchTerm.toLowerCase())) {
          results.push({ type: 'Lead', ...lead });
        }
      });

      // Similar for contacts, accounts, deals...
      // (simplified for brevity - in production you'd want proper text search)

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },
};

// Export all services
export const crmService = {
  leads: leadsService,
  contacts: contactsService,
  accounts: accountsService,
  deals: dealsService,
  tasks: tasksService,
  products: productsService,
  notes: notesService,
  activity: activityService,
  search: searchService,
};
