import fetch from 'node-fetch';

/**
 * Create a Google Ads campaign using either a provided token/customerId (per-user)
 * or fallback to environment variables (GOOGLE_ADS_TOKEN / GOOGLE_ADS_CUSTOMER_ID).
 */
export async function createGoogleAdsCampaign(campaign: any, token?: string, customerId?: string) {
  const GOOGLE_ADS_TOKEN = token || process.env.GOOGLE_ADS_TOKEN || '';
  const GOOGLE_ADS_CUSTOMER_ID = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID || '';

  if (!GOOGLE_ADS_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
    throw new Error('GOOGLE_ADS_TOKEN or GOOGLE_ADS_CUSTOMER_ID not configured (provide token and customerId or set env vars)');
  }

  // NOTE: This is still a minimal placeholder implementation. A production version
  // should implement Google Ads API client with proper field mappings and error handling.
  const url = `https://googleads.googleapis.com/v14/customers/${GOOGLE_ADS_CUSTOMER_ID}/campaigns`;
  const body = {
    name: campaign.nome || campaign.titulo || 'Gaia Campaign',
    status: 'PAUSED',
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GOOGLE_ADS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google Ads API error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data;
}

export default { createGoogleAdsCampaign };
