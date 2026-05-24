import request from 'supertest';
import { app, server } from '../index';

describe('Express Server API Tests', () => {
  afterAll((done) => {
    // Terminate server after running tests
    server.close(done);
  });

  test('GET /health - should return status OK and 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api/leads - should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authorization header is missing');
  });

  test('GET /api/settings - should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.statusCode).toBe(401);
  });
});
