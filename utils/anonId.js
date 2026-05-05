const UID_KEY    = 's24_uid'
const COUNT_KEY  = 's24_upload_count'
const LAST_KEY   = 's24_last_upload'

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
