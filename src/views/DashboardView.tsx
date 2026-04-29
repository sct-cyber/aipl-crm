import { useEffect, useState } from 'react';
import { TrendingUp, Users, Building2, DollarSign } from 'lucide-react';
import { crmService } from '../services/crmService';
import type { Lead, Contact, Account, Deal } from '../types';

export default function DashboardView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const unsubLeads = crmService.leads.subscribe(setLeads);
    const unsubContacts = crmService.contacts.subscribe(setContacts);
    const unsubAccounts = crmService.accounts.subscribe(setAccounts);
    const unsubDeals = crmService.deals.subscribe(setDeals);

    return () => {
      unsubLeads();
      unsubContacts();
      unsubAccounts();
      unsubDeals();
    };
  }, []);

  // Calculate metrics
  const totalRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.amount, 0);

  const pipelineValue = deals
    .filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + d.amount, 0);

  const stats = [
    {
      name: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Contacts',
      value: contacts.length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Accounts',
      value: accounts.length,
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      name: 'Pipeline Value',
      value: `$${(pipelineValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
          {leads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leads yet</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lead.status === 'New'
                        ? 'bg-blue-100 text-blue-700'
                        : lead.status === 'Contacted'
                        ? 'bg-yellow-100 text-yellow-700'
                        : lead.status === 'Qualified'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Deals</h2>
          {deals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No deals yet</p>
          ) : (
            <div className="space-y-3">
              {deals
                .filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
                .slice(0, 5)
                .map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{deal.dealName}</p>
                      <p className="text-sm text-gray-500">{deal.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${deal.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{deal.probability}%</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
