import { apiFetch } from './api_v2';

const profileService = {
  async get() {
    return apiFetch('/profile', { method: 'GET' });
  },

  async update(payload) {
    return apiFetch('/profile', { method: 'PUT', body: payload });
  },

  async uploadAvatar(file) {
    const form = new FormData();
    form.append('avatar', file);

    return apiFetch('/profile/avatar', {
      method: 'POST',
      isForm: true,
      body: form,
    });
  },

  async getSecurity() {
    return apiFetch('/profile/security', { method: 'GET' });
  },

  async updatePassword(payload) {
    return apiFetch('/profile/password', { method: 'PUT', body: payload });
  },
};

export default profileService;
