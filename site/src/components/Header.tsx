import { Badge } from '@/components/ui/badge';

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
    <header className="border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Jupyter Kernel Conformance
            </h1>
            <p className="text-muted-foreground mt-1">
              Protocol compliance test results for Jupyter kernels
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            {formattedDate && (
              <Badge variant="secondary" className="text-xs">
                Updated: {formattedDate}
              </Badge>
            )}
            {commitSha && (
              <a
                href={`https://github.com/runtimed/kernel-testbed/commit/${commitSha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground font-mono"
              >
                {commitSha.slice(0, 7)}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
