import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPool = { query: jest.fn(), initializeDatabase: jest.fn().mockResolvedValue(undefined) };
jest.unstable_mockModule('../db', () => ({ default: mockPool, initializeDatabase: mockPool.initializeDatabase }));

let app: any;
beforeAll(async () => {
  const mod = await import('../index');
  app = mod.default || mod;
});

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

describe('Meta validation and scopes', () => {
  afterEach(() => {
    jest.resetAllMocks();
    (global as any).fetch = undefined;
    delete process.env.META_REQUIRED_SCOPES;
    delete process.env.META_APP_ID;
    delete process.env.META_APP_SECRET;
  });

  it('accepts meta token when debug_token reports required scopes present', async () => {
    process.env.META_REQUIRED_SCOPES = 'pages_read_engagement,ads_management';
    process.env.META_APP_ID = 'app-1';
    process.env.META_APP_SECRET = 'secret-1';

    // Mock /me
    (global as any).fetch = jest.fn()
      // first call: /me
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '123', name: 'User' }) })
      // second call: debug_token
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { scopes: ['pages_read_engagement', 'ads_management'] } }) });

    const token = jwt.sign({ id: 'u1', email: 'u1@example.com', isGuest: false }, JWT_SECRET);

    const res = await request(app)
      .post('/keys/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ instagram_token: token });

    console.log('META TEST RESPONSE:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.instagram.ok).toBe(true);
    expect(res.body.data.instagram.message).toMatch(/válido/i);
  });

  it('returns missing scopes when debug_token lacks some scopes', async () => {
    process.env.META_REQUIRED_SCOPES = 'pages_read_engagement,ads_management';
    process.env.META_APP_ID = 'app-1';
    process.env.META_APP_SECRET = 'secret-1';

    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '123', name: 'User' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { scopes: ['pages_read_engagement'] } }) });

    const token = jwt.sign({ id: 'u2', email: 'u2@example.com', isGuest: false }, JWT_SECRET);

    const res = await request(app)
      .post('/keys/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ instagram_token: token });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.instagram.ok).toBe(false);
    expect(res.body.data.instagram.message).toMatch(/faltam scopes/i);
  });

  it('fails when required scopes set but APP credentials missing', async () => {
    process.env.META_REQUIRED_SCOPES = 'pages_read_engagement';
    // no app creds

    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: '123' }) });

    const token = jwt.sign({ id: 'u3', email: 'u3@example.com', isGuest: false }, JWT_SECRET);

    const res = await request(app)
      .post('/keys/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ instagram_token: token });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.instagram.ok).toBe(false);
    expect(res.body.data.instagram.message).toMatch(/ausentes/i);
  });
});
