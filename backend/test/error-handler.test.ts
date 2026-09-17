import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import express from 'express';
import { errorHandler } from '../src/middleware/error-handler.js';

test('logs unexpected async errors without exposing internal details', async (context) => {
  const log = context.mock.method(console, 'error', () => {});
  const testApp = express();
  testApp.get('/failure', async () => {
    throw new Error('Private database details');
  });
  testApp.use(errorHandler);

  const server = testApp.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}/failure`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again.',
      },
    });
    assert.equal(log.mock.callCount(), 1);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
