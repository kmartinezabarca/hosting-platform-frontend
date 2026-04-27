import ApiService from './apiClient';

export interface SearchResultItem {
  id: number | string;
  uuid?: string;
  name: string;
  email?: string;
  description?: string;
  href: string;
  category: string;
  icon: string;
  type: 'user' | 'service' | 'invoice' | 'ticket' | string;
  searchCategory?: string;
}

interface SearchCategory {
  data: SearchResultItem[];
}

const globalSearchService = {
  async search(query: string): Promise<{ success: boolean; data: SearchResultItem[] }> {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    const results = await Promise.allSettled<SearchCategory>([
      this.searchUsers(query),
      this.searchServices(query),
      this.searchInvoices(query),
      this.searchTickets(query),
    ]);

    const allResults: SearchResultItem[] = [];
    const categoryMap = ['users', 'services', 'invoices', 'tickets'] as const;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value?.data) {
        result.value.data.forEach((item) => {
          allResults.push({ ...item, searchCategory: categoryMap[index] });
        });
      }
    });

    return { success: true, data: allResults.slice(0, 20) };
  },

  async searchUsers(query: string): Promise<SearchCategory> {
    try {
      const res = await ApiService.get(`/admin/users?search=${encodeURIComponent(query)}&per_page=5`);
      const data = (res.data as { data?: { data?: Record<string, unknown>[] } })?.data?.data ?? [];
      return {
        data: data.map((u) => ({
          id: u['id'] as number,
          uuid: u['uuid'] as string,
          name: (`${u['first_name'] ?? ''} ${u['last_name'] ?? ''}`).trim() || (u['email'] as string),
          email: u['email'] as string,
          href: `/admin/users/${u['id']}`,
          category: 'Usuarios',
          icon: 'Users',
          type: 'user' as const,
        })),
      };
    } catch {
      return { data: [] };
    }
  },

  async searchServices(query: string): Promise<SearchCategory> {
    try {
      const res = await ApiService.get(`/admin/services?search=${encodeURIComponent(query)}&per_page=5`);
      const data = (res.data as { data?: { data?: Record<string, unknown>[] } })?.data?.data ?? [];
      return {
        data: data.map((s) => ({
          id: s['id'] as number,
          uuid: s['uuid'] as string,
          name: (s['name'] as string) || `Servicio #${s['id']}`,
          description: s['status'] as string,
          href: `/admin/services/${s['id']}`,
          category: 'Servicios',
          icon: 'Server',
          type: 'service' as const,
        })),
      };
    } catch {
      return { data: [] };
    }
  },

  async searchInvoices(query: string): Promise<SearchCategory> {
    try {
      const res = await ApiService.get(`/admin/invoices?search=${encodeURIComponent(query)}&per_page=5`);
      const data = (res.data as { data?: { data?: Record<string, unknown>[] } })?.data?.data ?? [];
      return {
        data: data.map((inv) => ({
          id: inv['id'] as number,
          uuid: inv['uuid'] as string,
          name: `Factura #${inv['invoice_number'] ?? inv['id']}`,
          description: inv['status'] as string,
          href: `/admin/invoices/${inv['id']}`,
          category: 'Facturas',
          icon: 'CreditCard',
          type: 'invoice' as const,
        })),
      };
    } catch {
      return { data: [] };
    }
  },

  async searchTickets(query: string): Promise<SearchCategory> {
    try {
      const res = await ApiService.get(`/admin/tickets?search=${encodeURIComponent(query)}&per_page=5`);
      const data = (res.data as { data?: { data?: Record<string, unknown>[] } })?.data?.data ?? [];
      return {
        data: data.map((t) => ({
          id: t['id'] as number,
          uuid: t['uuid'] as string,
          name: (t['subject'] as string) || `Ticket #${t['id']}`,
          description: t['status'] as string,
          href: `/admin/tickets/${t['id']}`,
          category: 'Tickets',
          icon: 'Ticket',
          type: 'ticket' as const,
        })),
      };
    } catch {
      return { data: [] };
    }
  },
};

export default globalSearchService;
