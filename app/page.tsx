import Link from 'next/link'
import { FileDropzone } from '@/components/FileDropzone'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-xl font-bold text-text-primary">PlainSight</span>
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <Link href="/scan/demo" className="hover:text-text-primary transition-colors">Try Demo</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
          See what you&apos;re<br />
          <span className="italic">really</span> signing.
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
          Drop any contract. Get instant plain English translation, risk scoring, and the stuff that&apos;s missing — in seconds.
        </p>

        <FileDropzone />

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-muted">
          <span>or</span>
          <Link href="/scan/demo" className="text-accent hover:underline font-medium">
            Try with a sample lease →
          </Link>
        </div>

        <p className="mt-8 text-xs text-text-muted">
          🔒 Your documents are encrypted and never shared. We provide information, not legal advice.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-bg-secondary border-y border-border py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload', desc: 'Drop any contract. Lease, employment offer, NDA, freelancer agreement.' },
              { step: '2', title: 'Scan', desc: "Our AI reads every clause, translates it to plain English, and checks what's missing." },
              { step: '3', title: 'Understand', desc: 'Get a risk grade, danger spots, and pushback language — all in seconds.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-text-secondary text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contract types */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-center text-text-secondary mb-8">
          44 million renter households. 73 million freelancers. Zero affordable ways to understand what you&apos;re signing.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { emoji: '🏠', label: 'Apartment Lease' },
            { emoji: '💼', label: 'Job Offer' },
            { emoji: '🤫', label: 'NDA' },
            { emoji: '💻', label: 'Freelancer Contract' },
            { emoji: '📜', label: 'Terms of Service' },
          ].map(({ emoji, label }) => (
            <div key={label} className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{emoji}</div>
              <div className="text-xs text-text-secondary font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-xs text-text-muted max-w-2xl mx-auto">
          <strong className="text-text-secondary">Legal Disclaimer:</strong> PlainSight provides legal information for educational purposes. It is not a law firm and does not provide legal advice. Always consult a licensed attorney for legal advice specific to your situation.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-text-muted">
          <span className="text-text-muted">Privacy</span>
          <span className="text-text-muted">Terms</span>
          <span className="text-text-muted">Contact</span>
        </div>
      </footer>
    </main>
  )
}
