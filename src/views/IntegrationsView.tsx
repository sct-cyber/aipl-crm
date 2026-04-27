import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { googleSheetsService } from '../services/googleSheetsService';
import { UserPreferences, Lead, Account, Opportunity } from '../types';
import { Card, Button } from '../components/ui';
import { 
  Table, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Link as LinkIcon,
  Shield,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function IntegrationsView() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    const unsubPrefs = crmService.subscribeToUserPreferences((data) => {
      setPrefs(data);
      setIsLoading(false);
    });

    const unsubLeads = crmService.subscribeToLeads(setLeads);
    const unsubAccs = crmService.subscribeToAccounts(setAccounts);
    const unsubOpps = crmService.subscribeToOpportunities(setOpportunities);

    return () => {
      unsubPrefs();
      unsubLeads();
      unsubAccs();
      unsubOpps();
    };
  }, []);

  const handleLinkSheet = async () => {
    try {
      setSyncStatus(null);
      const spreadsheetId = await googleSheetsService.createSpreadsheet('AshishInterbuild CRM Live Data');
      
      const newSyncSettings = {
        spreadsheetId,
        lastSyncAt: new Date().toISOString(),
        autoSync: true,
        syncLeads: true,
        syncAccounts: true,
        syncOpportunities: true,
      };

      await crmService.updateUserPreferences(prefs?.dashboardWidgets || [], newSyncSettings);
      setSyncStatus({ type: 'success', message: 'Successfully linked to a new Google Sheet!' });
    } catch (error: any) {
      console.error(error);
      setSyncStatus({ type: 'error', message: error.message || 'Failed to link Google Sheet' });
    }
  };

  const handleManualSync = async () => {
    if (!prefs?.sheetsSync?.spreadsheetId) return;

    try {
      setIsSyncing(true);
      setSyncStatus(null);

      const syncData = [];
      
      if (prefs.sheetsSync.syncLeads) {
        syncData.push({
          range: 'Leads!A1',
          values: googleSheetsService.formatLeadsForSheet(leads)
        });
      }

      if (prefs.sheetsSync.syncAccounts) {
        syncData.push({
          range: 'Accounts!A1',
          values: googleSheetsService.formatAccountsForSheet(accounts)
        });
      }

      if (prefs.sheetsSync.syncOpportunities) {
        syncData.push({
          range: 'Opportunities!A1',
          values: googleSheetsService.formatOpportunitiesForSheet(opportunities)
        });
      }

      await googleSheetsService.syncData(prefs.sheetsSync.spreadsheetId, syncData);
      
      await crmService.updateUserPreferences(
        prefs.dashboardWidgets,
        { ...prefs.sheetsSync, lastSyncAt: new Date().toISOString() }
      );

      setSyncStatus({ type: 'success', message: 'Data synced successfully to Google Sheets!' });
    } catch (error: any) {
      console.error(error);
      setSyncStatus({ type: 'error', message: error.message || 'Sync failed. Please check your connection.' });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Integrations</h1>
        <p className="text-brand-muted text-sm font-medium">Connect your CRM data to external platforms.</p>
      </div>

      <Card className="overflow-hidden border-brand-primary/10">
        <div className="p-8 bg-brand-primary/5 border-b border-brand-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0f9d58]">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-secondary">Google Sheets</h2>
              <p className="text-sm font-medium text-brand-muted">Live sync for Looker Studio dashboards</p>
            </div>
          </div>
          {prefs?.sheetsSync?.spreadsheetId && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#e6f4ea] text-[#0d652d] rounded-full text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 size={12} />
              Connected
            </div>
          )}
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-brand-secondary uppercase tracking-widest">About this integration</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Export your leads, accounts, and opportunities to a live Google Sheet. 
              This enables you to build advanced visualizations and real-time reports using **Looker Studio** or other BI tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-brand-primary mb-2"><Table size={20} /></div>
                <p className="text-xs font-black text-brand-secondary uppercase mb-1">Live Tables</p>
                <p className="text-[11px] text-brand-muted">Automatic mapping of CRM entities to sheet tabs.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-brand-primary mb-2"><RefreshCw size={20} /></div>
                <p className="text-xs font-black text-brand-secondary uppercase mb-1">Recent Data</p>
                <p className="text-[11px] text-brand-muted">Manual or automatic sync whenever data changes.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-brand-primary mb-2"><Shield size={20} /></div>
                <p className="text-xs font-black text-brand-secondary uppercase mb-1">Secure</p>
                <p className="text-[11px] text-brand-muted">Authorized via your Google account.</p>
              </div>
            </div>
          </div>

          {!prefs?.sheetsSync?.spreadsheetId ? (
            <div className="p-8 rounded-3xl border-2 border-dashed border-brand-accent/50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center text-brand-muted mb-4">
                <LinkIcon size={24} />
              </div>
              <h3 className="text-lg font-black text-brand-secondary mb-2">No Spreadsheet Linked</h3>
              <p className="text-sm text-brand-muted max-w-xs mb-6">
                Start by creating a new Google Sheet to store your live CRM data.
              </p>
              <Button 
                variant="primary" 
                onClick={handleLinkSheet}
                className="gap-2 px-8"
              >
                Create & Link Spreadsheet
                <ArrowRight size={18} />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-brand-accent/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-brand-muted uppercase tracking-widest mb-1">Linked Spreadsheet</p>
                  <p className="text-sm font-bold text-brand-secondary truncate max-w-sm">
                    {prefs.sheetsSync.spreadsheetId}
                  </p>
                </div>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${prefs.sheetsSync.spreadsheetId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand-primary text-sm font-bold hover:underline"
                >
                  Open Sheet
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  variant="primary" 
                  onClick={handleManualSync}
                  isLoading={isSyncing}
                  className="gap-2 flex-1"
                >
                  <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                  Sync to Sheets
                </Button>
                <Button variant="outline" className="flex-1">Settings</Button>
              </div>

              {prefs.sheetsSync.lastSyncAt && (
                <p className="text-[10px] text-center font-bold text-brand-muted uppercase tracking-widest">
                  Last synced: {new Date(prefs.sheetsSync.lastSyncAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {syncStatus && (
            <div className={cn(
              "p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
              syncStatus.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            )}>
              {syncStatus.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <AlertCircle className="shrink-0 mt-0.5" size={18} />}
              <p className="text-sm font-medium">{syncStatus.message}</p>
            </div>
          )}
        </div>
      </Card>
      
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 mb-1">Configuration Required</h4>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            To use this integration, you must provide your own Google Client ID in the settings. 
            Add `VITE_GOOGLE_CLIENT_ID` to your environment variables in the **Settings** menu.
          </p>
        </div>
      </div>
    </div>
  );
}
