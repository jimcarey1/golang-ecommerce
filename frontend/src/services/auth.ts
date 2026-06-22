import api from "./api.ts";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  ID: number;
  FullName: string;
  Email: string;
  HashedPassword?: string;
  ImageUrl?: unknown;
  CreatedAt?: unknown;
  UpdatedAt?: unknown;
}

export interface LoginResponse {
  AccessToken: string;
}

export interface AccessTokenClaims {
  sub?: number | string;
  email?: string;
  fullName?: string;
  exp?: number;
  iat?: number;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<AuthUser>("/auth/create", {
    FullName: payload.fullName,
    Email: payload.email,
    HashedPassword: payload.password,
  });

  return response.data;
}

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", {
    Email: payload.email,
    Password: payload.password,
  });

  return response.data;
}

export function parseAccessToken(accessToken: string): AccessTokenClaims | null {
  try {
    const [, payload] = accessToken.split(".");
    if (!payload) return null;

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = atob(normalizedPayload);

    return JSON.parse(decodedPayload) as AccessTokenClaims;
  } catch {
    return null;
  }
}
