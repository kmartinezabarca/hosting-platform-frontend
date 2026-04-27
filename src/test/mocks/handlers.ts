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
    const body = await request.json() as any;
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
    // El hook espera formato paginado: data.data.data = []
    HttpResponse.json({
      data: {
        data: [
          {
            id: 1,
            message: 'Hola, necesito ayuda',
            created_at: '2025-06-01T10:00:00Z',
            user: { name: 'Test User', role: 'client' },
            attachments: [],
          },
        ],
        current_page: 1,
        last_page: 1,
        total: 1,
      },
    })
  ),

  http.post(`${API}/chat/:roomId/messages`, async ({ request }) => {
    const body = await request.json() as any;
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
      data: {
        data: [
          {
            id: 1,
            uuid: 'inv-uuid',
            invoice_number: 'INV-2025-001',
            total: 150.00,
            currency: 'MXN',
            status: 'paid',
            paid_at: '2025-06-02T00:00:00Z',
            created_at: '2025-06-01T00:00:00Z',
            due_date: '2025-06-15T00:00:00Z',
            cfdi_status: null,
            items: [{ description: 'Hosting Pro', total: 129.31 }],
          },
          {
            id: 2,
            uuid: 'inv-uuid-2',
            invoice_number: 'INV-2025-002',
            total: 200.00,
            currency: 'MXN',
            status: 'sent',
            created_at: '2025-07-01T00:00:00Z',
            due_date: '2025-07-15T00:00:00Z',
            cfdi_status: null,
            items: [{ description: 'VPS Cloud', total: 172.41 }],
          },
        ],
        current_page: 1,
        last_page: 1,
        total: 2,
      },
    })
  ),

  http.get(`${API}/invoices/stats`, () =>
    HttpResponse.json({
      data: {
        total_paid: 1800.00,
        total_pending: 200.00,
        total_overdue: 0,
        invoices_count: 12,
      },
    })
  ),

  http.put(`${API}/invoices/:uuid/fiscal-data`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ message: 'Datos fiscales actualizados', data: { uuid: params.uuid, ...body } });
  }),

  http.post(`${API}/invoices/:uuid/pay`, async ({ params }) =>
    HttpResponse.json({ message: 'Pago procesado', data: { invoice_uuid: params.uuid, status: 'paid' } })
  ),

  http.get(`${API}/payments/methods`, () =>
    HttpResponse.json({
      data: [
        { id: 1, stripe_payment_method_id: 'pm_test_visa', brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2027, is_default: true },
      ],
    })
  ),

  http.post(`${API}/payments/methods`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      data: { id: 2, stripe_payment_method_id: body.payment_method_id ?? 'pm_new', brand: 'mastercard', last4: '5555', is_default: false },
    });
  }),

  http.put(`${API}/payments/methods/:id`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ data: { id: params.id, ...body } });
  }),

  http.delete(`${API}/payments/methods/:id`, ({ params }) =>
    HttpResponse.json({ message: `Método ${params.id} eliminado` })
  ),

  http.post(`${API}/payments/process`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      data: {
        status: 'succeeded',
        payment_intent_id: 'pi_test_123',
        invoice_uuid: body.invoice_uuid ?? 'inv-uuid',
      },
    });
  }),

  http.get(`${API}/transactions`, () =>
    HttpResponse.json({
      data: {
        data: [
          { id: 1, uuid: 'txn-uuid', amount: 150.00, currency: 'MXN', status: 'completed', created_at: '2025-06-01T00:00:00Z', description: 'Pago Hosting Pro' },
        ],
        current_page: 1,
        last_page: 1,
        total: 1,
      },
    })
  ),
];

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardHandlers = [
  http.get(`${API}/dashboard/stats`, () =>
    HttpResponse.json({
      data: {
        active_services: 3,
        total_domains: 5,
        monthly_spend: 249.97,
        open_tickets: 1,
        services_change: 2,
        spend_vs_last_month: -12.50,
      },
    })
  ),

  http.get(`${API}/dashboard/services`, () =>
    HttpResponse.json({
      data: [
        { uuid: 'svc-1', name: 'Web Hosting Pro',  type: 'shared_hosting', status: 'active',  is_game_server: false },
        { uuid: 'svc-2', name: 'Servidor Minecraft', type: 'game_server',  status: 'active',  is_game_server: true  },
        { uuid: 'svc-3', name: 'VPS Cloud',         type: 'vps',           status: 'pending', is_game_server: false },
      ],
    })
  ),

  http.get(`${API}/dashboard/activity`, () =>
    HttpResponse.json({
      data: [
        { id: 1, type: 'payment',  description: 'Pago procesado — INV-2025-001',   meta: '$150.00 MXN', created_at: new Date(Date.now() - 3_600_000).toISOString() },
        { id: 2, type: 'ticket',   description: 'Nuevo ticket #42 abierto',         meta: 'Soporte técnico', created_at: new Date(Date.now() - 7_200_000).toISOString() },
        { id: 3, type: 'invoice',  description: 'Factura INV-2025-002 generada',    meta: '$200.00 MXN', created_at: new Date(Date.now() - 86_400_000).toISOString() },
      ],
    })
  ),
];

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...chatHandlers,
  ...paymentHandlers,
  ...dashboardHandlers,
];
