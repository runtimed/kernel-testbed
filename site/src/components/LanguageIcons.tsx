/**
 * Language icons for client-side React components
 * Uses shared icon data from @/lib/icon-paths
 *
 * Icons from Catppuccin vscode-icons: https://github.com/catppuccin/vscode-icons
 */

import { iconPaths, catppuccinColors, getIconKey, type ColorKey } from '@/lib/icon-paths';

interface IconProps {
  className?: string;
}

interface LanguageIconProps extends IconProps {
  language: string;
  kernelName: string;
}

/**
 * Render a language icon from the shared icon data
 */
export function LanguageIcon({ language, kernelName, className = 'h-5 w-5' }: LanguageIconProps) {
  const key = getIconKey(language, kernelName);
  const icon = iconPaths[key] || iconPaths.code;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      className={className}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon.paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            stroke={catppuccinColors[path.color as ColorKey]}
          />
        ))}
      </g>
    </svg>
  );
}

// Legacy named exports for backwards compatibility
// These wrap LanguageIcon with the correct kernel/language mapping

export function PythonIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="python" kernelName="python3" className={className} />;
}

export function RustIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="rust" kernelName="rust" className={className} />;
}

export function JuliaIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="julia" kernelName="julia" className={className} />;
}

export function ScalaIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="scala" kernelName="scala" className={className} />;
}

export function DenoIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="typescript" kernelName="deno" className={className} />;
}

export function RIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="r" kernelName="ark" className={className} />;
}

export function CppIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="c++" kernelName="xcpp" className={className} />;
}

export function SqlIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="sql" kernelName="xsql" className={className} />;
}

export function GoIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="go" kernelName="gonb" className={className} />;
}

export function HaskellIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="haskell" kernelName="xhaskell" className={className} />;
}

export function LuaIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="lua" kernelName="xlua" className={className} />;
}

export function OctaveIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="octave" kernelName="xoctave" className={className} />;
}

export function OCamlIcon({ className = 'h-5 w-5' }: IconProps) {
  return <LanguageIcon language="ocaml" kernelName="ocaml-jupyter" className={className} />;
}

/**
 * Get the appropriate icon component for a kernel
 * @deprecated Use LanguageIcon directly instead
 */
export function getLanguageIcon(kernelName: string, language: string): React.ComponentType<IconProps> {
  const name = kernelName.toLowerCase();
  const lang = language.toLowerCase();

  if (name.includes('python') || lang === 'python') return PythonIcon;
  if (name.includes('rust') || lang === 'rust') return RustIcon;
  if (name.includes('julia') || lang === 'julia') return JuliaIcon;
  if (name.includes('scala') || lang === 'scala') return ScalaIcon;
  if (name.includes('deno') || lang === 'typescript') return DenoIcon;
  if (name.includes('ark') || name.includes('xeus-r') || name.includes('xr') || lang === 'r') return RIcon;
  if (name.includes('cling') || name.includes('xcpp') || lang === 'c++') return CppIcon;
  if (name.includes('sql') || name.includes('sqlite') || lang === 'sql') return SqlIcon;
  if (name.includes('gonb') || name.includes('gophernotes') || lang === 'go') return GoIcon;
  if (name.includes('haskell') || lang === 'haskell') return HaskellIcon;
  if (name.includes('lua') || lang === 'lua') return LuaIcon;
  if (name.includes('octave') || lang === 'octave' || lang === 'matlab') return OctaveIcon;
  if (name.includes('ocaml') || lang === 'ocaml') return OCamlIcon;

  return PythonIcon; // Default fallback
}
