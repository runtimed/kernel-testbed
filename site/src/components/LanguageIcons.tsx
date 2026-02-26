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

export function CppIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="#89b4fa" strokeLinecap="round" strokeLinejoin="round" d="m 2.556,12.952 c 2.746,2.735 7.198,2.735 9.944,0 l -1.79,-1.783 c -1.757,1.75 -4.607,1.75 -6.364,0 -1.757,-1.75 -1.757,-4.588 0,-6.338 1.757,-1.75 4.607,-1.75 6.364,0 l 0.895,-0.891 0.895,-0.891 c -2.746,-2.735 -7.198,-2.735 -9.944,0 -2.746,2.735 -2.746,7.169 0,9.903 z" clipRule="evenodd" />
      <path fill="none" stroke="#89b4fa" strokeLinecap="round" strokeLinejoin="round" d="M7.5 6v4M5.514 8H9.513M13.486 6v4M11.5 8h4" />
    </svg>
  );
}

export function SqlIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="#f9e2af" strokeLinecap="round" strokeLinejoin="round" d="M8 6.5c3.59 0 6.5-1.4 6.5-2.68S11.59 1.5 8 1.5 1.5 2.54 1.5 3.82 4.41 6.5 8 6.5M14.5 8c0 .83-1.24 1.79-3.25 2.2s-4.49.41-6.5 0S1.5 8.83 1.5 8m13 4.18c0 .83-1.24 1.6-3.25 2-2.01.42-4.49.42-6.5 0-2.01-.4-3.25-1.17-3.25-2m0-8.3v8.3m13-8.3v8.3" />
    </svg>
  );
}

export function GoIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="#74c7ec" strokeLinecap="round" strokeLinejoin="round" d="m15.48 8.06-4.85.48m4.85-.48a4.98 4.98 0 01-4.54 5.42 5 5 0 112.95-8.66l-1.7 1.84a2.5 2.5 0 00-4.18 2.06c.05.57.3 1.1.69 1.51.25.27 1 .83 1.78.82.8-.02 1.58-.25 2.07-.81 0 0 .8-.96.68-1.88M2.5 8.5l-2 .01m1.5 2h1.5m-2-3.99 2-.02" />
    </svg>
  );
}

export function HaskellIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <path fill="none" stroke="#cba6f7" strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5h3m-1.5 3h1.5m-10 6 2.5-5-2.5-5H8l5.6 10h-2.53l-1.52-2.92L8 13.5zm-5 0 2.5-5-2.5-5H3l2.5 5-2.5 5z" />
    </svg>
  );
}

export function LuaIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="#cdd6f4" d="M10.5 7A1.5 1.5 0 019 8.5 1.5 1.5 0 017.5 7 1.5 1.5 0 019 5.5 1.5 1.5 0 0110.5 7" />
        <path stroke="#89b4fa" d="M7 2.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13m7-2a1.5 1.5 0 100 3 1.5 1.5 0 000-3" />
      </g>
    </svg>
  );
}

export function OctaveIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="#74c7ec" d="M4 11 .5 8.5 5 7q.78-1.77 1.89-1.89c.74-.07 1.94-1.28 3.61-3.61M5 7l1.5 1.5" />
        <path stroke="#fab387" d="m15.5 12.5-5-11C8.5 6.83 6.33 10 4 11c1.67-.33 2.67.83 3 3.5 3.5-1.5 3.5-3.5 5-4s1.5 1.5 3.5 2" />
      </g>
    </svg>
  );
}

export function OCamlIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
      <g fill="none" stroke="#fab387" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 8V3c0-.83.67-1.5 1.5-1.5h10c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9" />
        <path d="m1.5 8 1.14-2.3q.09-.21.36-.24a.8.8 0 01.44.13c.18.12.23.53.28.64.06.1.64 1.23.85 1.23.2 0 .71-1.47.71-1.47s.37-.49.72-.49.55.32.67.49c.12.16.24 1.76.46 2.01s1.32.87 1.67.73c.34-.13.53-.4.63-.73.1-.34-.14-.75 0-1a1.1 1.1 0 011.02-.55c.56.03 2.05.56 2.05 1.05q0 .75-1.5.75c-.48 1.33.28 2.22-3 2.25l1 4" />
        <path d="m4.5 14.5 1.5-4 1 4zm-2 0 1.5-4-1.5-.5-1 1.54V14l1 .49Z" />
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
  if (name.includes('ark') || name.includes('xeus-r') || lang === 'r') return RIcon;
  if (name.includes('cling') || name.includes('xcpp') || lang === 'c++') return CppIcon;
  if (name.includes('sql') || name.includes('xsql') || name.includes('sqlite') || lang === 'sql') return SqlIcon;
  if (name.includes('gonb') || name.includes('gophernotes') || lang === 'go') return GoIcon;
  if (name.includes('haskell') || lang === 'haskell') return HaskellIcon;
  if (name.includes('lua') || lang === 'lua') return LuaIcon;
  if (name.includes('octave') || lang === 'octave' || lang === 'matlab') return OctaveIcon;
  if (name.includes('ocaml') || lang === 'ocaml') return OCamlIcon;

  // Default fallback
  return PythonIcon;
}
