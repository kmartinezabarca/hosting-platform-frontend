// Hooks de autenticación
export * from '@application/hooks/useAuth';

// Hooks de perfil
export * from '@application/hooks/useProfile';

// Hooks de sesiones
export * from '@application/hooks/useSessions';

// Hooks de 2FA
export * from '@application/hooks/useTwoFactor';

// Hooks de categorías
export * from '@application/hooks/useCategories';

// Hooks de planes de servicio
export * from '@application/hooks/useServicePlans';

// Hooks de ciclos de facturación
export * from '@application/hooks/useBillingCycles';

// Hooks de dashboard
export * from '@application/hooks/useDashboard';

// Hooks de dashboard de administración (selective to avoid duplicate exports)
export { adminQueryKeys, useAdminStats, useAdminUsers, useAdminInvoices, useAdminTickets, useTicketCategories, useSupportAgents, useUpdateUserStatus, useUpdateServiceStatus, useCreateInvoice, useUpdateInvoiceStatus, useMarkInvoiceAsPaid, useUpdateTicketStatus, useAssignTicket, useAddTicketReply } from '@application/hooks/useAdminDashboard';

// Hooks de servicios
export * from '@application/hooks/useServices';

// Hooks de usuarios
export * from '@application/hooks/useUsers';

// Hooks de servicios de administración
export * from '@application/hooks/useAdminServices';

// Hooks de planes de servicio de administración
export * from '@application/hooks/useAdminServicePlans';
