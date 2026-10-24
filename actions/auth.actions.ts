'use server';

import { redirect } from 'next/navigation';
import api from '@/lib/api';
import {
  loginSchema, registerSchema, verifyEmailSchema,
  forgotPasswordSchema, resetPasswordSchema
} from '@/lib/validators';

// ─── Register ─────────────────────────────────────────
export async function registerAction(
  _state: unknown,
  formData: FormData,
) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await api.post('/auth/register', parsed.data);
    redirect(`/verify-email?email=${parsed.data.email}`);
  } catch (e: any) {
    if (e.digest?.startsWith('NEXT_REDIRECT')) throw e;
    return { error: e.response?.data?.message ?? 'Registration failed' };
  }
}

// ─── Verify Email OTP ─────────────────────────────────
export async function verifyEmailAction(
  _state: unknown,
  formData: FormData,
) {
  const parsed = verifyEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await api.post('/auth/verify-email', parsed.data);
    redirect('/login?verified=true');
  } catch (e: any) {
    if (e.digest?.startsWith('NEXT_REDIRECT')) throw e;
    return { error: e.response?.data?.message ?? 'Invalid or expired OTP' };
  }
}

// ─── Resend OTP ───────────────────────────────────────
export async function resendOTPAction(email: string) {
  try {
    await api.post('/auth/resend-otp', { email });
    return { success: true };
  } catch (e: any) {
    return { error: e.response?.data?.message ?? 'Failed to resend' };
  }
}

// ─── Forgot Password ──────────────────────────────────
export async function forgotPasswordAction(
  _state: unknown,
  formData: FormData,
) {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await api.post('/auth/forgot-password', parsed.data);
    return { success: true };
  } catch (e: any) {
    return { error: e.response?.data?.message ?? 'Email not found' };
  }
}

// ─── Reset Password ───────────────────────────────────
export async function resetPasswordAction(
  token: string,
  _state: unknown,
  formData: FormData,
) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  try {
    await api.post(`/auth/reset-password/${token}`, parsed.data);
    redirect('/login?reset=true');
  } catch (e: any) {
    if (e.digest?.startsWith('NEXT_REDIRECT')) throw e;
    return { error: e.response?.data?.message ?? 'Reset failed or link expired' };
  }
}