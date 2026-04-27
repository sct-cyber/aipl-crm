export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Lost';
export type OpportunityStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type InteractionType = 'Email' | 'Call' | 'Meeting' | 'Note';
export type InteractionRelatedType = 'Lead' | 'Account' | 'Opportunity';
export type LeadTag = 'NBD' | 'CRR-NBD';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  tag?: LeadTag;
  ownerId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingAddress?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  value: number;
  stage: OpportunityStage;
  tag?: LeadTag;
  probability?: number;
  expectedCloseDate?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  subject: string;
  content: string;
  relatedToId: string;
  relatedToType: InteractionRelatedType;
  ownerId: string;
  createdAt: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Deferred';
export type TaskPriority = 'Low' | 'Normal' | 'High';

export interface Task {
  id: string;
  subject: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  relatedToId?: string;
  relatedToType?: 'Lead' | 'Account' | 'Opportunity' | 'Contact';
  reminderAt?: string;
  reminderSent?: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  accountId: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIMetrics {
  id: string;
  weekEnding: string;
  newBOQAddedCr: number;
  crrNbdBOQ: number;
  nbdBOQ: number;
  noOfBOQReceived: number;
  orderBookingCr: number;
  noOfOrderBooking: number;
  newGPCr: number;
  newGPPercent: number;
  averageRsSale: number;
  averageGP: number;
  averageBOQReceived: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type WidgetType = 'stats' | 'revenue' | 'leads' | 'activity' | 'tasks';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
}

export interface UserPreferences {
  userId: string;
  dashboardWidgets: DashboardWidget[];
  sheetsSync?: {
    spreadsheetId?: string;
    lastSyncAt?: string;
    autoSync?: boolean;
    syncLeads?: boolean;
    syncAccounts?: boolean;
    syncOpportunities?: boolean;
  };
}
