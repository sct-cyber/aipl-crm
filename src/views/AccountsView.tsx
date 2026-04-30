import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Globe, Phone, Building2, DollarSign, Users } from 'lucide-react';
import { crmService } from '../services/crmService';
import type { Account } from '../types';

export default function AccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    accountName: '',
    website: '',
    phone: '',
    industry: '',
    type: 'Prospect' as Account['type'],
    ownership: 'Private' as Account['ownership'],
    annualRevenue: '',
    numberOfEmployees: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: '',
    parentAccountId: '',
    description: '',
  });

  useEffect(() => {
    const unsubscribe = crmService.accounts.subscribe(setAccounts);
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parentAccount = formData.parentAccountId
        ? accounts.find((a) => a.id === formData.parentAccountId)
        : null;

      const accountData = {
        ...formData,
        parentAccountName: parentAccount?.accountName,
        annualRevenue: formData.annualRevenue ? Number(formData.annualRevenue) : undefined,
        numberOfEmployees: formData.numberOfEmployees
          ? Number(formData.numberOfEmployees)
          : undefined,
      };

      if (editingAccount) {
        await crmService.accounts.update(editingAccount.id, accountData);
      } else {
        await crmService.accounts.create(accountData);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Error saving account. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await crmService.accounts.delete(id);
      } catch (error) {
        alert('Error deleting account. Please try again.');
      }
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      website: account.website || '',
      phone: account.phone || '',
      industry: account.industry || '',
      type: account.type || 'Prospect',
      ownership: account.ownership || 'Private',
      annualRevenue: account.annualRevenue?.toString() || '',
      numberOfEmployees: account.numberOfEmployees?.toString() || '',
      billingStreet: account.billingStreet || '',
      billingCity: account.billingCity || '',
      billingState: account.billingState || '',
      billingZip: account.billingZip || '',
      billingCountry: account.billingCountry || '',
      shippingStreet: account.shippingStreet || '',
      shippingCity: account.shippingCity || '',
      shippingState: account.shippingState || '',
      shippingZip: account.shippingZip || '',
      shippingCountry: account.shippingCountry || '',
      parentAccountId: account.parentAccountId || '',
      description: account.description || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      accountName: '',
      website: '',
      phone: '',
      industry: '',
      type: 'Prospect',
      ownership: 'Private',
      annualRevenue: '',
      numberOfEmployees: '',
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: '',
      shippingStreet: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      shippingCountry: '',
      parentAccountId: '',
      description: '',
    });
  };

  const copyBillingToShipping = () => {
    setFormData({
      ...formData,
      shippingStreet: formData.billingStreet,
      shippingCity: formData.billingCity,
      shippingState: formData.billingState,
      shippingZip: formData.billingZip,
      shippingCountry: formData.billingCountry,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">{accounts.length} total accounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Account Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No accounts yet. Click "Add Account" to create your first account.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{account.accountName}</p>
                      {account.parentAccountName && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Parent: {account.parentAccountName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.type === 'Customer'
                          ? 'bg-green-100 text-green-700'
                          : account.type === 'Prospect'
                          ? 'bg-blue-100 text-blue-700'
                          : account.type === 'Partner'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {account.type || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{account.industry || '-'}</td>
                  <td className="px-6 py-4">
                    {account.annualRevenue ? (
                      <div className="flex items-center gap-1 text-gray-700">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {(account.annualRevenue / 1000000).toFixed(1)}M
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {account.numberOfEmployees ? (
                      <div className="flex items-center gap-1 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        {account.numberOfEmployees.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {account.website && (
                        <a
                          href={
                            account.website.startsWith('http')
                              ? account.website
                              : `https://${account.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title={account.website}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {account.phone && (
                        <a
                          href={`tel:${account.phone}`}
                          className="text-green-600 hover:text-green-800"
                          title={account.phone}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAccount ? 'Edit Account' : 'Add New Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountName}
                      onChange={(e) =>
                        setFormData({ ...formData, accountName: e.target.value })
                      }
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="www.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g., Technology, Healthcare"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as Account['type'] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Partner">Partner</option>
                      <option value="Reseller">Reseller</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ownership
                    </label>
                    <select
                      value={formData.ownership}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownership: e.target.value as Account['ownership'],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                      <option value="Subsidiary">Subsidiary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={formData.annualRevenue}
                      onChange={(e) =>
                        setFormData({ ...formData, annualRevenue: e.target.value })
                      }
                      placeholder="e.g., 5000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      value={formData.numberOfEmployees}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfEmployees: e.target.value })
                      }
                      placeholder="e.g., 150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Account
                    </label>
                    <select
                      value={formData.parentAccountId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentAccountId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- No Parent Account --</option>
                      {accounts
                        .filter((a) => a.id !== editingAccount?.id)
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.accountName}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select a parent company if this is a subsidiary
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      value={formData.billingStreet}
                      onChange={(e) =>
                        setFormData({ ...formData, billingStreet: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.billingCity}
                      onChange={(e) =>
                        setFormData({ ...formData, billingCity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.billingState}
                      onChange={(e) =>
                        setFormData({ ...formData, billingState: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.billingZip}
                      onChange={(e) =>
                        setFormData({ ...formData, billingZip: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.billingCountry}
                      onChange={(e) =>
                        setFormData({ ...formData, billingCountry: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                  <button
                    type="button"
                    onClick={copyBillingToShipping}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Copy from Billing
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      value={formData.shippingStreet}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingStreet: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.shippingCity}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingCity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.shippingState}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingState: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.shippingZip}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingZip: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.shippingCountry}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingCountry: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this account..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
