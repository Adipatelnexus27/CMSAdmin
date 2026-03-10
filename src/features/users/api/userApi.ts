import { API_BASE_URL } from "../../../constants/api";
import { getJson, postJson } from "../../../services/http/httpClient";
import { AuthResponse } from "../../auth/types";
import { ApiUserRecord, CreateUserRequest, ManagedUser } from "../types";

function mapApiUser(record: ApiUserRecord): ManagedUser | null {
  if (!record.userId || !record.email || !record.fullName) {
    return null;
  }

  const recordRoles = Array.isArray(record.roles) ? record.roles : [];

  return {
    userId: record.userId,
    email: record.email,
    fullName: record.fullName,
    roles: recordRoles,
    isActive: record.isActive ?? true,
    createdAtUtc: record.createdAtUtc ?? new Date().toISOString(),
    source: "api"
  };
}

export const userApi = {
  listUsers: async (): Promise<ManagedUser[]> => {
    const rows = await getJson<ApiUserRecord[]>(`${API_BASE_URL}/users`);
    return rows.map(mapApiUser).filter((row): row is ManagedUser => row !== null);
  },

  createUser: async (request: CreateUserRequest): Promise<ManagedUser> => {
    const response = await postJson<AuthResponse, CreateUserRequest>(`${API_BASE_URL}/auth/register`, request);
    const users = await userApi.listUsers();
    const createdUser = users.find((user) => user.email.toLowerCase() === response.email.toLowerCase());

    if (createdUser) {
      return createdUser;
    }

    return {
      userId: response.email,
      email: response.email,
      fullName: response.fullName,
      roles: response.roles.length > 0 ? response.roles : [request.role],
      isActive: true,
      createdAtUtc: new Date().toISOString(),
      source: "api"
    };
  }
};
