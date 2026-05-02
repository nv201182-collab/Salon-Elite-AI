/**
 * Auth & Registration types — base for future backend integration.
 *
 * Registration flow:
 *   1. Phone → SMS OTP verification
 *   2. Name + Email (optional) → profile creation
 *   3. Salon assignment by manager
 *
 * All fields here mirror what a future REST/GraphQL API would expect.
 */

export type PhoneRegion = "RU" | "AE" | "KZ" | "BY" | "UZ";

/** Raw input collected from the user during registration */
export interface RegistrationInput {
  /** E.164 format, e.g. "+79991234567" */
  phone: string;
  /** Display region for the phone flag UI */
  region: PhoneRegion;
  /** Full name, e.g. "София Орлова" */
  name: string;
  /** Optional corporate or personal email */
  email?: string;
  /** Password — will be hashed server-side; stored in memory only */
  password?: string;
}

/** Pending OTP verification state */
export interface OtpVerificationState {
  phone: string;
  /** 6-digit code expected from SMS */
  code: string;
  /** Unix ms when the code was sent (for resend cooldown) */
  sentAt: number;
  /** How many send attempts made */
  attempts: number;
  verified: boolean;
}

/** Full user profile as returned by the backend after successful registration */
export interface RegisteredUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  salonId?: string;
  role: "employee" | "manager" | "hq";
  specialty?: string;
  points: number;
  createdAt: number;
  /** ISO 8601 */
  lastSeenAt: string;
}

/** Local session token stored in SecureStore (future) */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

/** Response shape from POST /auth/register */
export interface RegisterResponse {
  user: RegisteredUser;
  session: AuthSession;
}

/** Response shape from POST /auth/login */
export interface LoginResponse {
  user: RegisteredUser;
  session: AuthSession;
}

/** Response shape from POST /auth/otp/send */
export interface OtpSendResponse {
  success: boolean;
  cooldownSeconds: number;
  maskedPhone: string;
}

/** Response shape from POST /auth/otp/verify */
export interface OtpVerifyResponse {
  success: boolean;
  /** Temporary token valid for 10 min to complete registration */
  registrationToken?: string;
}

/** Phone region metadata for UI */
export const PHONE_REGIONS: Record<PhoneRegion, { flag: string; prefix: string; mask: string }> = {
  RU: { flag: "🇷🇺", prefix: "+7",   mask: "### ###-##-##" },
  AE: { flag: "🇦🇪", prefix: "+971", mask: "## ### ####"   },
  KZ: { flag: "🇰🇿", prefix: "+7",   mask: "### ###-##-##" },
  BY: { flag: "🇧🇾", prefix: "+375", mask: "## ###-##-##"  },
  UZ: { flag: "🇺🇿", prefix: "+998", mask: "## ###-##-##"  },
};

/** Validation helpers */
export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone.replace(/[\s\-()]/g, ""));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 80;
}

export function formatPhoneForDisplay(phone: string, region: PhoneRegion): string {
  const meta = PHONE_REGIONS[region];
  const digits = phone.replace(/\D/g, "").slice(meta.prefix.replace(/\D/g, "").length);
  const template = meta.mask;
  let result = meta.prefix + " ";
  let di = 0;
  for (let i = 0; i < template.length && di < digits.length; i++) {
    if (template[i] === "#") {
      result += digits[di++];
    } else {
      result += template[i];
    }
  }
  return result.trim();
}
