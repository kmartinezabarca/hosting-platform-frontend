import { apiFetch } from './api_v2';

const twoFactorService = {
  async generate() {
    return apiFetch('/2fa/generate', { method: 'POST' });
  },
  async enable(code) {
    return apiFetch('/2fa/enable', { method: 'POST', body: { code } });
  },
  async disable() {
    return apiFetch('/2fa/disable', { method: 'POST' });
  },
};

export default twoFactorService;
