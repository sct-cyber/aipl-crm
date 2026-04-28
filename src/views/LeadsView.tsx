import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Lead, LeadStatus, LeadTag } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { analyzeLead } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Filter,
  Plus,
  Sparkles,
  Users
} from 'lucide-react';

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: 'bg-[#e9f5db] text-[#4b5d3f] border-[#d4e5c5]',
  Contacted: 'bg-[#fefae0] text-[#7a6d2b] border-[#f9f3cf]',
  Qualified: 'bg-[#6b705c]/10 text-[#6b705c] border-[#6b705c]/20',
  Unqualified: 'bg-red-50 text-red-700 border-red-200',
  Lost: 'bg-gray-100 text-gray-600 border-gray-300'
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

  const handleDeleteLead = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) {
      try {
        await crmService.deleteLead(id);
      } catch (error) {
        alert("Error deleting lead. Please try again.");
      }
    }
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
    <div className="p-4 sm:p-8 w-full max-w-full mx-auto space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">Leads</h1>
          <p className="text-slate-500 text-sm font-medium">You have {leads.length} active leads in your pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} className="bg-[#CC0000] hover:bg-red-700 text-white">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Lead</span>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                <th className="px-6 py-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">Loading your pipeline...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Users size={24} />
                      </div>
                      <p className="font-medium text-slate-500">No leads found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-[#CC0000] flex items-center justify-center font-bold text-xs">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{lead.firstName} {lead.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{lead.source || 'Direct'}</p>
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
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="truncate max-w-[150px]">{lead.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} className="text-slate-300" />
                          <span>{lead.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={12} className="text-slate-300" />
                          <span>{lead.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                       {lead.tag && (
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                          lead.tag === 'NBD' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {lead.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <Clock size={12} />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleAnalyze(lead)}
                          className="p-2 text-[#CC0000] hover:bg-red-50 rounded-lg transition-all"
                          title="AI Insights"
                        >
                          <Sparkles size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
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

      {/* Add Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead">
        <form onSubmit={handleAddLead} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required />
            <Input label="Last Name" name="lastName" required />
          </div>
          <Input label="Company" name="company" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" />
            <Input label="Phone" name="phone" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" name="status" options={[
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
            ]} />
            <Select label="Type" name="tag" options={[
              { value: 'NBD', label: 'NBD' },
              { value: 'CRR-NBD', label: 'CRR-NBD' },
            ]} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-[#CC0000]">Save Lead</Button>
          </div>
        </form>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        isOpen={!!selectedLead && !isModalOpen}
        onClose={() => setSelectedLead(null)}
        title={`Lead Strategy: ${selectedLead?.firstName} ${selectedLead?.lastName}`}
      >
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-slate-900 text-white p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-red-500" size={20} />
              <h4 className="font-bold uppercase tracking-widest text-xs">AIPL AI Engagement Strategy</h4>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse font-bold">
                <span>Running Analysis...</span>
              </div>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{aiInsights || 'No insights available.'}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
