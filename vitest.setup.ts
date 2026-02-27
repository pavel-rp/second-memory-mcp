import 'dotenv/config';

// CRITICAL: Ensure tests use a PostgreSQL test database
process.env.NODE_ENV = 'test';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set for tests. ' +
      'Example: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/second_memory_test'
  );
}
