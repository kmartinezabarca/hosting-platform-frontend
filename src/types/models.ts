/**
 * Modelos de dominio de ROKE Industries.
 * Representan las entidades que devuelve el backend Laravel.
 */

// ─── Usuario ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'client';

export interface User {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  /** Avatar de Google OAuth */
  google_avatar?: string | null;
  /** URL de foto de Google (campo alternativo) */
  picture?: string | null;
  is_google_account: boolean;
  email_verified_at: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  created_at: string;
  updated_at: string;
  /** Años como cliente */
  years_with_us?: number;
  /** Servicios activos */
  active_services?: number;
}

// ─── Perfil / Seguridad ────────────────────────────────────────────────────

export type Profile = User;

export interface SecurityInfo {
  two_factor_enabled: boolean;
  is_google_account: boolean;
  password_last_changed: string | null;
  security_score: number;
}

export interface Session {
  id: number;
  uuid: string;
  device: string;
  browser?: string;
  platform?: string;
  ip_address: string;
  last_active_at: string;
  is_current: boolean;
}

// ─── Servicio / Plan ──────────────────────────────────────────────────────

export type ServiceStatus = 'active' | 'suspended' | 'cancelled' | 'pending';

export interface Service {
  id: number;
  uuid: string;
  name: string;
  status: ServiceStatus;
  plan?: ServicePlan;
  created_at: string;
  updated_at: string;
  next_billing_date?: string | null;
  price?: number;
}

export interface ServicePlan {
  id: number;
  uuid: string;
  name: string;
  price: number;
  billing_cycle: string;
  features?: string[];
}

// ─── Factura / Pago ────────────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'sent';

export type CfdiStatus = 'pending' | 'requested' | 'generated' | 'error' | null;

export interface InvoiceItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  total: number;
}

export interface Invoice {
  id: number;
  uuid: string;
  invoice_number?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  currency?: string;
  status: InvoiceStatus;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
  cfdi_status?: CfdiStatus;
  items?: InvoiceItem[];
  service?: Service;
}

export type PaymentMethodBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentMethod {
  id: number;
  uuid?: string;
  stripe_payment_method_id?: string;
  brand: PaymentMethodBrand;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface InvoiceStats {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  invoices_count: number;
}

// ─── Transacciones ─────────────────────────────────────────────────────────

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: number;
  uuid: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  created_at: string;
  invoice?: Pick<Invoice, 'uuid' | 'invoice_number'>;
}

// ─── Ticket / Soporte ─────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'closed' | 'pending' | 'waiting_customer';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: number;
  uuid: string;
  ticket_number: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  replies_count?: number;
  last_reply_at?: string | null;
  user?: Pick<User, 'id' | 'uuid' | 'first_name' | 'last_name' | 'email'>;
}

export interface TicketMessage {
  id: number | string;
  message: string;
  created_at: string;
  user: {
    id?: number;
    name: string;
    role: UserRole | string;
    avatar_url?: string | null;
  };
  attachments?: Attachment[];
  /** Mensaje pendiente de confirmación del servidor */
  __optimistic?: boolean;
}

export interface Attachment {
  url: string;
  path?: string;
  name: string;
  mime: string;
  size: number;
}

// ─── Chat ──────────────────────────────────────────────────────────────────

export type ChatRoomStatus = 'open' | 'closed';

export interface ChatRoom {
  id: number;
  uuid: string;
  status: ChatRoomStatus;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  active_services: number;
  total_domains: number;
  monthly_spend: number;
  open_tickets: number;
  /** Cambio en servicios respecto al mes anterior */
  services_change?: number;
  /** Diferencia en gasto vs mes anterior (negativo = ahorro) */
  spend_vs_last_month?: number;
}

export type DashboardServiceType =
  | 'shared_hosting'
  | 'vps'
  | 'dedicated'
  | 'game_server'
  | 'domain'
  | string;

export interface DashboardService {
  uuid: string;
  name: string;
  type: DashboardServiceType;
  status: ServiceStatus;
  is_game_server: boolean;
  /** IP:puerto para game servers activos */
  ip?: string | null;
  port?: number | null;
  /** Fecha próximo cobro */
  next_billing_date?: string | null;
  plan?: Pick<ServicePlan, 'name' | 'price' | 'billing_cycle'>;
}

export type ActivityType = 'payment' | 'ticket' | 'invoice' | 'service' | 'security' | string;

export interface ActivityItem {
  id: number;
  type: ActivityType;
  description: string;
  meta?: string | null;
  created_at: string;
}

// ─── Game Server ───────────────────────────────────────────────────────────

export type GameServerStatus =
  | 'installing'
  | 'offline'
  | 'running'
  | 'starting'
  | 'stopping'
  | 'crashed'
  | string;

export interface GameServer {
  id: number;
  uuid: string;
  service_uuid: string;
  pterodactyl_server_id: number;
  name: string;
  node?: string | null;
  ip?: string | null;
  port?: number | null;
  status: GameServerStatus;
  game?: string | null;
  max_ram?: number | null;
  max_cpu?: number | null;
  max_disk?: number | null;
  created_at: string;
}

// NOTE: ApiResponse and PaginatedResponse are defined in ./api to avoid duplicate exports
