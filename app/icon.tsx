import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)',
          borderRadius: '100px',
          padding: '20px',
        }}
      >
        <span
          style={{
            fontSize: 95,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            background: 'linear-gradient(to right, #ec4899, #818cf8)',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            letterSpacing: '-2px',
          }}
        >
          2 of Us
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}