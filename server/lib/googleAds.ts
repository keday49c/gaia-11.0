/**
 * Create a Google Ads campaign using either a provided token/customerId (per-user)
 * or fallback to environment variables (GOOGLE_ADS_TOKEN / GOOGLE_ADS_CUSTOMER_ID).
 *
 * Note: We rely on Node 20+ global fetch instead of `node-fetch` for runtime network calls.
 */
export async function createGoogleAdsCampaign(
  campaign: any,
  opts?: {
    token?: string;
    customerId?: string;
    developerToken?: string;
    loginCustomerId?: string;
    simulateIfTestKey?: boolean;
  }
) {
  const token = opts?.token || process.env.GOOGLE_ADS_TOKEN || '';
  const customerId = opts?.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID || '';
  const developerToken = opts?.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
  const loginCustomerId = opts?.loginCustomerId || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '';
  const simulateIfTestKey = opts?.simulateIfTestKey ?? true;

  // If TEST key or simulate option enabled, allow simulation without full creds
  if (String(token).startsWith('TEST_') && simulateIfTestKey) {
    console.log('ℹ️ Google Ads TEST key detected; simulating campaign creation');
    return {
      success: true,
      provider: 'google_ads',
      resourceName: `customers/${customerId || 'TEST_CUSTOMER'}/campaigns/TEST-${Date.now()}`,
      name: campaign.nome || campaign.titulo || 'Gaia Campaign',
      status: 'PAUSED',
      simulated: true,
      raw: null,
    } as any;
  }

  if (!token || !customerId) {
    throw new Error('GOOGLE_ADS_TOKEN or GOOGLE_ADS_CUSTOMER_ID not configured (provide token and customerId or set env vars)');
  }

  const url = `https://googleads.googleapis.com/v14/customers/${customerId}/campaigns`;
  const body = {
    name: campaign.nome || campaign.titulo || 'Gaia Campaign',
    status: 'PAUSED',
  };

  const headers: any = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (developerToken) headers['developer-token'] = developerToken;
  if (loginCustomerId) headers['login-customer-id'] = loginCustomerId;

  // Mask token for logs
  const maskedToken = typeof token === 'string' && token.length > 10 ? `${token.slice(0,6)}...${token.slice(-4)}` : '***';
  console.log(`ℹ️ GoogleAds request -> POST ${url} | customer=${customerId} | dev-token=${!!developerToken} | login-customer=${!!loginCustomerId} | token=${maskedToken}`);

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    console.error('⚠️ Network error calling Google Ads API:', err?.message ?? err);
    throw new Error(`Google Ads network error: ${err?.message ?? String(err)}`);
  }

  const text = await resp.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = text;
  }

  if (!resp.ok) {
    console.error('⚠️ Google Ads API error:', { status: resp.status, body: parsed });
    throw new Error(`Google Ads API error: ${resp.status} - ${JSON.stringify(parsed)}`);
  }

  console.log('✅ Google Ads API success:', { status: resp.status, bodySnippet: (typeof parsed === 'string' ? parsed.slice(0,200) : parsed?.resourceName || parsed) });

  return {
    success: true,
    provider: 'google_ads',
    resource: parsed,
    raw: parsed,
  } as any;
}

export default { createGoogleAdsCampaign };
