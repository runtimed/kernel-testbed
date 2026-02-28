import { FlaskConical, GitCommit, Calendar, Table2, Grid3X3, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  generatedAt?: string;
  commitSha?: string;
  currentPage?: 'summary' | 'matrix' | 'cards' | 'kernel';
}

export function Header({ generatedAt, commitSha, currentPage }: HeaderProps) {
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
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <a href="/kernel-testbed/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
          </a>
          <div className="flex flex-col items-start sm:items-end gap-2">
            {formattedDate && (
              <span className="text-xs text-ctp-subtext0 flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-ctp-blue" />
                Last tested {formattedDate}
              </span>
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

        {/* Navigation tabs */}
        {currentPage && currentPage !== 'kernel' && (
          <nav className="flex gap-1 text-sm mt-6">
            <a
              href="/kernel-testbed/"
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                currentPage === 'summary'
                  ? 'bg-ctp-surface0 text-ctp-text'
                  : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
              }`}
            >
              <Table2 className="h-4 w-4" />
              Summary
            </a>
            <a
              href="/kernel-testbed/matrix/"
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                currentPage === 'matrix'
                  ? 'bg-ctp-surface0 text-ctp-text'
                  : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Detailed Matrix
            </a>
            <a
              href="/kernel-testbed/cards/"
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                currentPage === 'cards'
                  ? 'bg-ctp-surface0 text-ctp-text'
                  : 'text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kernel Cards
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
