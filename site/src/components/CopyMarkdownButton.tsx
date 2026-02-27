'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyMarkdownButtonProps {
  content: string;
}

export function CopyMarkdownButton({ content }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-sm text-ctp-subtext0 hover:text-ctp-text transition-colors"
      title="Copy as Markdown"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-ctp-green" />
          <span className="text-ctp-green">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy as Markdown</span>
        </>
      )}
    </button>
  );
}
