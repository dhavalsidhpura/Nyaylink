// Global test environment setup
process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long-dummy';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
(process.env as any).NODE_ENV = 'test';
