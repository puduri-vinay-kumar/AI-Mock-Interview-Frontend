export type UserRole = "candidate" | "admin";

export type AuthUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  interviewsAttempted?: number;
  averageScore?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  avatar?: string;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export type AuthApiData =
  | AuthPayload
  | {
      accessToken?: string;
      token?: string;
      jwt?: string;
      authToken?: string;
      user?: AuthUser;
      profile?: AuthUser;
      currentUser?: AuthUser;
    };

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export type AuthStoreState = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  isHydrated: boolean;
  isBootstrapping: boolean;
  bootstrapMessage: string | null;
  error: string | null;
  setSession: (payload: AuthPayload) => void;
  setBootstrapping: (value: boolean, message?: string | null) => void;
  setHydrated: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearSession: () => void;
};
