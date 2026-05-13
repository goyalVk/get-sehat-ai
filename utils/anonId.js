const UID_KEY    = 's24_uid'
const COUNT_KEY  = 's24_upload_count'
const LAST_KEY   = 's24_last_upload'
const VISIT_KEY  = 's24_visit_count'
const VISIT_TS   = 's24_last_visit'

export function getAnonId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem(UID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(UID_KEY, id)
  }
  return id
}

export function isReturningUser() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(LAST_KEY)
}

export function incrementUploadCount() {
  if (typeof window === 'undefined') return
  const current = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10)
  localStorage.setItem(COUNT_KEY, String(current + 1))
  localStorage.setItem(LAST_KEY, new Date().toISOString())
}

export function getUploadCount() {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10)
}

export function trackVisit() {
  if (typeof window === 'undefined') return 0
  getAnonId() // ensure anonId exists
  const current = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
  const next = current + 1
  localStorage.setItem(VISIT_KEY, String(next))
  localStorage.setItem(VISIT_TS, new Date().toISOString())
  return next
}

export function getVisitCount() {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
}
