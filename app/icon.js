import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 32,
        height: 32,
        background: '#0d9488',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'serif'
      }}>
        S24
      </div>
    ),
    { ...size }
  )
}