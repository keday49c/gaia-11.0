import { checkHasAdmin } from '../../lib/admin';

jest.mock('../../db', () => ({
  query: jest.fn(),
}));

import pool from '../../db';

describe('checkHasAdmin', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when count > 0', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ cnt: '1' }] });
    const res = await checkHasAdmin();
    expect(res).toBe(true);
  });

  it('returns false when count = 0', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ cnt: '0' }] });
    const res = await checkHasAdmin();
    expect(res).toBe(false);
  });

  it('throws when pool.query rejects', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(checkHasAdmin()).rejects.toThrow('fail');
  });
});