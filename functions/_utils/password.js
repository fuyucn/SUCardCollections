/**
 * Shared password utility — reads from R2, falls back to env var.
 * All endpoints use this to verify passwords consistently.
 */

const PASSWORD_KEY = 'config/password'

/**
 * Get the current upload password.
 * Priority: R2 config/password → env.UPLOAD_PASSWORD → null
 */
export async function getPassword(env) {
  try {
    const obj = await env.CARDS_BUCKET.get(PASSWORD_KEY)
    if (obj) {
      return (await obj.text()).trim()
    }
  } catch (_) {
    // R2 read failed, fall through to env var
  }
  return env.UPLOAD_PASSWORD || null
}

/**
 * Set a new upload password in R2.
 */
export async function setPassword(env, newPassword) {
  await env.CARDS_BUCKET.put(PASSWORD_KEY, newPassword.trim())
}
