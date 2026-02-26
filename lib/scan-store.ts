import type { ScanResult } from './types'

// In-memory store — resets on server restart. Fine for MVP.
const store = new Map<string, ScanResult>()

export function saveScan(scan: ScanResult): void {
  store.set(scan.id, scan)
}

export function getScan(id: string): ScanResult | null {
  if (id === 'demo') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DEMO_SCAN } = require('./demo-data')
    return DEMO_SCAN as ScanResult
  }
  return store.get(id) ?? null
}
