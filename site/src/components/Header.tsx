import { Badge } from '@/components/ui/badge';
import { FlaskConical, GitCommit, Calendar } from 'lucide-react';

interface HeaderProps {
  generatedAt?: string;
  commitSha?: string;
}

export function Header({ generatedAt, commitSha }: HeaderProps) {
  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="border-b border-ctp-surface0 bg-ctp-mantle">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-ctp-mauve/10">
              <FlaskConical className="h-8 w-8 text-ctp-mauve" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ctp-text">
                Jupyter Kernel Conformance
              </h1>
              <p className="text-ctp-subtext0 mt-0.5">
                Protocol compliance test results for Jupyter kernels
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            {formattedDate && (
              <Badge variant="outline" className="text-xs gap-1.5 bg-ctp-surface0/50 border-ctp-surface1">
                <Calendar className="h-3 w-3 text-ctp-blue" />
                {formattedDate}
              </Badge>
            )}
            {commitSha && (
              <a
                href={`https://github.com/runtimed/kernel-testbed/commit/${commitSha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-ctp-subtext0 hover:text-ctp-mauve transition-colors font-mono"
              >
                <GitCommit className="h-3 w-3" />
                {commitSha.slice(0, 7)}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
