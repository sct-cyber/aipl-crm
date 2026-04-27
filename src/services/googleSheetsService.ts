declare const google: any;

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export const googleSheetsService = {
  getAccessToken: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if we have a valid cached token
      if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return resolve(accessToken);
      }

      const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured. Please add it to your environment variables.'));
      }

      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              accessToken = response.access_token;
              tokenExpiry = Date.now() + (response.expires_in * 1000);
              resolve(accessToken);
            } else {
              reject(new Error('Failed to get access token: ' + (response.error || 'Unknown error')));
            }
          },
        });
        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  },

  createSpreadsheet: async (title: string): Promise<string> => {
    const token = await googleSheetsService.getAccessToken();
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create spreadsheet: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.spreadsheetId;
  },

  syncData: async (spreadsheetId: string, data: { range: string, values: any[][] }[]) => {
    const token = await googleSheetsService.getAccessToken();
    
    // Batch update values
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: data.map(item => ({
          range: item.range,
          values: item.values
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to sync data: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  },

  formatLeadsForSheet: (leads: any[]) => {
    const header = ['ID', 'First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Created At'];
    const rows = leads.map(l => [
      l.id,
      l.firstName,
      l.lastName,
      l.company || '',
      l.email || '',
      l.phone || '',
      l.source || '',
      l.status,
      l.createdAt
    ]);
    return [header, ...rows];
  },

  formatAccountsForSheet: (accounts: any[]) => {
    const header = ['ID', 'Name', 'Industry', 'Website', 'Owner ID', 'Created At'];
    const rows = accounts.map(a => [
      a.id,
      a.name,
      a.industry || '',
      a.website || '',
      a.ownerId,
      a.createdAt
    ]);
    return [header, ...rows];
  },

  formatOpportunitiesForSheet: (opportunities: any[]) => {
    const header = ['ID', 'Name', 'Value', 'Stage', 'Close Date', 'Probability', 'Created At'];
    const rows = opportunities.map(o => [
      o.id,
      o.name,
      o.value,
      o.stage,
      o.closeDate || '',
      o.probability || '',
      o.createdAt
    ]);
    return [header, ...rows];
  }
};
