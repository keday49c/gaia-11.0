import { createGoogleAdsCampaign } from '../lib/googleAds';

describe('createGoogleAdsCampaign', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('returns simulated response for TEST_ token', async () => {
    const campaign = { nome: 'Test Campaign' } as any;
    const resp = await createGoogleAdsCampaign(campaign, { token: 'TEST_ABC', customerId: '123' });
    expect(resp).toMatchObject({ success: true, provider: 'google_ads', simulated: true });
    expect(resp.resourceName).toBeDefined();
    expect(typeof resp.resourceName).toBe('string');
    expect(resp.resourceName).toContain('TEST-');
  });

  test('throws when token/customerId missing (non-test)', async () => {
    const campaign = { nome: 'Test' } as any;
    await expect(createGoogleAdsCampaign(campaign, { token: '', customerId: '' })).rejects.toThrow(/not configured/i);
  });

  test('includes optional headers and parses ok response', async () => {
    const campaign = { nome: 'Real Campaign' } as any;
    const fakeResponse = { resourceName: 'customers/123/campaigns/456' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fakeResponse),
    } as any);

    const res = await createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123', developerToken: 'dev-1', loginCustomerId: 'login-1' });
    expect(res).toMatchObject({ success: true, provider: 'google_ads' });
    expect(res.resource).toEqual(fakeResponse);
    // fetch called with headers includes developer-token and login-customer-id
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['developer-token']).toBe('dev-1');
    expect(call[1].headers['login-customer-id']).toBe('login-1');
  });

  test('throws on network error', async () => {
    const campaign = { nome: 'Net Error' } as any;
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    await expect(createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123' })).rejects.toThrow(/network error/i);
  });

  test('throws on non-ok response with body', async () => {
    const campaign = { nome: 'Bad' } as any;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: 'bad request' }),
    } as any);
    await expect(createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123' })).rejects.toThrow(/Google Ads API error/);
  });
});
