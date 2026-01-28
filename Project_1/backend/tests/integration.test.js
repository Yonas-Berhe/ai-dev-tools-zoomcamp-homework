/**
 * Integration Tests
 * Tests frontend-backend communication
 */

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullPath = '/api' + path;
    const url = new URL(fullPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('API Integration Tests', () => {
  let authToken;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testPassword123';

  describe('Health Check', () => {
    it('returns healthy status', async () => {
      const { status, body } = await makeRequest('GET', '/health');
      
      assert.strictEqual(status, 200);
      assert.strictEqual(body.status, 'ok');
      assert.ok(body.timestamp);
    });
  });

  describe('Authentication Flow', () => {
    it('registers a new user', async () => {
      const { status, body } = await makeRequest('POST', '/auth/register', {
        email: testEmail,
        password: testPassword,
        name: 'Test User',
      });

      assert.strictEqual(status, 201);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.token);
      assert.ok(body.data.user);
      assert.strictEqual(body.data.user.email, testEmail);
      
      authToken = body.data.token;
    });

    it('fails to register duplicate email', async () => {
      const { status, body } = await makeRequest('POST', '/auth/register', {
        email: testEmail,
        password: 'anotherPassword123',
        name: 'Duplicate User',
      });

      assert.strictEqual(status, 409);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'EMAIL_EXISTS');
    });

    it('logs in with valid credentials', async () => {
      const { status, body } = await makeRequest('POST', '/auth/login', {
        email: testEmail,
        password: testPassword,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.token);
      
      authToken = body.data.token;
    });

    it('fails login with invalid password', async () => {
      const { status, body } = await makeRequest('POST', '/auth/login', {
        email: testEmail,
        password: 'wrongPassword',
      });

      assert.strictEqual(status, 401);
      assert.strictEqual(body.success, false);
    });

    it('gets user profile with valid token', async () => {
      const { status, body } = await makeRequest('GET', '/auth/me', null, authToken);

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.id);
      assert.strictEqual(body.data.email, testEmail);
    });

    it('fails to get profile without token', async () => {
      const { status, body } = await makeRequest('GET', '/auth/me');

      assert.strictEqual(status, 401);
      assert.strictEqual(body.success, false);
    });
  });

  describe('Loan Calculations', () => {
    it('calculates flat rate loan', async () => {
      const { status, body } = await makeRequest('POST', '/loans/calculate', {
        amount: 1000,
        interestRate: 10,
        termLength: 12,
        termUnit: 'months',
        interestType: 'flat',
        fees: 0,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.totalInterest, 100);
      assert.strictEqual(body.data.interestType, 'flat');
    });

    it('calculates reducing balance loan', async () => {
      const { status, body } = await makeRequest('POST', '/loans/calculate', {
        amount: 1000,
        interestRate: 12,
        termLength: 12,
        termUnit: 'months',
        interestType: 'reducing',
        fees: 0,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Math.abs(body.data.monthlyPayment - 88.85) < 1);
    });

    it('calculates compound interest loan', async () => {
      const { status, body } = await makeRequest('POST', '/loans/calculate', {
        amount: 1000,
        interestRate: 10,
        termLength: 12,
        termUnit: 'months',
        interestType: 'compound',
        fees: 0,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.interestType, 'compound');
    });

    it('includes predatory warning for high APR', async () => {
      const { status, body } = await makeRequest('POST', '/loans/calculate', {
        amount: 100,
        interestRate: 100,
        termLength: 1,
        termUnit: 'months',
        interestType: 'flat',
        fees: 50,
      });

      assert.strictEqual(status, 200);
      assert.ok(body.warning);
      assert.strictEqual(body.warning.isPredatory, true);
    });

    it('validates required fields', async () => {
      const { status, body } = await makeRequest('POST', '/loans/calculate', {
        amount: 1000,
        // Missing other fields
      });

      assert.strictEqual(status, 400);
      assert.strictEqual(body.success, false);
    });
  });

  describe('Loan CRUD Operations', () => {
    let savedLoanId;

    it('saves a loan calculation', async () => {
      const { status, body } = await makeRequest('POST', '/loans', {
        amount: 5000,
        interestRate: 8,
        termLength: 24,
        termUnit: 'months',
        interestType: 'reducing',
        fees: 100,
        currency: 'USD',
      }, authToken);

      assert.strictEqual(status, 201);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.id);
      
      savedLoanId = body.data.id;
    });

    it('retrieves loan history', async () => {
      const { status, body } = await makeRequest('GET', '/loans', null, authToken);

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 1);
    });

    it('deletes a loan', async () => {
      const { status } = await makeRequest('DELETE', `/loans/${savedLoanId}`, null, authToken);

      assert.strictEqual(status, 204);
    });
  });

  describe('Savings Goals', () => {
    let goalId;

    it('creates a savings goal', async () => {
      const { status, body } = await makeRequest('POST', '/savings', {
        name: 'Integration Test Goal',
        targetAmount: 10000,
        currency: 'USD',
      }, authToken);

      assert.strictEqual(status, 201);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.id);
      
      goalId = body.data.id;
    });

    it('lists savings goals', async () => {
      const { status, body } = await makeRequest('GET', '/savings', null, authToken);

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
    });

    it('adds transaction to goal', async () => {
      const { status, body } = await makeRequest('POST', `/savings/${goalId}/transactions`, {
        amount: 500,
        description: 'Initial deposit',
      }, authToken);

      assert.strictEqual(status, 201);
      assert.strictEqual(body.success, true);
    });

    it('updates goal details', async () => {
      const { status, body } = await makeRequest('PUT', `/savings/${goalId}`, {
        name: 'Updated Goal Name',
        targetAmount: 15000,
      }, authToken);

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.name, 'Updated Goal Name');
    });

    it('deletes a goal', async () => {
      const { status } = await makeRequest('DELETE', `/savings/${goalId}`, null, authToken);

      assert.strictEqual(status, 204);
    });
  });

  describe('Financial Literacy Lessons', () => {
    it('lists all lessons', async () => {
      const { status, body } = await makeRequest('GET', '/lessons');

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length >= 5);
    });

    it('gets a specific lesson', async () => {
      const { status, body } = await makeRequest('GET', '/lessons/1');

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(body.data);
      assert.strictEqual(body.data.id, 1);
    });

    it('returns 404 for non-existent lesson', async () => {
      const { status, body } = await makeRequest('GET', '/lessons/9999');

      assert.strictEqual(status, 404);
      assert.strictEqual(body.success, false);
    });
  });

  describe('Lenders Directory', () => {
    it('lists all lenders', async () => {
      const { status, body } = await makeRequest('GET', '/lenders');

      assert.strictEqual(status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data));
    });
  });

  describe('Error Handling', () => {
    it('returns 404 for unknown routes', async () => {
      const { status } = await makeRequest('GET', '/unknown-route');
      
      assert.strictEqual(status, 404);
    });

    it('handles malformed JSON', async () => {
      const url = new URL('/api/loans/calculate', BASE_URL);
      
      const { status } = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        });
        
        req.on('error', reject);
        req.write('not valid json{');
        req.end();
      });

      assert.ok(status >= 400);
    });
  });
});

// Note: These integration tests require the backend server to be running on localhost:3001
// Run with: npm test (after starting the server with npm start)
