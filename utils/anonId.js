const UID_KEY    = 's24_uid'
const COUNT_KEY  = 's24_upload_count'
const LAST_KEY   = 's24_last_upload'
const VISIT_KEY  = 's24_visit_count'
const VISIT_TS   = 's24_last_visit'

function generateUUID() {
  // crypto.randomUUID() available from iOS 15.4+ only; fall back to getRandomValues (iOS 6+)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export function getAnonId() {
  if (typeof window === 'undefined') return null
  try {
    let id = localStorage.getItem(UID_KEY)
    if (!id) {
      id = generateUUID()
      localStorage.setItem(UID_KEY, id)
    }
    return id
  } catch {
    return generateUUID()
  }
}

export function isReturningUser() {
  if (typeof window === 'undefined') return false
  try {
    return !!localStorage.getItem(LAST_KEY)
  } catch {
    return false
  }
}

export function incrementUploadCount() {
  if (typeof window === 'undefined') return
  try {
    const current = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10)
    localStorage.setItem(COUNT_KEY, String(current + 1))
    localStorage.setItem(LAST_KEY, new Date().toISOString())
  } catch {}
}

export function getUploadCount() {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10)
  } catch {
    return 0
  }
}

export function trackVisit() {
  if (typeof window === 'undefined') return 0
  try {
    getAnonId() // ensure anonId exists
    const current = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
    const next = current + 1
    localStorage.setItem(VISIT_KEY, String(next))
    localStorage.setItem(VISIT_TS, new Date().toISOString())
    return next
  } catch {
    return 0
  }
}

export function getVisitCount() {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
  } catch {
    return 0
  }
}
