const store = new Map()

export function rateLimit(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now()

  if (!store.has(ip)) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  const entry = store.get(ip)

  if (now > entry.resetAt) {
    entry.count  = 1
    entry.resetAt = now + windowMs
    return { allowed: true, remaining: limit - 1 }
  }

  entry.count++

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: limit - entry.count }
}
