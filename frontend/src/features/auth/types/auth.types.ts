// ─── Auth Feature Types (mirrors AuthDto.cs) ───────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId?: string;
  tenantId?: string;
  role?: string;
}
