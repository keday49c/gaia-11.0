jest.mock('../db', () => ({ query: jest.fn(), initializeDatabase: jest.fn().mockResolvedValue(undefined) }));

import request from 'supertest';
import app from '../index';
import pool from '../db';

describe('GET /auth/has-admin (integration)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns hasAdmin true when there are users besides demo', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ cnt: '2' }] });
    const res = await request(app).get('/auth/has-admin');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasAdmin).toBe(true);
  });

  it('returns hasAdmin false when only demo user exists', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ cnt: '0' }] });
    const res = await request(app).get('/auth/has-admin');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasAdmin).toBe(false);
  });
});