import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'hsl(45 45% 90%)', // Sand Tan
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid hsl(0 72% 51%)', // Kente Red
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="hsl(0 72% 51%)" // Kente Red
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Adinkra Gye Nyame symbol */}
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" fill="hsl(44 95% 60%)" stroke="none" />
          <path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z" fill="hsl(0 72% 51%)" stroke="none" />
          <path d="M12 4v16" stroke="white" strokeWidth="1.5" />
          <path d="M7 12H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2" stroke="white" strokeWidth="1.5"/>
          <path d="M17 12h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
