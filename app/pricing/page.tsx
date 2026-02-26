import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['1 scan per month', 'Plain English translation', 'Risk scoring', 'TL;DR card'],
    notIncluded: ['Ghost Clause detection', 'Benchmark comparisons', 'Negotiation ammo', 'Calendar export'],
    cta: 'Get Started',
    href: '/',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'Unlimited scans',
      'Plain English translation',
      'Risk scoring',
      'TL;DR card',
      'Ghost Clause detection',
      'Benchmark comparisons',
      'Negotiation ammo',
      'Calendar export',
      'Full scan history',
    ],
    notIncluded: [],
    cta: 'Start Pro',
    href: '/',
    highlight: true,
  },
  {
    name: 'Per Scan',
    price: '$4.99',
    period: '/scan',
    features: [
      'Pay as you go',
      'Plain English translation',
      'Risk scoring',
      'TL;DR card',
      'Ghost Clause detection',
      'Benchmark comparisons',
      'Negotiation ammo',
      'Calendar export',
    ],
    notIncluded: [],
    cta: 'Buy a Scan',
    href: '/',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-text-primary">PlainSight</Link>
        <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">← Back</Link>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-serif text-4xl font-bold text-center mb-4">Simple, transparent pricing</h1>
        <p className="text-text-secondary text-center mb-16">Start free. No credit card required.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-accent bg-accent-light ring-2 ring-accent'
                  : 'border-border bg-bg-document'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">Most Popular</div>
              )}
              <h2 className="font-serif text-2xl font-bold mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-text-muted text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-risk-green">✓</span>
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                    <span>✕</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-accent text-white hover:bg-blue-700'
                    : 'bg-bg-secondary border border-border hover:bg-border'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-xs text-text-muted max-w-2xl mx-auto">
          <strong className="text-text-secondary">Legal Disclaimer:</strong> PlainSight provides legal information for educational purposes. Not legal advice.
        </p>
      </footer>
    </div>
  )
}
