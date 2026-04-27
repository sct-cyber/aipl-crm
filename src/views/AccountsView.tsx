import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Account } from '../types';
import { Card, Button, Modal, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  Plus, 
  Search,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

export default function AccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = crmService.subscribeToAccounts((data) => {
      setAccounts(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const accountData = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string,
      website: formData.get('website') as string,
      phone: formData.get('phone') as string,
      billingAddress: formData.get('billingAddress') as string,
    };

    await crmService.addAccount(accountData);
    setIsModalOpen(false);
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Accounts</h1>
          <p className="text-brand-muted text-sm font-medium">Manage company-level relationships and client organizations.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Account</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-medium">Loading accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Building2 size={24} />
              </div>
              <p className="font-medium text-gray-500">No accounts yet</p>
              <p className="text-sm text-gray-400">Add organizations you work with.</p>
            </div>
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="p-8 hover:border-brand-primary/20 transition-all cursor-pointer group rounded-[2rem]">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-brand-primary/5 text-brand-primary rounded-2xl flex items-center justify-center">
                  <Building2 size={28} />
                </div>
                <button className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-black text-brand-secondary mb-1 tracking-tight">{account.name}</h3>
              <p className="text-[10px] font-black text-brand-muted mb-8 uppercase tracking-widest">{account.industry || 'No industry specified'}</p>

              <div className="space-y-4">
                {account.website && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <Globe size={16} className="text-brand-primary" />
                    <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary hover:underline flex items-center gap-1">
                      {account.website.replace(/^https?:\/\//, '')}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {account.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <Phone size={16} className="text-gray-400" />
                    <span>{account.phone}</span>
                  </div>
                )}
                {account.billingAddress && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">{account.billingAddress}</span>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-secondary text-[10px] font-bold text-white flex items-center justify-center">AI</div>
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Updated {new Date(account.updatedAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Register New Account"
      >
        <form onSubmit={handleAddAccount} className="p-8 space-y-6">
          <Input label="Company Name" name="name" required placeholder="Nexus Corp" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" name="industry" placeholder="Technology" />
            <Input label="Website" name="website" placeholder="www.nexus.com" />
          </div>

          <Input label="Phone Number" name="phone" placeholder="+1 (555) 000-0000" />
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">Billing Address</label>
            <textarea 
              name="billingAddress"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all outline-none"
              placeholder="Full address for invoicing..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
