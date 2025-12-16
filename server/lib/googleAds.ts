import fetch from 'node-fetch';

const GOOGLE_ADS_TOKEN = process.env.GOOGLE_ADS_TOKEN || '';
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || '';

export async function createGoogleAdsCampaign(campaign: any) {
  if (!GOOGLE_ADS_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
    throw new Error('GOOGLE_ADS_TOKEN or GOOGLE_ADS_CUSTOMER_ID not configured');
  }

  // NOTE: This is a minimal placeholder implementation.
  // Real implementation must call Google Ads API and map fields correctly.
  // We return a simulated response object but only when credentials are present.
  const url = `https://googleads.googleapis.com/v14/customers/${GOOGLE_ADS_CUSTOMER_ID}/campaigns`;
  const body = {
    // map local campaign fields to Google Ads fields - this is highly simplified
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
