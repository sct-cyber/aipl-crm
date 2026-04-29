import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  query, where, onSnapshot, orderBy 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Lead, Task, KPIMetrics } from '../types';

export const crmService = {
  // --- Leads ---
  subscribeToLeads: (callback: (leads: Lead[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'leads'), where('ownerId', '==', auth.currentUser.uid), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead))), (error) => handleFirestoreError(error, OperationType.LIST, 'leads'));
  },

  addLead: async (leadData: any) => {
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
    const q = query(collection(db, 'tasks'), where('ownerId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task))), (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));
  },

  // --- KPIs ---
  subscribeToKPIs: (callback: (kpis: KPIMetrics[]) => void) => {
    if (!auth.currentUser) return () => {};
    const q = query(collection(db, 'kpis'), where('ownerId', '==', auth.currentUser.uid));
    return onSnapshot(q, (snapshot) => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KPIMetrics))), (error) => handleFirestoreError(error, OperationType.LIST, 'kpis'));
  }
};
