jest.mock('../db', () => require('./db-mock'));
import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';
import pool from './db-mock';
const app = require('./test-utils/app').default;

describe('GET /auth/has-admin', () => {
  beforeAll(async () => {
    // Ensure users table mock has exactly one user (admin)
    await pool.query("DELETE FROM users");
    await pool.query("INSERT INTO users (id, email, senha) VALUES ('11111111-1111-1111-1111-111111111111','admin@gaia.local','hashed')");
  });

  it('returns hasAdmin true when an admin exists', async () => {
    const res = await request(app).get('/auth/has-admin');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.hasAdmin).toBe(true);
  });
});
