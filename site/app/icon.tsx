import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Catppuccin Mocha colors
const colors = {
  base: '#1e1e2e',
  mauve: '#cba6f7',
  green: '#a6e3a1',
};

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.base,
          borderRadius: 4,
        }}
      >
        {/* Catppuccin-styled beaker icon */}
        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
          {/* Beaker body */}
          <path
            d="M9 3h6v2h-1v4l4 8H6l4-8V5H9V3z"
            fill="none"
            stroke={colors.mauve}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Liquid line */}
          <path
            d="M7.5 15h9"
            stroke={colors.green}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
