export enum UserRole {
  FREE = "free",
  PREMIUM = "premium",
  PRO = "pro",
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  cep?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  phone?: string;
  cep?: string;
  role?: UserRole;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  cep?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

