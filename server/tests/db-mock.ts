type Row = Record<string, any>;

let users: Row[] = [];

const pool = {
  async query(sql: string) {
    // Simple behavior for tests: support users table management and count
    if (/DELETE\s+FROM\s+users/i.test(sql)) {
      users = [];
      return { rows: [] };
    }
    if (/INSERT\s+INTO\s+users/i.test(sql)) {
      // crude parse to detect inserted row
      users.push({});
      return { rows: [] };
    }
    if (/SELECT\s+COUNT\(\*\)/i.test(sql)) {
      return { rows: [{ cnt: String(users.length) }] };
    }
    return { rows: [] };
  },
};

export default pool;
