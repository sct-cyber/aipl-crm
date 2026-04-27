import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Lead, LeadStatus, LeadTag } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { analyzeLead, draftFollowUp } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Filter,
  ArrowUpDown,
  Search,
  Plus,
  Sparkles,
  Users
} from 'lucide-react';

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-[#e9f5db] text-[#4b5d3f] border-[#d4e5c5]',
  Contacted: 'bg-[#fefae0] text-[#7a6d2b] border-[#f9f3cf]',
  Qualified: 'bg-[#6b705c]/10 text-[#6b705c] border-[#6b705c]/20',
  Unqualified: 'bg-brand-accent/50 text-brand-muted border-brand-accent',
  Lost: 'bg-[#ddbea9]/20 text-[#a5a58d] border-[#ddbea9]/30'
};

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = crmService.subscribeToLeads((data) => {
      setLeads(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const leadData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      status: formData.get('status') as LeadStatus,
      source: formData.get('source') as string,
      tag: (formData.get('tag') as LeadTag) || undefined,
      notes: formData.get('notes') as string,
    };

    await crmService.addLead(leadData);
    setIsModalOpen(false);
  };

  const handleAnalyze = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsAnalyzing(true);
    setAiInsights(null);
    const result = await analyzeLead(lead);
    setAiInsights(result || null);
    setIsAnalyzing(false);
  };
  const filteredLeads = leads.filter(l => 
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Leads</h1>
          <p className="text-brand-muted text-sm font-medium">You have {leads.length} active leads in your pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md">
            <Filter size={18} />
            <span>Filter</span>
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      <Card className="p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-accent/50 bg-brand-light/30">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Name</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Company</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Type</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Created</th>
                <th className="px-6 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/30 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-medium">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Users size={24} />
                      </div>
                      <p className="font-medium text-gray-500">No leads found</p>
                      <p className="text-sm text-gray-400">Start by adding your first sales lead.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center font-bold">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-brand-secondary">{lead.firstName} {lead.lastName}</p>
                          <p className="text-xs text-brand-muted font-medium">{lead.source || 'Direct'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full",
                        STATUS_COLORS[lead.status]
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Building2 size={16} className="text-gray-400" />
                        <span>{lead.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Mail size={14} className="text-gray-400" />
                          <span>{lead.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Phone size={14} className="text-gray-400" />
                          <span>{lead.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.tag && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                          lead.tag === 'NBD' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {lead.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                        <Clock size={14} className="text-gray-400" />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 px-1 uppercase tracking-widest">
                        <button 
                          onClick={() => handleAnalyze(lead)}
                          className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                          title="Generate AI Insights"
                        >
                          <Sparkles size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Lead"
      >
        <form onSubmit={handleAddLead} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="John" />
            <Input label="Last Name" name="lastName" required placeholder="Doe" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" placeholder="john@example.com" />
            <Input label="Phone" name="phone" placeholder="+1 (555) 000-0000" />
          </div>

          <Input label="Company" name="company" placeholder="Acme Inc." />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Status" 
              name="status" 
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Unqualified', label: 'Unqualified' },
                { value: 'Lost', label: 'Lost' },
              ]} 
            />
            <Input label="Source" name="source" placeholder="LinkedIn, Referral, etc." />
          </div>

          <Select 
            label="Type (NBD/CRR-NBD)" 
            name="tag" 
            options={[
              { value: '', label: 'Select Type' },
              { value: 'NBD', label: 'NBD (New Business)' },
              { value: 'CRR-NBD', label: 'CRR-NBD (Current Customer)' },
            ]} 
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">Notes</label>
            <textarea 
              name="notes"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all outline-none"
              placeholder="Add any initial details about this lead..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Lead</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedLead && !isModalOpen}
        onClose={() => setSelectedLead(null)}
        title={`Lead Intelligence: ${selectedLead?.firstName} ${selectedLead?.lastName}`}
      >
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto font-sans">
          <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-brand-primary" size={20} />
              <h4 className="font-extrabold text-brand-primary uppercase tracking-widest text-xs">AI Engagement Strategy</h4>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-brand-primary text-sm animate-pulse font-bold uppercase tracking-widest">
                <span>Analyzing lead data...</span>
              </div>
            ) : (
              <div className="prose prose-sm prose-red max-w-none text-brand-secondary/80 font-medium">
                <ReactMarkdown>{aiInsights || 'No insights available.'}</ReactMarkdown>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Lead Summary</h4>
            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Company</p>
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400" />
                  <p className="text-sm font-bold text-brand-secondary">{selectedLead?.company || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Status</p>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full inline-block",
                  selectedLead ? STATUS_COLORS[selectedLead.status] : ''
                )}>
                  {selectedLead?.status}
                </span>
              </div>
              <div className="col-span-2 pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <p className="text-sm font-medium">{selectedLead?.email || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-sm font-medium">{selectedLead?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button variant="primary" onClick={() => setSelectedLead(null)}>Dismiss</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
