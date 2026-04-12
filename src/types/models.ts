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

// ─── Factura / Pago ────────────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  uuid: string;
  total: number;
  subtotal?: number;
  tax?: number;
  status: InvoiceStatus;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export type PaymentMethodBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentMethod {
  id: number;
  uuid?: string;
  brand: PaymentMethodBrand;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
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

// ─── Ticket / Soporte ─────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'closed' | 'pending';
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
}

export interface TicketMessage {
  id: number;
  message: string;
  created_at: string;
  user: {
    name: string;
    role: UserRole;
    avatar_url?: string | null;
  };
  attachments?: Attachment[];
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
