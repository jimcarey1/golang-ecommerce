import api from "./api";

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
};

export type AuthUser = {
  ID: number;
  FullName: string;
  Email: string;
  HashedPassword?: string;
  ImageUrl?: unknown;
  CreatedAt?: unknown;
  UpdatedAt?: unknown;
};

export type LoginResponse = {
  AccessToken: string;
};

export function createUser(payload: CreateUserPayload) {
  return api.post<AuthUser>('/auth/create', {
    FullName: payload.full_name,
    Email: payload.email,
    HashedPassword: payload.password,
  });
}

export function loginUser(email: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { email, password });
}
