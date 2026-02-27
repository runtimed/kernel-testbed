import { ImageResponse } from 'next/og';
import { getAllKernelNames, getKernelReport } from '@/lib/data';
import { getPassedCount, getTotalCount, hasStartupError } from '@/types/report';
import { iconPaths, catppuccinColorsMocha, getIconKey, type ColorKey } from '@/lib/icon-paths';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = 'Kernel Conformance Results';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Render SVG icon for Satori (requires inline styles, not className)
function getLanguageIconSvg(language: string, kernelName: string) {
  const key = getIconKey(language, kernelName);
  const icon = iconPaths[key] || iconPaths.code;

  return (
    <svg viewBox={icon.viewBox} style={{ width: 120, height: 120 }}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
        {icon.paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            stroke={catppuccinColorsMocha[path.color as ColorKey]}
          />
        ))}
      </g>
    </svg>
  );
}

// Special case display names for known implementations/kernels
const displayNameOverrides: Record<string, string> = {
  // Python
  ipython: 'IPython',
  xpython: 'Xeus Python',
  'xeus-python': 'Xeus Python',

  // R
  ark: 'Ark',
  xr: 'Xeus R',
  'xeus-r': 'Xeus R',
  irkernel: 'IRkernel',

  // C++
  xcpp: 'Xeus C++',
  xcpp17: 'Xeus C++17',
  xcpp20: 'Xeus C++20',
  'xeus-cling': 'Xeus C++',

  // Haskell
  xhaskell: 'Xeus Haskell',
  'xeus-haskell': 'Xeus Haskell',

  // Lua
  xlua: 'Xeus Lua',
  'xeus-lua': 'Xeus Lua',

  // SQL
  xsql: 'Xeus SQL',
  xsqlite: 'Xeus SQLite',
  'xeus-sqlite': 'Xeus SQLite',
  'xeus-sql': 'Xeus SQL',

  // Octave
  xoctave: 'Xeus Octave',
  'xeus-octave': 'Xeus Octave',

  // Other
  gonb: 'GoNB',
  gophernotes: 'Gophernotes',
  ijulia: 'IJulia',
  'julia-1.11': 'IJulia',
  irust: 'IRust',
  rust: 'Evcxr',
  evcxr: 'Evcxr',
  deno: 'Deno',
  scala: 'Almond',
  'ocaml-jupyter': 'OCaml Jupyter',
  ocaml: 'OCaml Jupyter',
};

// Capitalize first letter of each word
function titleCase(str: string): string {
  if (!str) return str;
  return str.split(/[\s_-]+/).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Get display name for kernel (prefer implementation, fallback to kernel_name)
function getDisplayName(report: { kernel_name: string; implementation: string }): string {
  const impl = report.implementation?.toLowerCase();
  const name = report.kernel_name?.toLowerCase();

  // Check overrides first
  if (impl && displayNameOverrides[impl]) {
    return displayNameOverrides[impl];
  }
  if (name && displayNameOverrides[name]) {
    return displayNameOverrides[name];
  }

  // Fall back to title case
  if (impl && impl !== 'unknown' && impl !== '') {
    return titleCase(report.implementation);
  }
  return titleCase(report.kernel_name);
}

export async function generateStaticParams() {
  const kernelNames = await getAllKernelNames();
  return kernelNames.map((name) => ({
    name: encodeURIComponent(name),
  }));
}

interface Props {
  params: Promise<{ name: string }>;
}

export default async function OGImage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const report = await getKernelReport(decodedName);

  if (!report) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e1e2e',
            color: '#cdd6f4',
            fontSize: '48px',
          }}
        >
          Kernel not found
        </div>
      ),
      { ...size }
    );
  }

  const passed = getPassedCount(report);
  const total = getTotalCount(report);
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const isStartupError = hasStartupError(report);

  // Catppuccin Mocha colors
  const colors = {
    base: '#1e1e2e',
    mantle: '#181825',
    surface0: '#313244',
    text: '#cdd6f4',
    subtext0: '#a6adc8',
    overlay0: '#6c7086',
    mauve: '#cba6f7',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    peach: '#fab387',
    red: '#f38ba8',
  };

  // Color based on score
  const scoreColor = isStartupError
    ? colors.red
    : percentage >= 90
      ? colors.green
      : percentage >= 70
        ? colors.yellow
        : percentage >= 50
          ? colors.peach
          : colors.red;

  // Accent color for decorative elements
  const accentColor = isStartupError ? colors.red : colors.mauve;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.base,
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative language icon - bottom left, artfully cropped */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '-10px',
            display: 'flex',
            opacity: 0.15,
            transform: 'rotate(-15deg) scale(3)',
          }}
        >
          {getLanguageIconSvg(report.language, report.kernel_name)}
        </div>

        {/* Accent gradient bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            display: 'flex',
            background: `linear-gradient(90deg, ${accentColor} 0%, ${scoreColor} 100%)`,
          }}
        />

        {/* Top: Site branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', fontSize: '28px' }}>🧪</div>
          <div
            style={{
              display: 'flex',
              fontSize: '18px',
              color: colors.overlay0,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: 500,
            }}
          >
            Jupyter Kernel Conformance
          </div>
        </div>

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left side: Kernel info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '600px',
            }}
          >
            {/* Implementation name - hero text */}
            <div
              style={{
                display: 'flex',
                fontSize: '84px',
                fontWeight: 'bold',
                color: colors.text,
                lineHeight: 1,
                marginBottom: '16px',
              }}
            >
              {getDisplayName(report)}
            </div>

            {/* Language */}
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                color: colors.subtext0,
              }}
            >
              {titleCase(report.language)}
            </div>

            {/* Protocol version - subtle */}
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                color: colors.overlay0,
                marginTop: '8px',
              }}
            >
              Protocol {report.protocol_version}
            </div>
          </div>

          {/* Right side: Score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            {isStartupError ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: colors.red,
                  }}
                >
                  Failed
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '24px',
                    color: colors.subtext0,
                  }}
                >
                  to start
                </div>
              </>
            ) : (
              <>
                {/* Big percentage */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '140px',
                      fontWeight: 'bold',
                      color: scoreColor,
                      lineHeight: 1,
                    }}
                  >
                    {percentage}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: scoreColor,
                      marginLeft: '4px',
                    }}
                  >
                    %
                  </div>
                </div>

                {/* Test count */}
                <div
                  style={{
                    display: 'flex',
                    fontSize: '28px',
                    color: colors.subtext0,
                    marginTop: '8px',
                  }}
                >
                  {passed}/{total} tests passing
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom decorative line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '80px',
            right: '80px',
            height: '1px',
            display: 'flex',
            backgroundColor: colors.surface0,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
