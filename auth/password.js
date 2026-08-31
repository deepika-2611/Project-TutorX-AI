import crypto from 'node:crypto'

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':')
  if (!salt || !originalHash) return false

  const hash = crypto.scryptSync(password, salt, 64)
  const original = Buffer.from(originalHash, 'hex')
  return original.length === hash.length && crypto.timingSafeEqual(original, hash)
}
