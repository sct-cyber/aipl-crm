import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Opportunity, OpportunityStage, Account } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  BarChart3, 
  DollarSign, 
  Calendar, 
  Plus,
  ArrowRight,
  TrendingUp,
  Target,
  Building2
} from 'lucide-react';

const STAGES: OpportunityStage[] = [
  'Prospecting', 
  'Qualification', 
  'Proposal', 
  'Negotiation', 
  'Closed Won', 
  'Closed Lost'
];

export default function OpportunitiesView() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubOpps = crmService.subscribeToOpportunities(setOpportunities);
    const unsubAccs = crmService.subscribeToAccounts((data) => {
      setAccounts(data);
      setIsLoading(false);
    });
    return () => { unsubOpps(); unsubAccs(); };
  }, []);

  const handleAddOpportunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oppData = {
      name: formData.get('name') as string,
      accountId: formData.get('accountId') as string,
      value: Number(formData.get('value')),
      stage: formData.get('stage') as OpportunityStage,
      probability: Number(formData.get('probability')),
      expectedCloseDate: formData.get('expectedCloseDate') as string,
      tag: (formData.get('tag') as any) || undefined,
    };

    await crmService.addOpportunity(oppData);
    setIsModalOpen(false);
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown Account';
  
  const pipelineValue = opportunities
    .filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage))
    .reduce((sum, o) => sum + o.value, 0);

  const closedWonValue = opportunities
    .filter(o => o.stage === 'Closed Won')
    .reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Sales Pipeline</h1>
          <p className="text-brand-muted text-sm font-medium">Monitor deal stages and forecast revenue.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Opportunity</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-brand-primary text-white border-none shadow-2xl shadow-brand-primary/20 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <TrendingUp size={24} />
            <span className="text-xs font-extrabold uppercase tracking-widest">Potential Revenue</span>
          </div>
          <p className="text-5xl font-black tracking-tighter">${pipelineValue.toLocaleString()}</p>
          <p className="text-[10px] mt-6 text-white/60 font-medium uppercase tracking-widest leading-loose">Calculated from {opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).length} active pipeline deals</p>
        </Card>
        <Card className="p-8 bg-brand-secondary text-white border-none shadow-2xl shadow-brand-secondary/10 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <Target size={24} />
            <span className="text-xs font-extrabold uppercase tracking-widest">Closed Revenue</span>
          </div>
          <p className="text-5xl font-black tracking-tighter">${closedWonValue.toLocaleString()}</p>
          <p className="text-[10px] mt-6 text-white/60 font-medium uppercase tracking-widest leading-loose">Total revenue from {opportunities.filter(o => o.stage === 'Closed Won').length} Closed Won deals</p>
        </Card>
        <Card className="p-8 border-2 border-dashed border-gray-100 bg-brand-light flex flex-col justify-center text-center rounded-[2rem]">
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Win Rate</p>
          <p className="text-4xl font-black text-brand-secondary tracking-tighter">
            {opportunities.length ? Math.round((opportunities.filter(o => o.stage === 'Closed Won').length / (opportunities.filter(o => ['Closed Won', 'Closed Lost'].includes(o.stage)).length || 1)) * 100) : 0}%
          </p>
        </Card>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {STAGES.map((stage) => {
            const stageOpps = opportunities.filter(o => o.stage === stage);
            const stageValue = stageOpps.reduce((sum, o) => sum + o.value, 0);

            return (
              <div key={stage} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-brand-secondary uppercase tracking-widest">{stage}</h3>
                    <span className="text-[10px] font-black text-brand-muted bg-brand-accent px-2 py-0.5 rounded-full uppercase">{stageOpps.length}</span>
                  </div>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">${stageValue.toLocaleString()}</span>
                </div>

                <div className="flex flex-col gap-4 min-h-[500px] p-3 bg-brand-light/50 rounded-3xl border border-brand-primary/5">
                  {stageOpps.map((opp) => (
                    <Card key={opp.id} className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab bg-white border-none shadow-sm rounded-2xl group">
                      <h4 className="text-sm font-black text-brand-secondary mb-1 tracking-tight group-hover:text-brand-primary transition-colors">{opp.name}</h4>
                      <div className="flex items-center gap-1.5 mb-5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-bold uppercase tracking-widest leading-none">
                        <Building2 size={12} className="text-gray-300" />
                        {getAccountName(opp.accountId)}
                      </p>
                      {opp.tag && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                          opp.tag === 'NBD' ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
                        )}>
                          {opp.tag}
                        </span>
                      )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-1 text-brand-primary font-black text-sm tracking-tight">
                          <DollarSign size={14} />
                          <span>{opp.value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar size={12} className="text-gray-300" />
                          <span>{opp.expectedCloseDate || 'TBD'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <button className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-black hover:border-gray-300 transition-all text-xs font-bold uppercase tracking-wider group mt-auto">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    <span>Quick Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Open New Sales Opportunity"
      >
        <form onSubmit={handleAddOpportunity} className="p-8 space-y-6">
          <Input label="Deal Name" name="name" required placeholder="Q4 Expansion, Enterprise License, etc." />
          
          <Select 
            label="Account" 
            name="accountId" 
            required
            options={accounts.map(a => ({ value: a.id, label: a.name }))} 
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Deal Value ($)" name="value" type="number" required placeholder="50000" />
            <Input label="Win Probability (%)" name="probability" type="number" placeholder="25" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Pipeline Stage" 
              name="stage" 
              options={STAGES.map(s => ({ value: s, label: s }))} 
            />
            <Input label="Expected Close" name="expectedCloseDate" type="date" />
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Launch Deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


