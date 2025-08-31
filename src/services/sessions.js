import { apiFetch } from './api_v2';

const sessionsService = {
  async list() {
    return apiFetch('/profile/devices', { method: 'GET' });
  },

  async logoutOne(idOrUuid) {
    return apiFetch(`/profile/sessions/${idOrUuid}`, { method: 'DELETE' });
  },

  async logoutOthers() {
    return apiFetch('/profile/sessions/others', { method: 'DELETE' });
  },
};

export default sessionsService;
