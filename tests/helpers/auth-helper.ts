import { Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter' | 'admin';
  token?: string;
}

function generateMockJWT(userId: string, role: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const nowSecs = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    sid: "sess_mock",
    exp: nowSecs + 86400,
    nbf: nowSecs - 60,
    iat: nowSecs - 60,
    metadata: { role }
  };
  
  const base64UrlEncode = (obj: any) => {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signature = Buffer.from('mock_signature').toString('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function mockClerkAuth(page: Page, user: MockUser | null) {
  // Mock localStorage userRole for frontend context
  await page.addInitScript((userData) => {
    if (userData) {
      window.localStorage.setItem('userRole', userData.role);
      window.localStorage.setItem('clerk_mock_user', JSON.stringify(userData));
    } else {
      window.localStorage.removeItem('userRole');
      window.localStorage.setItem('clerk_mock_user', 'null');
    }
  }, user);

  // Set cookie for backend session authentication (Clerk uses __session cookie)
  page.on('request', request => {
    if (request.url().includes('clerk')) {
      console.log('CLERK REQUEST:', request.url(), request.method());
    }
  });
  page.on('requestfailed', request => {
    if (request.url().includes('clerk')) {
      console.log('CLERK REQUEST FAILED:', request.url(), request.failure()?.errorText);
    }
  });
  page.on('response', response => {
    if (response.url().includes('clerk') && response.status() >= 400) {
      console.log('CLERK RESPONSE ERROR:', response.url(), response.status());
    }
  });

  if (user) {
    const context = page.context();
    const token = generateMockJWT(user.id, user.role);
    await context.addCookies([
      {
        name: '__session',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);
  } else {
    const context = page.context();
    await context.clearCookies();
  }

  // Intercept Clerk Frontend API calls to mock react-clerk client initialization
  await page.route('**/v1/dev_browser**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        object: 'dev_browser',
        instance_type: 'development',
      }),
    });
  });

  await page.route('**/v1/environment**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        object: 'environment',
        auth_config: {},
        display_config: {
          object: 'display_config',
          id: 'display_config_id',
          instance_is_production: false,
          application_name: "JobSphere",
          preferred_sign_in_strategy: "password",
          logo_url: ""
        },
        organization_settings: {
          object: 'organization_settings',
          enabled: false
        },
        user_settings: {
          object: 'user_settings',
          attributes: {
            email_address: {
              enabled: true,
              required: true,
              verify_at_sign_up: true
            }
          }
        }
      }),
    });
  });

  await page.route('**/v1/client**', async (route) => {
    const now = Date.now();
    if (!user) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          object: 'client',
          id: 'client_mock',
          sessions: [],
          active_session_id: null,
          sign_in: null,
          sign_up: null,
          last_active_session_id: null,
          created_at: now - 10000,
          updated_at: now,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          object: 'client',
          id: 'client_mock',
          sessions: [
            {
              object: 'session',
              id: 'sess_mock',
              status: 'active',
              expire_at: now + 86400000,
              abandon_at: now + 86400000,
              last_active_at: now,
              created_at: now - 10000,
              updated_at: now,
              user: {
                object: 'user',
                id: user.id,
                primary_email_address_id: 'email_mock',
                email_addresses: [
                  {
                    object: 'email_address',
                    id: 'email_mock',
                    email_address: user.email,
                    verification: {
                      status: 'verified',
                      strategy: 'from_oauth_google'
                    }
                  },
                ],
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' ') || '',
                public_metadata: { role: user.role },
                unsafe_metadata: {},
                image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                username: null,
                phone_numbers: [],
                web3_wallets: [],
                passkeys: [],
                external_accounts: [],
                saml_accounts: [],
                password_enabled: true,
                two_factor_enabled: false,
                totp_enabled: false,
                backup_code_enabled: false,
                banned: false,
                locked: false,
                primary_phone_number_id: null,
                primary_web3_wallet_id: null
              },
            },
          ],
          active_session_id: 'sess_mock',
          last_active_session_id: 'sess_mock',
          created_at: now - 10000,
          updated_at: now,
        }),
      });
    }
  });

  // Intercept Clerk session token retrieval
  await page.route('**/v1/client/sessions/*/tokens**', async (route) => {
    const token = user ? generateMockJWT(user.id, user.role) : 'mock_jwt_token_value';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        object: 'token',
        jwt: token,
      }),
    });
  });

  // Intercept API calls to attach mock headers for backward compatibility and test stability
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const headers = { ...request.headers() };
    if (user) {
      const token = generateMockJWT(user.id, user.role);
      headers['x-mock-user-id'] = user.id;
      headers['x-mock-user-role'] = user.role;
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Continue the request with modified headers
    await route.continue({ headers });
  });
}
