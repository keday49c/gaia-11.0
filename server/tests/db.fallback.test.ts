jest.resetModules();

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => {
      return {
        query: async () => { throw new Error('connect failed'); },
        on: () => {},
      };
    }),
  };
});

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      prepare: () => ({
        all: () => [],
        run: () => ({ changes: 0 }),
      }),
    };
  });
});

import { initializeDatabase, getPool } from '../db';

describe('initializeDatabase fallback', () => {
  test('falls back to sqlite when postgres is unreachable', async () => {
    // Clear env to ensure code tries Postgres first
    delete process.env.DATABASE;

    await expect(initializeDatabase()).resolves.not.toThrow();

    const pool = getPool();
    expect(pool).toBeDefined();
    expect(pool._type).toBe('sqlite');

    // Basic sqlite query should respond
    const res = await pool.query('SELECT 1');
    expect(res).toHaveProperty('rows');
  });
});