import {
  LayoutDashboard, Users, Server, FileText, HelpCircle,
  Settings, Package, Receipt, Book, Code, AlertCircle,
  Ticket, CreditCard, Sparkles, Tag, LucideIcon
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badgeKey?: string | null;
  expandable?: boolean;
  children?: NavItem[];
}

export const navigationConfig: Record<string, NavItem[]> = {
  overview: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Resumen y métricas' },
  ],
  management: [
    { name: 'Usuarios', href: '/admin/users', icon: Users, description: 'Gestión de usuarios', badgeKey: null },
    { name: 'Servicios', href: '/admin/services', icon: Server, description: 'Servicios activos', badgeKey: null },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket, description: 'Soporte y mesa de ayuda', badgeKey: 'tickets_open' },
  ],
  finanzas: [
    { name: 'Cotizaciones', href: '/admin/quotations', icon: Receipt, description: 'Propuestas comerciales', badgeKey: null },
    { name: 'Comprobantes de Pago', href: '/admin/invoices', icon: CreditCard, description: 'Historial de pagos recibidos', badgeKey: 'invoices_pending' },
    { name: 'Facturas (CFDI)', href: '/admin/cfdi', icon: FileText, description: 'Facturas electrónicas SAT', badgeKey: null },
  ],
  catalog: [
    { name: 'Planes', href: '/admin/service-plans', icon: Package, description: 'Planes de servicio', badgeKey: null },
    { name: 'Complementos', href: '/admin/add-ons', icon: Sparkles, description: 'Complementos', badgeKey: null },
    { name: 'Categorías', href: '/admin/categories', icon: Tag, description: 'Grupos del catálogo', badgeKey: null },
  ],
  content: [
    { name: 'Blog', href: '/admin/blog', icon: FileText, description: 'Artículos', badgeKey: null, expandable: true, children: [
      { name: 'Artículos', href: '/admin/blog', icon: FileText },
      { name: 'Categorías', href: '/admin/blog/categories', icon: Tag },
    ]},
  ],
  docs: [
    { name: 'Documentación', href: '/admin/documentation', icon: Book, description: 'Documentos generales', expandable: true, children: [
      { name: 'Documentación', href: '/admin/documentation', icon: Book },
      { name: 'Documentación API', href: '/admin/api-docs', icon: Code },
      { name: 'Estado del Sistema', href: '/admin/system-status', icon: AlertCircle },
    ]},
  ],
};

export const searchItems = [
  { name: 'Panel', href: '/admin/dashboard', category: 'Resumen', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', category: 'Gestión', icon: Users },
  { name: 'Servicios', href: '/admin/services', category: 'Gestión', icon: Server },
  { name: 'Tickets', href: '/admin/tickets', category: 'Gestión', icon: Ticket },
  { name: 'Comprobantes de Pago', href: '/admin/invoices', category: 'Finanzas', icon: CreditCard },
  { name: 'Cotizaciones', href: '/admin/quotations', category: 'Finanzas', icon: Receipt },
  { name: 'Planes de Servicio', href: '/admin/service-plans', category: 'Catálogo', icon: Package },
  { name: 'Complementos', href: '/admin/add-ons', category: 'Catálogo', icon: Sparkles },
  { name: 'Categorías', href: '/admin/categories', category: 'Catálogo', icon: Tag },
  { name: 'Facturas (CFDI)', href: '/admin/cfdi', category: 'Finanzas', icon: FileText },
  { name: 'Blog', href: '/admin/blog', category: 'Contenido', icon: FileText },
  { name: 'Categorías del Blog', href: '/admin/blog/categories', category: 'Contenido', icon: Tag },
  { name: 'Documentación', href: '/admin/documentation', category: 'Documentación', icon: Book },
  { name: 'Documentación API', href: '/admin/api-docs', category: 'Documentación', icon: Code },
  { name: 'Estado del Sistema', href: '/admin/system-status', category: 'Documentación', icon: AlertCircle },
];

export const sectionLabels: Record<string, { label: string; icon: LucideIcon }> = {
  overview: { label: 'Overview', icon: LayoutDashboard },
  management: { label: 'Gestión', icon: Server },
  finanzas: { label: 'Finanzas', icon: CreditCard },
  catalog: { label: 'Catálogo', icon: Package },
  content: { label: 'Contenido', icon: FileText },
  docs: { label: 'Sistema', icon: Settings },
};

export const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, Server, FileText, HelpCircle,
  Settings, Package, Receipt, Book, Code, AlertCircle,
  Ticket, CreditCard, Sparkles, Tag,
};
