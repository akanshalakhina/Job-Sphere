import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../lib/mongodb', () => {
  return {
    isDBConnected: vi.fn(() => false),
    mongoose: {
      Schema: class {
        static Types = { Mixed: 'Mixed', ObjectId: 'ObjectId' };
        index() {}
      },
      model: vi.fn(),
      models: {}
    }
  };
});

import jobsRouter from './jobs';

const app = express();
app.use(express.json());
app.use('/api', jobsRouter);

describe('Jobs Route Tests', () => {
  it('GET /api/jobs returns seeded memory jobs when DB is offline', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/jobs/:id handles DB offline and job not found', async () => {
    const res = await request(app).get('/api/jobs/123');
    expect(res.status).toBe(404);
  });
});
