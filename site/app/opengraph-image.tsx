import { ImageResponse } from 'next/og';
import { getConformanceData } from '@/lib/data';
import { getPassedCount, getTotalCount } from '@/types/report';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = 'Jupyter Kernel Conformance';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const data = await getConformanceData();
  const kernelCount = data.reports.length;

  // Calculate overall stats
  let totalPassed = 0;
  let totalTests = 0;
  for (const report of data.reports) {
    totalPassed += getPassedCount(report);
    totalTests += getTotalCount(report);
  }
  const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

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
    lavender: '#b4befe',
  };

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
        {/* Decorative flask icon - bottom left, cropped */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            display: 'flex',
            fontSize: '450px',
            opacity: 0.06,
            transform: 'rotate(-15deg)',
          }}
        >
          🧪
        </div>

        {/* Another decorative element - top right */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-100px',
            display: 'flex',
            fontSize: '350px',
            opacity: 0.04,
            transform: 'rotate(20deg)',
          }}
        >
          🧪
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
            background: `linear-gradient(90deg, ${colors.mauve} 0%, ${colors.lavender} 50%, ${colors.green} 100%)`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Icon and title row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', fontSize: '72px' }}>🧪</div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  color: colors.overlay0,
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  fontWeight: 500,
                }}
              >
                Protocol Compliance Testing
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: colors.text,
                  lineHeight: 1.1,
                }}
              >
                Jupyter Kernel
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: colors.mauve,
                  lineHeight: 1.1,
                }}
              >
                Conformance
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '80px',
              marginTop: '50px',
              marginLeft: '96px',
            }}
          >
            {/* Kernels tested */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '96px',
                    fontWeight: 'bold',
                    color: colors.mauve,
                    lineHeight: 1,
                  }}
                >
                  {kernelCount}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '22px',
                  color: colors.subtext0,
                  marginTop: '4px',
                }}
              >
                kernels tested
              </div>
            </div>

            {/* Average pass rate */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '96px',
                    fontWeight: 'bold',
                    color: colors.green,
                    lineHeight: 1,
                  }}
                >
                  {passRate}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: colors.green,
                    marginLeft: '4px',
                  }}
                >
                  %
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '22px',
                  color: colors.subtext0,
                  marginTop: '4px',
                }}
              >
                average pass rate
              </div>
            </div>
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
