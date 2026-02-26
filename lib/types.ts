export type RiskLevel = 'green' | 'yellow' | 'red';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type ContractType = 'lease' | 'employment' | 'nda' | 'freelancer' | 'tos' | 'other';
export type PartyRole = 'tenant' | 'employee' | 'recipient' | 'contractor' | 'user' | 'other';
export type TimelineEventType = 'start' | 'end' | 'payment' | 'renewal' | 'deadline' | 'other';
export type GhostSeverity = 'high' | 'medium' | 'low';

export type ClauseAnalysis = {
  id: string;
  original_text: string;
  plain_english: string;
  risk_level: RiskLevel;
  risk_score: number;
  category: string;
  benchmark_note: string | null;
  concern: string | null;
  negotiation_ammo: string | null;
};

export type GhostClause = {
  id: string;
  title: string;
  description: string;
  why_it_matters: string;
  standard_version: string;
  severity: GhostSeverity;
  category: string;
};

export type TimelineEvent = {
  id: string;
  date: string | null;
  relative: string | null;
  label: string;
  type: TimelineEventType;
  notes: string | null;
};

export type ScanResult = {
  id: string;
  file_name: string;
  contract_type: ContractType;
  detected_party_side: PartyRole;
  jurisdiction: string;
  overall_grade: Grade;
  overall_risk_score: number;
  tldr_summary: string;
  top_concerns: string[];
  clauses: ClauseAnalysis[];
  ghost_clauses: GhostClause[];
  timeline_events: TimelineEvent[];
  created_at: string;
};
