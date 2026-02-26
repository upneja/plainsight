import type { ScanResult } from './types'
import { DEMO_SCAN } from './demo-data'

// In-memory store — resets on server restart. Fine for MVP.
const store = new Map<string, ScanResult>()

export function saveScan(scan: ScanResult): void {
  store.set(scan.id, scan)
}

export function getScan(id: string): ScanResult | null {
  if (id === 'demo') return DEMO_SCAN
  return store.get(id) ?? null
}
