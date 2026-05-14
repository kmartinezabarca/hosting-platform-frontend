import ApiService from '@infrastructure/api/apiClient';

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
}

const RECENT_KEY = 'admin_recent_searches';
const MAX_RECENT = 5;

export const recentSearchStorage = {
  get(): SearchResultItem[] {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  },
  add(item: SearchResultItem): void {
    const items = this.get().filter(r => r.href !== item.href);
    items.unshift(item);
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  },
  clear(): void {
    localStorage.removeItem(RECENT_KEY);
  },
};

const globalSearchService = {
  async search(query: string): Promise<{ success: boolean; data: SearchResultItem[] }> {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }
    const res = await ApiService.get(`/admin/search?q=${encodeURIComponent(query)}`);
    return res.data as { success: boolean; data: SearchResultItem[] };
  },

  async getPopular(): Promise<{ success: boolean; data: string[] }> {
    const res = await ApiService.get('/admin/search/popular');
    return res.data as { success: boolean; data: string[] };
  },
};

export default globalSearchService;
