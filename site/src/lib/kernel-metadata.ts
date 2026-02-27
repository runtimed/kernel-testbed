/**
 * Kernel metadata loading utilities
 *
 * Static metadata about kernels that doesn't come from test reports
 */

import kernelData from '@/data/kernels.json';

export interface KernelMetadata {
  /** Implementation name (should match KernelReport.implementation) */
  implementation: string;
  /** URL to the kernel's source repository */
  repository: string;
  /** Short description of the kernel */
  description?: string;
  /** URL to documentation */
  documentation?: string;
}

interface KernelMetadataMap {
  kernels: Record<string, KernelMetadata>;
}

const metadata = kernelData as KernelMetadataMap;

/**
 * Get metadata for a kernel by its kernel_name (from KernelReport)
 */
export function getKernelMetadata(kernelName: string): KernelMetadata | undefined {
  return metadata.kernels[kernelName];
}

/**
 * Get all kernel metadata
 */
export function getAllKernelMetadata(): KernelMetadataMap {
  return metadata;
}
