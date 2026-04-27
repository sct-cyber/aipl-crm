import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Interaction, Lead, Account, InteractionType } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText, 
  User, 
  Building2, 
  Plus, 
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';

const ICON_MAP: Record<InteractionType, any> = {
  Email: Mail,
  Call: Phone,
  Meeting: User,
  Note: FileText
};

const COLOR_MAP: Record<InteractionType, string> = {
  Email: 'bg-indigo-50 text-indigo-600',
  Call: 'bg-emerald-50 text-emerald-600',
  Meeting: 'bg-blue-50 text-blue-600',
  Note: 'bg-amber-50 text-amber-600'
};

export default function TimelineView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeRelatedId, setActiveRelatedId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubLeads = crmService.subscribeToLeads(setLeads);
    const unsubAccs = crmService.subscribeToAccounts((accs) => {
      setAccounts(accs);
      if (accs.length > 0 && !activeRelatedId) setActiveRelatedId(accs[0].id);
      setIsLoading(false);
    });
    return () => { unsubLeads(); unsubAccs(); };
  }, []);

  useEffect(() => {
    if (!activeRelatedId) return;
    const unsub = crmService.subscribeToInteractions(activeRelatedId, setInteractions);
    return unsub;
  }, [activeRelatedId]);

  const handleAddInteraction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeRelatedId) return;
    
    const formData = new FormData(e.currentTarget);
    const relatedToType = leads.some(l => l.id === activeRelatedId) ? 'Lead' : 'Account';

    const interactionData = {
      type: formData.get('type') as InteractionType,
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
      relatedToId: activeRelatedId,
      relatedToType: relatedToType as any
    };

    await crmService.addInteraction(interactionData);
    setIsModalOpen(false);
  };

  const getRelatedName = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (lead) return `${lead.firstName} ${lead.lastName}`;
    const acc = accounts.find(a => a.id === id);
    if (acc) return acc.name;
    return 'Unknown';
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Selection Sidebar */}
      <div className="w-80 border-r border-brand-accent/50 bg-white flex flex-col">
        <div className="p-6 border-b border-brand-accent/30">
          <h2 className="text-lg font-black text-brand-secondary mb-4">Contacts & Accounts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-brand-light/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-2">Recent Accounts</h3>
            <div className="space-y-1">
              {accounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => setActiveRelatedId(acc.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                    activeRelatedId === acc.id ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "hover:bg-brand-light text-brand-muted hover:text-brand-primary"
                  )}
                >
                  <Building2 size={18} className={activeRelatedId === acc.id ? "text-white/60" : "text-brand-muted group-hover:text-brand-primary"} />
                  <span className="text-sm font-bold truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 px-2">Quick Leads</h3>
            <div className="space-y-1">
              {leads.map(lead => (
                <button 
                  key={lead.id}
                  onClick={() => setActiveRelatedId(lead.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                    activeRelatedId === lead.id ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "hover:bg-brand-light text-brand-muted hover:text-brand-primary"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors",
                    activeRelatedId === lead.id ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary"
                  )}>
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <span className="text-sm font-bold truncate">{lead.firstName} {lead.lastName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="flex-1 bg-[#F8F9FA] overflow-y-auto p-8">
        {!activeRelatedId ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-brand-muted mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-black text-brand-secondary mb-2">Select a Contact</h3>
            <p className="text-brand-muted font-medium">Pick a lead or account from the left to view and log communication history.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Communication Log</p>
                <h1 className="text-2xl font-black text-brand-secondary">{getRelatedName(activeRelatedId)}</h1>
              </div>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                <span>Log Interaction</span>
              </Button>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[23px] before:top-4 before:bottom-0 before:w-0.5 before:bg-gray-200">
              {interactions.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <p>No communication history yet.</p>
                </div>
              ) : (
                interactions.map((interaction) => {
                  const Icon = ICON_MAP[interaction.type];
                  return (
                    <div key={interaction.id} className="relative pl-14">
                      <div className={cn(
                        "absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-sm",
                        COLOR_MAP[interaction.type]
                      )}>
                        <Icon size={20} />
                      </div>
                      <Card className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{interaction.subject}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                {interaction.type}
                              </span>
                              <span>•</span>
                              <span>{new Date(interaction.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {interaction.content}
                        </div>
                      </Card>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Log Interaction with ${activeRelatedId ? getRelatedName(activeRelatedId) : ''}`}
      >
        <form onSubmit={handleAddInteraction} className="p-8 space-y-6">
          <Select 
            label="Interaction Type" 
            name="type" 
            options={[
              { value: 'Note', label: 'Internal Note' },
              { value: 'Email', label: 'Email' },
              { value: 'Call', label: 'Voice Call' },
              { value: 'Meeting', label: 'Meeting' },
            ]} 
          />
          
          <Input label="Subject" name="subject" required placeholder="Project Discovery Call, Pricing Discussion..." />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">Details</label>
            <textarea 
              name="content"
              required
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all outline-none"
              placeholder="What was discussed? Any action items?"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

