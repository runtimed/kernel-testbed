/**
 * Language icons from Catppuccin vscode-icons
 * https://github.com/catppuccin/vscode-icons
 */

interface IconProps {
  className?: string;
}

export function PythonIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="#89b4fa" d="M8.5 5.5h-3m6 0V3c0-.8-.7-1.5-1.5-1.5H7c-.8 0-1.5.7-1.5 1.5v2.5H3c-.8 0-1.5.7-1.5 1.5v2c0 .8.7 1.5 1.48 1.5" />
        <path stroke="#f9e2af" d="M10.5 10.5h-3m-3 0V13c0 .8.7 1.5 1.5 1.5h3c.8 0 1.5-.7 1.5-1.5v-2.5H13c.8 0 1.5-.7 1.5-1.5V7c0-.8-.7-1.5-1.48-1.5H11.5c0 1.5 0 2-1 2h-2" />
        <path stroke="#89b4fa" d="M2.98 10.5H4.5c0-1.5 0-2 1-2h2M7.5 3.5v0" />
        <path stroke="#f9e2af" d="m 8.5,12.5 v 0" />
      </g>
    </svg>
  );
}

export function RustIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" stroke="#fab387" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 9.5Q8 13.505.5 9.5l1-1-1-2 2-.5V4.5h2l.5-2 1.5 1 1.5-2 1.5 2 1.5-1 .5 2h2V6l2 .5-1 2z" />
        <path d="M6.5 7.5a1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1 1 1 0 011 1m5 0a1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1 1 1 0 011 1M4 11.02c-.67.37-1.5.98-1.5 2.23s1.22 1.22 2 1.25v-2M12 11c.67.37 1.5 1 1.5 2.25s-1.22 1.22-2 1.25v-2" />
      </g>
    </svg>
  );
}

export function JuliaIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="#a6e3a1" d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0" />
        <path stroke="#f38ba8" d="M6.5 11a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0" />
        <path stroke="#cba6f7" d="M14.5 11a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0" />
      </g>
    </svg>
  );
}

export function ScalaIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="#f38ba8" strokeLinecap="round" strokeLinejoin="round" d="m2.5 2.48 11-.98v3.04l-11 1zm0 5 11-.98v3.04l-11 1zm0 5 11-.98v3.04l-11 1z" />
    </svg>
  );
}

export function DenoIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0m7.67 5.8L8.11 9.56C6.2 9.49 4.5 8.38 4.5 7.03c0-1.4 1.62-2.53 3.61-2.53 2 0 2.89.72 3.61 2.17.02.03.5 1.6 1.45 4.7M8.5 6.5" />
    </svg>
  );
}

export function RIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="#7f849c" d="M13.5 9.5c.63-.7 1-1.54 1-2.43 0-2.52-2.91-4.57-6.5-4.57S1.5 4.55 1.5 7.07c0 1.9 1.65 3.53 4 4.22" />
        <path stroke="#89b4fa" d="M10.5 9.5c.4 0 .86.34 1 .7l1 3.3m-5 0v-8h3.05c.95 0 1.95 1 1.95 2s-1 2-1.95 2H7.5Z" />
      </g>
    </svg>
  );
}

// Map kernel names/languages to their icons
export function getLanguageIcon(kernelName: string, language: string): React.ComponentType<IconProps> {
  const name = kernelName.toLowerCase();
  const lang = language.toLowerCase();

  if (name.includes('python') || lang === 'python') return PythonIcon;
  if (name.includes('rust') || lang === 'rust') return RustIcon;
  if (name.includes('julia') || lang === 'julia') return JuliaIcon;
  if (name.includes('scala') || lang === 'scala') return ScalaIcon;
  if (name.includes('deno') || lang === 'typescript') return DenoIcon;
  if (name.includes('ark') || lang === 'r') return RIcon;

  // Default fallback
  return PythonIcon;
}
