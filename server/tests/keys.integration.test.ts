import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockPool = { query: jest.fn(), initializeDatabase: jest.fn().mockResolvedValue(undefined) };
// ESM: unstable_mockModule must be used to mock before importing the module
jest.unstable_mockModule('../db', () => ({ default: mockPool, initializeDatabase: mockPool.initializeDatabase }));

let app: any;
let pool: any;
beforeAll(async () => {
  // Import app after mocking DB
  const mod = await import('../index');
  app = mod.default || mod;
  const dbmod = await import('../db');
  pool = dbmod.default || dbmod;
});

const JWT_SECRET = process.env.JWT_SECRET || 'gaia-secret-key-2025';

describe('Keys endpoints (integration)', () => {
  afterEach(() => {
    jest.resetAllMocks();
    (global as any).fetch = undefined;
  });

  it('should validate TEST_ keys as OK', async () => {
    const token = jwt.sign({ id: 'user-1', email: 'u@example.com', isGuest: false }, JWT_SECRET);

    const response = await request(app)
      .post('/keys/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        openai_key: 'TEST_OPENAI',
        gemini_key: 'TEST_GEMINI',
        instagram_token: 'TEST_META',
        whatsapp_token: 'TEST_META',
        google_ads_key: 'TEST_GOADS',
        google_ads_customer_id: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.openai.ok).toBe(true);
    expect(response.body.data.openai_alt).toEqual(expect.objectContaining({ ok: false }));
    expect(response.body.data.gemini.ok).toBe(true);
    expect(response.body.data.gemini_alt).toEqual(expect.objectContaining({ ok: false }));
    expect(response.body.data.instagram.ok).toBe(true);
    expect(response.body.data.whatsapp.ok).toBe(true);
    expect(response.body.data.meta.ok).toBe(false);
  });

  it('should save keys (encrypted) and return success', async () => {
    const token = jwt.sign({ id: 'user-2', email: 'u2@example.com', isGuest: false }, JWT_SECRET);

    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

    const response = await request(app)
      .post('/keys/salvar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        google_ads_key: 'GA-KEY',
        google_ads_customer_id: '999999',
        instagram_token: 'INST-TOK',
        whatsapp_token: 'WA-TOK',
        openai_key: 'OPEN-TOK',
        gemini_key: 'GEM-TOK',
        meta_key: 'META-TOK'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // ensure DB was called to update (mock verifies call)
    expect(pool.query).toHaveBeenCalled();
    const callArgs = (pool.query as jest.Mock).mock.calls[0];
    const sql = callArgs[0];
    const params = callArgs[1];
    expect(sql).toContain('UPDATE users');
    expect(params.length).toBeGreaterThanOrEqual(8);
    // encrypted meta_key should be present in params (not null)
    expect(params).toEqual(expect.arrayContaining([expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything(), 'user-2']));
  });

  it('should return decrypted (or original) meta from /keys/meus-dados', async () => {
    const token = jwt.sign({ id: 'user-3', email: 'u3@example.com', isGuest: false }, JWT_SECRET);

    // Return a user row with plain meta (decryptText will return original if decryption fails)
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 'user-3', email: 'u3@example.com', nome: 'User 3', google_ads_key: null, google_ads_customer_id: null, instagram_token: null, whatsapp_token: null, openai_key: null, gemini_key: null, meta_key: 'META_VALUE' }] });

    const response = await request(app)
      .get('/keys/meus-dados')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.chaves.meta).toBe('META_VALUE');
  });

  it('should return 401 when no token provided', async () => {
    const response = await request(app).post('/keys/validate').send({});
    expect(response.status).toBe(401);
  });
});
