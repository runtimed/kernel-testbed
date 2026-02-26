/**
 * GitHub API client for fetching conformance reports from releases
 */

import type { ConformanceMatrix } from '@/types/report';

const REPO = 'runtimed/kernel-testbed';
const GITHUB_API = 'https://api.github.com';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: GitHubAsset[];
}

interface GitHubAsset {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
}

export interface ReleaseInfo {
  id: number;
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  hasConformanceData: boolean;
}

/**
 * Get the latest conformance data from GitHub releases
 */
export async function getLatestConformanceData(): Promise<ConformanceMatrix> {
  // Fetch latest release
  const releaseRes = await fetch(`${GITHUB_API}/repos/${REPO}/releases/latest`);

  if (!releaseRes.ok) {
    if (releaseRes.status === 404) {
      throw new Error('No releases found. Conformance reports have not been published yet.');
    }
    throw new Error(`Failed to fetch release: ${releaseRes.status} ${releaseRes.statusText}`);
  }

  const release: GitHubRelease = await releaseRes.json();

  // Find the conformance-matrix.json asset
  const asset = release.assets.find((a) => a.name === 'conformance-matrix.json');

  if (!asset) {
    throw new Error(
      `No conformance-matrix.json found in release ${release.tag_name}. ` +
        'The release may have been created before the site was set up.'
    );
  }

  // Fetch the actual JSON
  const dataRes = await fetch(asset.browser_download_url);

  if (!dataRes.ok) {
    throw new Error(`Failed to fetch conformance data: ${dataRes.status} ${dataRes.statusText}`);
  }

  return dataRes.json();
}

/**
 * Get conformance data from a specific release tag
 */
export async function getConformanceDataByTag(tag: string): Promise<ConformanceMatrix> {
  const releaseRes = await fetch(`${GITHUB_API}/repos/${REPO}/releases/tags/${tag}`);

  if (!releaseRes.ok) {
    throw new Error(`Release ${tag} not found`);
  }

  const release: GitHubRelease = await releaseRes.json();
  const asset = release.assets.find((a) => a.name === 'conformance-matrix.json');

  if (!asset) {
    throw new Error(`No conformance data found in release ${tag}`);
  }

  const dataRes = await fetch(asset.browser_download_url);
  return dataRes.json();
}

/**
 * Get list of recent releases with conformance data
 */
export async function getReleaseHistory(limit = 10): Promise<ReleaseInfo[]> {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/releases?per_page=${limit}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch releases: ${res.status}`);
  }

  const releases: GitHubRelease[] = await res.json();

  return releases.map((r) => ({
    id: r.id,
    tag: r.tag_name,
    name: r.name,
    publishedAt: r.published_at,
    url: r.html_url,
    hasConformanceData: r.assets.some((a) => a.name === 'conformance-matrix.json'),
  }));
}
