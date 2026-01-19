// Types pour l'authentification
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  customer: Customer;
  token?: string;
  requires_verification?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
}

export interface ResendOTPRequest {
  email: string;
}

