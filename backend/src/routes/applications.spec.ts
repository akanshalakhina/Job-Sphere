import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// Ensure the mongoose mock actually matches what User.ts needs: Schema.Types.Mixed
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

// Mock requireAuth middleware to bypass Clerk authentication in spec tests
vi.mock('../middlewares/requireAuth', () => {
  return {
    requireAuth: (req: any, res: any, next: any) => next(),
    getRequestUserId: (req: any) => req.headers['x-mock-user-id'] || 'mock_candidate_vansh',
    optionalAuth: (req: any, res: any, next: any) => next(),
    requireRole: () => (req: any, res: any, next: any) => next(),
    requireDbRole: () => (req: any, res: any, next: any) => next(),
  };
});

import applicationsRouter from './applications';
import { syncMemUser } from '../lib/memoryDb';

const app = express();
app.use(express.json());
app.use('/api', applicationsRouter);

describe('Applications Route Tests', () => {
  it('GET /api/applications/my returns gracefully when DB offline', async () => {
    syncMemUser('mock_candidate_vansh', { role: 'candidate', name: 'Vansh Candidate', email: 'vansh@gmail.com' });
    const res = await request(app)
      .get('/api/applications/my')
      .set('x-mock-user-id', 'mock_candidate_vansh')
      .set('x-mock-user-role', 'candidate');
    // If DB is offline, it returns [] or 503 depending on implementation. In our logic, `isDBConnected` returning false should yield []
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/applications/candidates handles offline DB', async () => {
    syncMemUser('mock_recruiter_olivia', { role: 'recruiter', name: 'Olivia Recruiter', email: 'olivia@company.com' });
    const res = await request(app)
      .get('/api/applications/candidates')
      .set('x-mock-user-id', 'mock_recruiter_olivia')
      .set('x-mock-user-role', 'recruiter');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
