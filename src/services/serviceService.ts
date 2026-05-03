import apiClient from "./apiClient";
import paymentService from "./paymentService";
import type {
  ApiResponse,
  PaginatedResponse,
  MessageResponse,
} from "@/types/api";
import type { Service, ServicePlan, Invoice } from "@/types/models";
import type { PaymentProcessData } from "./paymentService";

export interface ServiceContractData {
  plan_id: number | string;
  payment_method_id?: string;
  billing_cycle?: string;
  add_ons?: (number | string)[];
  [key: string]: unknown;
}

export interface ServiceConfigData {
  [key: string]: unknown;
}

export interface ServiceBackup {
  id: number;
  uuid?: string;
  name: string;
  created_at: string;
  size?: number;
}

export interface ServiceUsage {
  cpu?: number;
  ram?: number;
  disk?: number;
  bandwidth?: number;
  [key: string]: unknown;
}

export interface WsCredentials {
  socket: string;
  token: string;
}

export interface GameServerSoftwareOption {
  id: string;
  name: string;
  description?: string;
  recommended?: boolean;
  versions: string[];
}

export interface GameServerRuntimeConfig {
  software: string;
  version: string;
  docker_image?: string | null;
  startup_command?: string | null;
  nest_id?: number;
  egg_id?: number;
}

export interface GameServerProperties {
  max_players: number;
  gamemode: "survival" | "creative" | "adventure" | "spectator" | string;
  difficulty: "peaceful" | "easy" | "normal" | "hard" | string;
  white_list: boolean;
  online_mode: boolean;
  allow_flight: boolean;
  pvp: boolean;
  spawn_protection: number;
  motd: string;
  resource_pack?: string;
  resource_pack_prompt?: string;
  [key: string]: unknown;
}

export interface GameServerConfiguration {
  runtime: GameServerRuntimeConfig;
  server_properties: GameServerProperties;
  restart_required?: boolean;
  pending_changes_count?: number;
}

export interface UpdateGameServerSoftwarePayload {
  software: string;
  version: string;
}

export interface AddOn {
  id: number;
  uuid: string;
  name: string;
  price: number;
  [key: string]: unknown;
}

export interface Egg {  
  id: number;
  name: string;
  description: string;
  [key: string]: unknown;
}

export const servicesService = {
  // Get available service plans
  async getServicePlans(): Promise<ApiResponse<ServicePlan[]>> {
    try {
      const response =
        await apiClient.get<ApiResponse<ServicePlan[]>>("/services/plans");
      return response.data;
    } catch (error) {
      console.error("Error fetching service plans:", error);
      throw error;
    }
  },

  /**
   * Fetch the list of add-ons available for the specified plan.
   * @param planId Identifier of the plan (uuid or slug)
   */
  async getPlanAddOns(planId: string | number): Promise<ApiResponse<AddOn[]>> {
    try {
      const response = await apiClient.get<ApiResponse<AddOn[]>>(
        `/service-plans/add-ons/${planId}`,
      );
      return response.data;
    } catch (err) {
      console.error("getPlanAddOns error:", err);
      // Lanzamos el error para que React Query pueda manejarlo.
      throw err;
    }
  },

  // Contract a new service
  async contractService(
    serviceData: ServiceContractData,
  ): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.post<ApiResponse<Service>>(
        "/services/contract",
        serviceData,
      );
      return response.data;
    } catch (error) {
      console.error("Error contracting service:", error);
      throw error;
    }
  },

  // Process payment for service (delegado a paymentService)
  async processPayment(
    paymentData: PaymentProcessData,
  ): Promise<ApiResponse<import("@/types/models").Transaction>> {
    return paymentService.paymentService.processPayment(paymentData);
  },

  // Get user's services
  async getUserServices(): Promise<ApiResponse<Service[]>> {
    try {
      const response =
        await apiClient.get<ApiResponse<Service[]>>("/services/user");
      return response.data;
    } catch (error) {
      console.error("Error fetching user services:", error);
      throw error;
    }
  },

  async getGameServerWebSocket(
    serviceUuid: string,
  ): Promise<ApiResponse<WsCredentials>> {
    const response = await apiClient.get<ApiResponse<WsCredentials>>(
      `/services/${serviceUuid}/game-server/websocket`,
    );
    return response.data;
  },

  async getGameServerSoftwareOptions(
    serviceUuid: string,
  ): Promise<ApiResponse<GameServerSoftwareOption[]>> {
    const response = await apiClient.get<ApiResponse<GameServerSoftwareOption[]>>(
      `/services/${serviceUuid}/game-server/software-options`,
    );
    return response.data;
  },

  async getGameServerConfiguration(
    serviceUuid: string,
  ): Promise<ApiResponse<GameServerConfiguration>> {
    const response = await apiClient.get<ApiResponse<GameServerConfiguration>>(
      `/services/${serviceUuid}/game-server/configuration`,
    );
    return response.data;
  },

  async updateGameServerSoftware(
    serviceUuid: string,
    payload: UpdateGameServerSoftwarePayload,
  ): Promise<ApiResponse<GameServerConfiguration>> {
    const response = await apiClient.patch<ApiResponse<GameServerConfiguration>>(
      `/services/${serviceUuid}/game-server/software`,
      payload,
    );
    return response.data;
  },

  async updateGameServerProperties(
    serviceUuid: string,
    properties: Partial<GameServerProperties>,
  ): Promise<ApiResponse<GameServerConfiguration>> {
    const response = await apiClient.patch<ApiResponse<GameServerConfiguration>>(
      `/services/${serviceUuid}/game-server/server-properties`,
      properties,
    );
    return response.data;
  },

  // Get service details
  async getServiceDetails(
    serviceId: string | number,
  ): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.get<ApiResponse<Service>>(
        `/services/${serviceId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching service details:", error);
      throw error;
    }
  },

  // Get list nest eggs
  async getNestEggs(nestID: number): Promise<ApiResponse<Egg[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Egg[]>>(
        `/services/game-servers/${nestID}/eggs`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nest eggs:", error);
      throw error;
    }
  },

  // Update service configuration
  async updateServiceConfig(
    serviceId: string | number,
    configData: ServiceConfigData,
  ): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.put<ApiResponse<Service>>(
        `/services/${serviceId}/config`,
        configData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating service config:", error);
      throw error;
    }
  },

  // Cancel service
  async cancelService(
    serviceId: string | number,
    reason: string,
  ): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>(
        `/services/${serviceId}/cancel`,
        { reason },
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling service:", error);
      throw error;
    }
  },

  // Suspend service
  async suspendService(
    serviceId: string | number,
    reason: string,
  ): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>(
        `/services/${serviceId}/suspend`,
        { reason },
      );
      return response.data;
    } catch (error) {
      console.error("Error suspending service:", error);
      throw error;
    }
  },

  // Reactivate service
  async reactivateService(
    serviceId: string | number,
  ): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.post<ApiResponse<Service>>(
        `/services/${serviceId}/reactivate`,
      );
      return response.data;
    } catch (error) {
      console.error("Error reactivating service:", error);
      throw error;
    }
  },

  // Get service usage statistics
  async getServiceUsage(
    serviceId: string | number,
  ): Promise<ApiResponse<ServiceUsage>> {
    try {
      const response = await apiClient.get<ApiResponse<ServiceUsage>>(
        `/services/${serviceId}/game-server/usage`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching service usage:", error);
      throw error;
    }
  },

  //Get services metrics
  async getAllServicesMetrics(): Promise<
    ApiResponse<Record<string, ServiceUsage>>
  > {
    try {
      const response =
        await apiClient.get<ApiResponse<Record<string, ServiceUsage>>>(
          "/services/metrics",
        );
      return response.data;
    } catch (error) {
      console.error("Error fetching services metrics:", error);
      throw error;
    }
  },

  // Get service backups
  async getServiceBackups(
    serviceId: string | number,
  ): Promise<ApiResponse<ServiceBackup[]>> {
    try {
      const response = await apiClient.get<ApiResponse<ServiceBackup[]>>(
        `/services/${serviceId}/backups`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching service backups:", error);
      throw error;
    }
  },

  // Create service backup
  async createServiceBackup(
    serviceId: string | number,
    backupName: string,
  ): Promise<ApiResponse<ServiceBackup>> {
    try {
      const response = await apiClient.post<ApiResponse<ServiceBackup>>(
        `/services/${serviceId}/backups`,
        { name: backupName },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating service backup:", error);
      throw error;
    }
  },

  // Restore service backup
  async restoreServiceBackup(
    serviceId: string | number,
    backupId: string | number,
  ): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>(
        `/services/${serviceId}/backups/${backupId}/restore`,
      );
      return response.data;
    } catch (error) {
      console.error("Error restoring service backup:", error);
      throw error;
    }
  },

  async updateServiceConfiguration(
    serviceId: string | number,
    config: ServiceConfigData,
  ): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.patch<ApiResponse<Service>>(
        `/services/${serviceId}/configuration`,
        config,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating service configuration:", error);
      throw error;
    }
  },

  async getServiceInvoices(
    serviceId: string | number,
  ): Promise<PaginatedResponse<Invoice>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Invoice>>(
        `/services/${serviceId}/invoices`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching service invoices:", error);
      throw error;
    }
  },

  /** Envía señal de control de energía al game server */
  async sendPowerSignal(
    serviceUuid: string,
    signal: "start" | "stop" | "restart" | "kill",
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/services/${serviceUuid}/game-server/power`,
      { signal },
    );
    return response.data;
  },
};

export default servicesService;
