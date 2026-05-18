export function parseDeviceInfo(userAgent = '') {
  const ua = userAgent.toLowerCase()

  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(ua)

  const os =
    /android/i.test(ua) ? 'android' :
    /iphone|ipad/i.test(ua) ? 'ios' :
    /windows/i.test(ua) ? 'windows' :
    /mac/i.test(ua) ? 'mac' :
    /linux/i.test(ua) ? 'linux' : 'unknown'

  const browser =
    /edg/i.test(ua) ? 'edge' :
    /chrome/i.test(ua) ? 'chrome' :
    /firefox/i.test(ua) ? 'firefox' :
    /safari/i.test(ua) ? 'safari' :
    /opera/i.test(ua) ? 'opera' : 'unknown'

  return {
    deviceType: isMobile ? 'mobile' : 'desktop',
    os,
    browser
  }
}

export function getIPAddress(req) {
  return req.headers.get('x-forwarded-for')
    ?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || req.headers.get('cf-connecting-ip')
    || 'unknown'
}

export function getUploadTime() {
  const now = new Date()
  return {
    uploadHour: now.getHours(),
    uploadDay:  now.getDay()
  }
}
