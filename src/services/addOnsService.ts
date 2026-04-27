// src/services/addOnsService.js
import apiClient from './apiClient';
import { buildQuery } from '../lib/query'; 

const addOnsService = {
  /* ----------- Públicos ----------- */

  // GET /add-ons?is_active=true&search=...
  async getAddOns(params = {}) {
    const qs = buildQuery(params);
    const url = `/admin/add-ons${qs ? `?${qs}` : ''}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  // GET /add-ons/active
  async getActiveAddOns() {
    const res = await apiClient.get('/add-ons/active');
    return res.data;
  },

  // GET /add-ons/:uuid
  async getAddOn(uuid) {
    const res = await apiClient.get(`/add-ons/${uuid}`);
    return res.data;
  },

  // GET /add-ons/service-plan/:planUuid
  async getAddOnsByServicePlan(planUuid) {
    const res = await apiClient.get(`/add-ons/service-plan/${planUuid}`);
    return res.data;
  },

  /* ----------- Admin (requiere auth; la maneja apiClient) ----------- */

  // POST /admin/add-ons
  async createAddOn(data) {
    const res = await apiClient.post('/admin/add-ons', data);
    return res.data;
  },

  // PUT /admin/add-ons/:uuid
  async updateAddOn(uuid, data) {
    const res = await apiClient.put(`/admin/add-ons/${uuid}`, data);
    return res.data;
  },

  // DELETE /admin/add-ons/:uuid
  async deleteAddOn(uuid) {
    const res = await apiClient.delete(`/admin/add-ons/${uuid}`);
    return res.data;
  },

  // POST /admin/add-ons/:addOnUuid/attach-to-plan
  // payload sugerido: { plan_uuid: string } o { plan_id: number }
  async attachAddOnToPlan(addOnUuid, payload) {
    const res = await apiClient.post(
      `/admin/add-ons/${addOnUuid}/attach-to-plan`,
      payload
    );
    return res.data;
  },

  // POST /admin/add-ons/:addOnUuid/detach-from-plan
  async detachAddOnFromPlan(addOnUuid, payload) {
    const res = await apiClient.post(
      `/admin/add-ons/${addOnUuid}/detach-from-plan`,
      payload
    );
    return res.data;
  },

  // GET /admin/service-plans?is_active=true...
  async getServicePlans(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/admin/service-plans${qs ? `?${qs}` : ''}`);
    return res.data;
  },
};

export default addOnsService;