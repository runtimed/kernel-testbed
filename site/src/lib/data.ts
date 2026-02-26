/**
 * Server-side data loading for build-time static generation
 */

import type { ConformanceMatrix, KernelReport } from '@/types/report';
import fs from 'node:fs';
import path from 'node:path';

let cachedData: ConformanceMatrix | null = null;

/**
 * Get conformance data from the embedded JSON file (at build time)
 */
export async function getConformanceData(): Promise<ConformanceMatrix> {
  if (cachedData) return cachedData;

  // Read from public/data at build time
  const dataPath = path.join(process.cwd(), 'public/data/conformance-matrix.json');

  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    cachedData = JSON.parse(raw);
    return cachedData!;
  }

  // Fallback: empty data for development
  console.warn('No conformance-matrix.json found, using empty data');
  return {
    reports: [],
    generated_at: new Date().toISOString(),
  };
}

/**
 * Get all kernel names for static path generation
 */
export async function getAllKernelNames(): Promise<string[]> {
  const data = await getConformanceData();
  return data.reports.map((r) => r.kernel_name);
}

/**
 * Get a specific kernel report by name
 */
export async function getKernelReport(name: string): Promise<KernelReport | undefined> {
  const data = await getConformanceData();
  return data.reports.find((r) => r.kernel_name === name);
}
