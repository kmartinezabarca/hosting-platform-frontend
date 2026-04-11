import { http, HttpResponse } from 'msw';

const API = 'http://localhost:8000/api';

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authHandlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({ message: 'Login exitoso', user: { id: 1, uuid: 'test-uuid', email: 'test@roke.com', role: 'client' } })
  ),

  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ message: 'Sesión cerrada' })
  ),

  http.post(`${API}/auth/register`, () =>
    HttpResponse.json({
      message: 'Registro exitoso',
      user: { id: 2, uuid: 'new-uuid', email: 'nuevo@roke.com', role: 'client' },
    })
  ),

  http.post(`${API}/auth/2fa/verify`, ({ request }) =>
    HttpResponse.json({ message: '2FA verificado', user: { id: 1, uuid: 'test-uuid' } })
  ),

  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      data: { id: 1, uuid: 'test-uuid', email: 'test@roke.com', first_name: 'Test', last_name: 'User', role: 'client' },
    })
  ),
];

// ─── Profile ──────────────────────────────────────────────────────────────
export const profileHandlers = [
  http.get(`${API}/profile`, () =>
    HttpResponse.json({
      data: {
        id: 1,
        uuid: 'test-uuid',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@roke.com',
        avatar_url: null,
        is_google_account: false,
        country: 'MX',
      },
    })
  ),

  http.put(`${API}/profile`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...body } });
  }),

  http.get(`${API}/profile/security`, () =>
    HttpResponse.json({
      data: {
        two_factor_enabled: false,
        is_google_account: false,
        password_last_changed: '2025-01-01T00:00:00Z',
        security_score: 70,
      },
    })
  ),

  http.put(`${API}/profile/password`, () =>
    HttpResponse.json({ message: 'Contraseña actualizada' })
  ),
];

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatHandlers = [
  http.get(`${API}/chat/support-room`, () =>
    HttpResponse.json({
      data: { room: { id: 42, uuid: 'room-uuid', status: 'open' } },
    })
  ),

  http.get(`${API}/chat/:roomId/messages`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          message: 'Hola, necesito ayuda',
          created_at: '2025-06-01T10:00:00Z',
          user: { name: 'Test User', role: 'client' },
          attachments: [],
        },
      ],
    })
  ),

  http.post(`${API}/chat/:roomId/messages`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: 99, message: body.message, created_at: new Date().toISOString() },
    });
  }),

  http.get(`${API}/chat/unread-count`, () =>
    HttpResponse.json({ unread_count: 3 })
  ),
];

// ─── Invoices / Payments ──────────────────────────────────────────────────
export const paymentHandlers = [
  http.get(`${API}/invoices`, () =>
    HttpResponse.json({
      data: [
        { id: 1, uuid: 'inv-uuid', total: 150.00, status: 'paid', created_at: '2025-06-01T00:00:00Z' },
      ],
    })
  ),

  http.get(`${API}/payments/methods`, () =>
    HttpResponse.json({
      data: [{ id: 1, brand: 'visa', last4: '4242', is_default: true }],
    })
  ),
];

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...chatHandlers,
  ...paymentHandlers,
];
