import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Contact, Account } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Plus, 
  Search,
  MoreVertical
} from 'lucide-react';

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubContacts = crmService.subscribeToContacts(setContacts);
    const unsubAccounts = crmService.subscribeToAccounts((data) => {
      setAccounts(data);
      setIsLoading(false);
    });
    return () => { unsubContacts(); unsubAccounts(); };
  }, []);

  const handleAddContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contactData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      accountId: formData.get('accountId') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      jobTitle: formData.get('jobTitle') as string,
    };

    await crmService.addContact(contactData);
    setIsModalOpen(false);
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown Account';

  const filteredContacts = contacts.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Contacts</h1>
          <p className="text-brand-muted text-sm font-medium">Manage individual contacts and decision makers.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Contact</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
          />
        </div>
      </div>

      <Card className="p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-accent/50 bg-brand-light/30">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Name</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Account</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Title</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-brand-muted">Contact</th>
                <th className="px-6 py-5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/30 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400">Loading contacts...</td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <User size={24} />
                      </div>
                      <p className="font-medium text-gray-500">No contacts found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/5 text-brand-primary flex items-center justify-center font-bold text-xs">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{contact.firstName} {contact.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 size={16} className="text-gray-400" />
                        <span>{getAccountName(contact.accountId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase size={16} className="text-gray-400" />
                        <span>{contact.jobTitle || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail size={14} className="text-gray-400" />
                          <span>{contact.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={14} className="text-gray-400" />
                          <span>{contact.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={18} />
                      </button>
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
        title="Add New Contact"
      >
        <form onSubmit={handleAddContact} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="Jane" />
            <Input label="Last Name" name="lastName" required placeholder="Smith" />
          </div>
          
          <Select 
            label="Account" 
            name="accountId" 
            required
            options={[{ value: '', label: 'Select Account' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]} 
          />

          <Input label="Job Title" name="jobTitle" placeholder="Operations Manager" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" placeholder="jane@company.com" />
            <Input label="Phone" name="phone" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
