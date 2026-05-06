// Hooks de autenticación
export * from '@presentation/components/features/useAuth';

// Hooks de perfil
export * from '@presentation/components/features/useProfile';

// Hooks de sesiones
export * from '@presentation/components/features/useSessions';

// Hooks de 2FA
export * from '@presentation/components/features/useTwoFactor';

// Hooks de categorías
export * from '@presentation/components/features/useCategories';

// Hooks de planes de servicio
export * from '@presentation/components/features/useServicePlans';

// Hooks de ciclos de facturación
export * from '@presentation/components/features/useBillingCycles';

// Hooks de dashboard
export * from '@presentation/components/features/useDashboard';

// Hooks de dashboard de administración (selective to avoid duplicate exports)
export { adminQueryKeys, useAdminStats, useAdminUsers, useAdminInvoices, useAdminTickets, useTicketCategories, useSupportAgents, useUpdateUserStatus, useUpdateServiceStatus, useCreateInvoice, useUpdateInvoiceStatus, useMarkInvoiceAsPaid, useUpdateTicketStatus, useAssignTicket, useAddTicketReply } from '@presentation/components/features/useAdminDashboard';

// Hooks de servicios
export * from '@presentation/components/features/useServices';

// Hooks de usuarios
export * from '@presentation/components/features/useUsers';

// Hooks de servicios de administración
export * from '@presentation/components/features/useAdminServices';

// Hooks de planes de servicio de administración
export * from '@presentation/components/features/useAdminServicePlans';
