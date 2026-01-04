import assert from 'assert';
import { createGoogleAdsCampaign } from '../lib/googleAds';

async function run() {
  console.log('Running manual googleAds tests...');

  // Test 1: simulated TEST_ token
  {
    const campaign = { nome: 'Test Campaign' } as any;
    const resp = await createGoogleAdsCampaign(campaign, { token: 'TEST_ABC', customerId: '123' });
    assert.strictEqual(resp.success, true);
    assert.strictEqual(resp.provider, 'google_ads');
    assert.strictEqual(resp.simulated, true);
  }

  // Test 2: missing token/customerId should throw
  {
    const campaign = { nome: 'Test' } as any;
    let threw = false;
    try {
      await createGoogleAdsCampaign(campaign, { token: '', customerId: '' } as any);
    } catch (err: any) {
      threw = /not configured/i.test(err.message);
    }
    assert.strictEqual(threw, true, 'expected not configured error');
  }

  // Test 3: ok response parsing and headers
  {
    const campaign = { nome: 'Real Campaign' } as any;
    const fakeResponse = { resourceName: 'customers/123/campaigns/456' };

    (global as any).fetch = async (_url: string, opts: any) => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fakeResponse),
      headers: { get: () => null },
    });

    const res = await createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123', developerToken: 'dev-1', loginCustomerId: 'login-1' });
    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(res.resource, fakeResponse);

    // Check that the last fetch used headers (we can't introspect easily here unless we wrap)
    // We'll instead replace fetch with a spy to capture headers
    let capturedHeaders: any;
    (global as any).fetch = async (_url: string, opts: any) => {
      capturedHeaders = opts.headers;
      return { ok: true, status: 200, text: async () => JSON.stringify(fakeResponse) } as any;
    };
    await createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123', developerToken: 'dev-1', loginCustomerId: 'login-1' });
    assert.strictEqual(capturedHeaders['developer-token'], 'dev-1');
    assert.strictEqual(capturedHeaders['login-customer-id'], 'login-1');
  }

  // Test 4: network error
  {
    const campaign = { nome: 'Net Error' } as any;
    (global as any).fetch = async () => { throw new Error('network down'); };
    let threw = false;
    try {
      await createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123' });
    } catch (err: any) {
      threw = /network error/i.test(err.message);
    }
    assert.strictEqual(threw, true);
  }

  // Test 5: non-ok response with body
  {
    const campaign = { nome: 'Bad' } as any;
    (global as any).fetch = async () => ({ ok: false, status: 400, text: async () => JSON.stringify({ error: 'bad request' }) });
    let threw = false;
    try {
      await createGoogleAdsCampaign(campaign, { token: 'TOKEN_X', customerId: '123' });
    } catch (err: any) {
      threw = /Google Ads API error/i.test(err.message);
    }
    assert.strictEqual(threw, true);
  }

  console.log('All manual googleAds tests passed ✅');
}

run().catch((err) => {
  console.error('Manual tests failed:', err);
  process.exitCode = 1;
});
