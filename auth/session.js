import crypto from 'node:crypto'

export function signSession(studentId, sessionSecret, issuedAt = Date.now()) {
  const payload = `${studentId}:${issuedAt}`
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

export function verifySessionTokenSignature(token, sessionSecret) {
  if (!token) return null

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [studentId, issuedAt, signature] = decoded.split(':')
    if (!studentId || !issuedAt || !signature) return null

    const expected = crypto.createHmac('sha256', sessionSecret).update(`${studentId}:${issuedAt}`).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return null

    const maxAgeMs = 1000 * 60 * 60 * 24 * 30
    if (Date.now() - Number(issuedAt) > maxAgeMs) return null
    return studentId
  } catch {
    return null
  }
}

export function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getBearerToken(request) {
  const header = request.headers.authorization ?? ''
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
}
