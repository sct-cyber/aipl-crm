// ============================================================================
// USER & PERMISSIONS
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'support_rep';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  teamId?: string;
  territory?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewAll: boolean; // See all records vs only owned records
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// ============================================================================
// CORE CRM ENTITIES
// ============================================================================

export interface Lead {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  
  // Lead Details
  source: 'Website' | 'Referral' | 'Cold Call' | 'LinkedIn' | 'Trade Show' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
  rating?: 'Hot' | 'Warm' | 'Cold';
  industry?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  
  // Address
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Conversion
  isConverted: boolean;
  convertedDate?: string;
  convertedContactId?: string;
  convertedAccountId?: string;
  convertedDealId?: string;
  
  // Metadata
  description?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  ownerId: string;
  ownerName?: string;
  accountId?: string;
  accountName?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  
  // Address
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
  
  // Social
  linkedin?: string;
  twitter?: string;
  
  // Metadata
  leadSource?: string;
  description?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Basic Info
  accountName: string;
  website?: string;
  phone?: string;
  industry?: string;
  
  // Classification
  type?: 'Customer' | 'Prospect' | 'Partner' | 'Reseller' | 'Other';
  ownership?: 'Public' | 'Private' | 'Subsidiary' | 'Other';
  
  // Business Info
  annualRevenue?: number;
  numberOfEmployees?: number;
  
  // Address
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  
  // Parent Account
  parentAccountId?: string;
  parentAccountName?: string;
  
  // Metadata
  description?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  ownerId: string;
  ownerName?: string;
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  
  // Deal Info
  dealName: string;
  amount: number;
  stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  probability: number; // 0-100
  expectedCloseDate: string;
  actualCloseDate?: string;
  
  // Source & Type
  leadSource?: string;
  type?: 'New Business' | 'Existing Business' | 'Renewal';
  
  // Products
  productIds?: string[];
  
  // Metadata
  description?: string;
  nextStep?: string;
  lossReason?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  ownerId: string;
  
  productName: string;
  productCode?: string;
  category?: string;
  vendorName?: string;
  
  // Pricing
  unitPrice: number;
  currency: string;
  taxable: boolean;
  
  // Stock
  qtyInStock?: number;
  reorderLevel?: number;
  
  // Status
  active: boolean;
  
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Relations
  dealId?: string;
  dealName?: string;
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  
  // Quote Info
  subject: string;
  quoteNumber: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  validUntil: string;
  
  // Line Items
  lineItems: QuoteLineItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  
  // Terms
  termsAndConditions?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

// ============================================================================
// ACTIVITIES
// ============================================================================

export interface Task {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Task Info
  subject: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Deferred';
  priority: 'High' | 'Medium' | 'Low';
  
  // Relations
  relatedTo?: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal';
    id: string;
    name: string;
  };
  
  // Dates
  dueDate?: string;
  completedDate?: string;
  
  // Details
  description?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Event Info
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  
  // Relations
  relatedTo?: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal';
    id: string;
    name: string;
  };
  
  // Participants
  participants?: string[]; // User IDs
  
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Call Info
  subject: string;
  callType: 'Inbound' | 'Outbound';
  callDuration?: number; // in minutes
  callResult?: 'Connected' | 'Left Voicemail' | 'No Answer' | 'Wrong Number';
  
  // Relations
  relatedTo?: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal';
    id: string;
    name: string;
  };
  
  // Scheduling
  callStartTime?: string;
  callEndTime?: string;
  
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Relations
  relatedTo: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal';
    id: string;
    name: string;
  };
  
  title?: string;
  content: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  ownerId: string;
  ownerName?: string;
  
  // Email Info
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sentAt?: string;
  status: 'Draft' | 'Sent' | 'Failed';
  
  // Relations
  relatedTo?: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal';
    id: string;
    name: string;
  };
  
  // Tracking
  opened?: boolean;
  openedAt?: string;
  clicked?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  ownerId: string;
  
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  
  // Relations
  relatedTo: {
    type: 'Lead' | 'Contact' | 'Account' | 'Deal' | 'Email' | 'Note';
    id: string;
  };
  
  createdAt: string;
}

// ============================================================================
// AUTOMATION
// ============================================================================

export interface WorkflowRule {
  id: string;
  name: string;
  module: 'Leads' | 'Contacts' | 'Accounts' | 'Deals' | 'Tasks';
  isActive: boolean;
  
  // Trigger
  trigger: 'onCreate' | 'onUpdate' | 'onFieldUpdate' | 'scheduled';
  conditions: WorkflowCondition[];
  
  // Actions
  actions: WorkflowAction[];
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface WorkflowAction {
  type: 'update_field' | 'send_email' | 'create_task' | 'send_notification' | 'webhook';
  config: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId?: string;
  body: string;
  
  // Recipients
  targetModule: 'Leads' | 'Contacts';
  recipientIds: string[];
  
  // Status
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Paused';
  scheduledAt?: string;
  sentAt?: string;
  
  // Stats
  totalSent: number;
  opened: number;
  clicked: number;
  bounced: number;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

export interface Report {
  id: string;
  name: string;
  module: string;
  type: 'table' | 'chart' | 'summary';
  
  // Filters
  filters: ReportFilter[];
  
  // Columns (for table reports)
  columns?: string[];
  
  // Chart config (for chart reports)
  chartType?: 'bar' | 'line' | 'pie' | 'funnel';
  groupBy?: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  
  // Access
  isPublic: boolean;
  ownerId: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel';
  title: string;
  reportId?: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

// ============================================================================
// SYSTEM
// ============================================================================

export interface CustomField {
  id: string;
  module: string;
  fieldName: string;
  label: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'picklist' | 'lookup';
  isRequired: boolean;
  picklistValues?: string[];
  lookupModule?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  recordId: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'converted';
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedTo?: {
    type: string;
    id: string;
  };
  createdAt: string;
}

// ============================================================================
// UI STATE
// ============================================================================

export interface ViewSettings {
  module: string;
  viewType: 'list' | 'kanban' | 'calendar';
  columns: string[];
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
}

export interface ImportJob {
  id: string;
  module: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}
