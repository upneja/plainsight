import type { ScanResult } from './types';

export const DEMO_SCAN: ScanResult = {
  id: 'demo',
  file_name: 'Sample NYC Apartment Lease.pdf',
  contract_type: 'lease',
  detected_party_side: 'tenant',
  jurisdiction: 'New York',
  overall_grade: 'C',
  overall_risk_score: 58,
  tldr_summary: 'This is a standard NYC residential lease with several tenant-unfavorable clauses. The landlord retains broad entry rights without specifying adequate notice, and the auto-renewal clause gives you a very short window to avoid being locked into another year. The security deposit terms are acceptable but the late fee structure is aggressive.',
  top_concerns: [
    "Landlord may enter with only 24 hours notice for non-emergency inspections — consider negotiating for 48-hour written notice",
    "Auto-renewal kicks in if you don't give 60-day notice — most leases require only 30 days",
    "Late fee of 8% kicks in after just 3 days — unusually aggressive"
  ],
  clauses: [
    {
      id: 'clause-001',
      original_text: 'Tenant shall pay as rent the sum of $3,200 per month, due on the first day of each calendar month. A late charge of 8% of the monthly rent shall be assessed for any payment received after the 3rd day of the month.',
      plain_english: "Your rent is $3,200/month due on the 1st. If you pay after the 3rd, you owe an extra $256 in late fees.",
      risk_level: 'yellow',
      risk_score: 52,
      category: 'payment',
      benchmark_note: 'The 3-day grace period is shorter than the 5-day grace period common in most NYC leases. The 8% late fee is at the high end — most agreements charge 5%.',
      concern: 'The combination of a short grace period and high late fee percentage is aggressive.',
      negotiation_ammo: "I'd like to request a 5-day grace period before late fees apply, and a 5% late fee rate rather than 8%. Both are more typical for residential leases in New York. Would you be open to those adjustments?"
    },
    {
      id: 'clause-002',
      original_text: "Landlord or Landlord's agents may enter the premises at any reasonable time upon 24 hours notice to Tenant for the purpose of inspection, repairs, or showing the apartment to prospective tenants or buyers.",
      plain_english: 'Your landlord can come into your apartment with just 24 hours notice to inspect, make repairs, or show it to other people.',
      risk_level: 'yellow',
      risk_score: 45,
      category: 'entry_rights',
      benchmark_note: 'NY Real Property Law requires "reasonable notice" which courts typically interpret as 24 hours. This clause meets the minimum but does not specify that notice must be in writing.',
      concern: 'Without a written notice requirement, verbal notice 24 hours before entry is technically compliant.',
      negotiation_ammo: "Could we add language specifying that entry notice must be given in writing (email or text) at least 24 hours in advance? This just makes sure there's a clear record for both of us."
    },
    {
      id: 'clause-003',
      original_text: 'The security deposit of $6,400 (equal to two months\' rent) shall be held by Landlord in a separate interest-bearing account. The deposit shall be returned within 14 days of the termination of tenancy, less any deductions for damages beyond normal wear and tear.',
      plain_english: "You'll pay a $6,400 security deposit (2 months rent) held in a separate account. You get it back within 14 days of moving out, minus any legitimate damages.",
      risk_level: 'green',
      risk_score: 18,
      category: 'security_deposit',
      benchmark_note: "Two months' rent is the maximum allowed in New York. The 14-day return window matches NY law.",
      concern: null,
      negotiation_ammo: null
    },
    {
      id: 'clause-004',
      original_text: 'This Lease shall automatically renew for successive one-year terms unless Tenant provides written notice of intent not to renew at least sixty (60) days prior to the expiration of the current term.',
      plain_english: "Your lease automatically renews for another year unless you give 60 days written notice before it ends. Miss that window and you're locked in for another year.",
      risk_level: 'red',
      risk_score: 72,
      category: 'renewal',
      benchmark_note: "Most NYC leases require 30 days notice to prevent auto-renewal. A 60-day requirement gives you less flexibility.",
      concern: "If your lease ends June 30, you must notify by April 30 — that's a long lead time that's easy to miss.",
      negotiation_ammo: "The 60-day notice requirement for non-renewal is longer than what I see in most NYC residential leases. Would you consider reducing it to 30 days?"
    },
    {
      id: 'clause-005',
      original_text: "Tenant shall not sublet the premises or any portion thereof without the prior written consent of Landlord, which consent may be withheld in Landlord's sole and absolute discretion.",
      plain_english: "You cannot sublet your apartment without the landlord's written permission, and they can say no for any reason.",
      risk_level: 'red',
      risk_score: 68,
      category: 'other',
      benchmark_note: "New York Real Property Law §226-b gives tenants in buildings with 4+ units the right to sublet with landlord approval — and the landlord cannot unreasonably withhold consent. This clause's 'sole and absolute discretion' language may conflict with that right.",
      concern: "This clause overstates landlord rights in NYC.",
      negotiation_ammo: "For NYC buildings with 4 or more units, I understand NY RPL 226-b gives tenants the right to sublet with landlord approval, where approval cannot be unreasonably withheld. Could we update the language to reflect that standard?"
    },
    {
      id: 'clause-006',
      original_text: 'Tenant is responsible for all utilities including electricity, gas, and internet service. Landlord provides water and heat.',
      plain_english: 'You pay for electric, gas, and internet. Landlord covers water and heat.',
      risk_level: 'green',
      risk_score: 12,
      category: 'other',
      benchmark_note: null,
      concern: null,
      negotiation_ammo: null
    },
    {
      id: 'clause-007',
      original_text: 'Any dispute arising under this Lease shall be resolved by binding arbitration administered by the American Arbitration Association. Tenant waives the right to a jury trial and the right to participate in any class action.',
      plain_english: "If you have a dispute with your landlord, you must go to arbitration — not court. You also give up your right to join a class action lawsuit.",
      risk_level: 'red',
      risk_score: 78,
      category: 'dispute_resolution',
      benchmark_note: 'Mandatory arbitration clauses are uncommon in residential leases and are heavily landlord-favorable.',
      concern: "Arbitration favors repeat players (landlords) over one-time participants (tenants). You lose your right to pursue claims collectively with other tenants.",
      negotiation_ammo: "Mandatory arbitration and class action waivers are unusual in residential leases. I'd prefer standard court jurisdiction for dispute resolution. Is this something we could modify?"
    }
  ],
  ghost_clauses: [
    {
      id: 'ghost-001',
      title: 'Early Termination Clause',
      description: 'This lease contains no provision for early termination. If you need to break the lease, there is no defined process or fee structure.',
      why_it_matters: 'Without an early termination clause, breaking the lease could expose you to liability for the full remaining rent for the rest of the lease term.',
      standard_version: 'Most leases include an early termination option allowing tenants to exit with 30-60 days notice and payment of 1-2 months\' rent as a termination fee.',
      severity: 'high',
      category: 'termination'
    },
    {
      id: 'ghost-002',
      title: 'Pet Policy',
      description: 'The lease makes no mention of pets — whether they are allowed, prohibited, or subject to additional deposits.',
      why_it_matters: "Without a written pet policy, a verbal agreement to allow pets has no legal standing.",
      standard_version: 'Standard leases specify whether pets are permitted, any pet deposit or monthly pet fee, weight/breed restrictions, and that service/emotional support animals are exempt.',
      severity: 'medium',
      category: 'other'
    },
    {
      id: 'ghost-003',
      title: 'Rent Increase Cap / Renewal Terms',
      description: 'The auto-renewal clause does not specify what the rent will be upon renewal.',
      why_it_matters: 'Without rent increase limits or advance notice requirements tied to renewal, you could receive a renewal notice at a substantially higher rate.',
      standard_version: 'Well-drafted leases specify maximum rent increase percentages for renewals, or require 60-90 days advance notice of any rent change before the renewal window closes.',
      severity: 'high',
      category: 'renewal'
    },
    {
      id: 'ghost-004',
      title: 'Maintenance Responsibility Breakdown',
      description: 'The lease does not specify who is responsible for various types of maintenance and repairs.',
      why_it_matters: 'Ambiguous maintenance responsibility leads to disputes. Without clarity, you may end up paying for things the landlord should cover.',
      standard_version: 'Standard leases detail which repairs are tenant responsibility vs. landlord responsibility (structural repairs, appliance failures, heating systems).',
      severity: 'medium',
      category: 'maintenance'
    }
  ],
  timeline_events: [
    {
      id: 'timeline-001',
      date: '2026-03-01',
      relative: null,
      label: 'Lease Start Date',
      type: 'start',
      notes: 'First day of tenancy. Keys exchanged, move-in permitted.'
    },
    {
      id: 'timeline-002',
      date: '2026-03-01',
      relative: null,
      label: 'First Rent Payment Due',
      type: 'payment',
      notes: '$3,200 due. Late fee of $256 applies after March 3rd.'
    },
    {
      id: 'timeline-003',
      date: null,
      relative: 'Monthly on the 1st',
      label: 'Monthly Rent Due',
      type: 'payment',
      notes: '$3,200/month. 3-day grace period before 8% late fee applies.'
    },
    {
      id: 'timeline-004',
      date: '2027-05-01',
      relative: null,
      label: 'Non-Renewal Notice Deadline',
      type: 'deadline',
      notes: 'Must give written notice by this date to avoid auto-renewal. 60 days before lease end (June 30, 2027).'
    },
    {
      id: 'timeline-005',
      date: '2027-06-30',
      relative: null,
      label: 'Lease End Date',
      type: 'end',
      notes: 'Lease expires. Auto-renews for 1 year if no notice given by May 1, 2027.'
    }
  ],
  created_at: new Date().toISOString()
};
