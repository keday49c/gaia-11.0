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

describe('Admin dry-run and logs endpoints', () => {
  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.DRY_RUN;
  });

  it('can enable and disable dry-run via POST and read via GET', async () => {
    const token = jwt.sign({ id: 'admin-1', email: 'admin@example.com', isGuest: false }, JWT_SECRET);

    const enableRes = await request(app).post('/admin/dry-run').set('Authorization', `Bearer ${token}`).send({ enabled: true });
    expect(enableRes.status).toBe(200);
    expect(enableRes.body.success).toBe(true);
    expect(enableRes.body.enabled).toBe(true);

    const getRes = await request(app).get('/admin/dry-run').set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.enabled).toBe(true);

    const disableRes = await request(app).post('/admin/dry-run').set('Authorization', `Bearer ${token}`).send({ enabled: false });
    expect(disableRes.status).toBe(200);
    expect(disableRes.body.enabled).toBe(false);
  });

  it('returns logs (empty if none)', async () => {
    const token = jwt.sign({ id: 'admin-2', email: 'a2@example.com', isGuest: false }, JWT_SECRET);
    const res = await request(app).get('/admin/logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});