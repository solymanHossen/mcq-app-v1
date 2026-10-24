/**
 * Phase 1 stub: no email provider wired up yet, so verification/reset
 * messages are just logged. Swap this for a real provider (Resend, SES, …)
 * in a later phase — call sites don't need to change.
 */
export async function sendVerificationEmail(email: string, otp: string) {
  console.log(`[stub email] Verification OTP for ${email}: ${otp}`)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log(
    `[stub email] Password reset link for ${email}: /reset-password/${token}`
  )
}
