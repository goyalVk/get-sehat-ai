import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-teal-700">Sehat AI</span>
          <span className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-full border border-teal-100 font-medium">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 hidden md:block">
            🌐 Hindi • English • Tamil • Telugu • Marathi
          </span>
          <Link href="/upload"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
            Try Free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse inline-block" />
          Building India's Health Intelligence OS — This is 10% of what's coming
        </div>

        {/* Main hook */}
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 text-stone-900 serif">
          500 million Indians<br />
          get medical reports.<br />
          <span className="text-teal-600">Almost none understand them.</span><br />
          <span className="text-stone-400">Until now.</span>
        </h1>

        <p className="text-base text-stone-400 mb-4 max-w-xl mx-auto leading-relaxed">
          Every report your doctor has ever given you —
          blood tests, scan reports, MRI findings, X-Rays.
          We explain it all in plain language,
          in the language you think in.
        </p>

        {/* Multilingual */}
        <p className="text-sm text-teal-600 font-medium mb-8">
          Multilingual AI — Hindi • English • Tamil • Telugu • Marathi • Bengali
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link href="/upload"
            className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-8 py-4 rounded-2xl transition-all text-base shadow-sm w-full sm:w-auto">
            Analyze My Report — Free →
          </Link>
          <a href="#vision"
            className="text-stone-400 hover:text-stone-600 text-sm underline underline-offset-4">
            See our full vision ↓
          </a>
        </div>

        <p className="text-xs text-stone-400">
          Works with SRL • Lal PathLabs • Apollo • Metropolis • Thyrocare • Any Indian lab
        </p>

      </section>

      {/* Stats strip */}
      <section className="bg-stone-50 border-y border-stone-100 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '500M+', label: 'Indians get medical reports yearly' },
              { number: '22+',   label: 'Indian languages we are targeting' },
              { number: 'Every', label: 'Blood test, scan, MRI, X-Ray report' },
              { number: '10%',   label: 'Of our final product — just the start' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-semibold text-teal-600 mb-1">{stat.number}</p>
                <p className="text-xs text-stone-500 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 md:p-12 text-center">
          <p className="text-xs font-medium text-red-400 uppercase tracking-widest mb-4">
            The Problem
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-4 serif leading-snug">
            Reports are written for doctors.<br />
            <span className="text-red-500">Not for the people who need them most.</span>
          </h2>
          <p className="text-stone-500 text-base max-w-xl mx-auto leading-relaxed">
            Doctors have 5 minutes per patient. Lab reports, scan findings,
            MRI results — all written in medical jargon nobody understands.
            Diseases caught at Stage 3 could have been caught at Stage 1 —
            if only someone had explained what the numbers meant.
            This is not a convenience problem. It is a life and death problem.
          </p>
        </div>
      </section>

      {/* Report types */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-center text-xs font-medium text-stone-400 uppercase tracking-widest mb-8">
          Every report. Every test. Every finding.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🩸', title: 'Blood Tests',    desc: 'CBC, LFT, KFT, HbA1c, Lipid Profile' },
            { icon: '🫀', title: 'Cardiac',         desc: 'ECG, Echo, Troponin, BNP reports' },
            { icon: '🧠', title: 'MRI / CT Scan',   desc: 'Radiology findings explained simply' },
            { icon: '🦴', title: 'X-Ray',           desc: 'Chest, bone, spine findings' },
            { icon: '🫁', title: 'Ultrasound',      desc: 'Abdomen, thyroid, pelvis reports' },
            { icon: '🔬', title: 'Pathology',       desc: 'Biopsy, histology, cytology reports' },
            { icon: '💊', title: 'Thyroid',         desc: 'TSH, T3, T4 and hormonal reports' },
            { icon: '📄', title: 'Doctor Reports',  desc: 'If your doctor wrote it, we explain it' },
          ].map((item, i) => (
            <div key={i}
              className="bg-white rounded-2xl p-4 border border-stone-100 text-center hover:border-teal-200 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-stone-800 text-xs mb-1">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-50 border-y border-stone-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-medium text-stone-400 uppercase tracking-widest mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Upload your report',
                desc: 'PDF or photo. Blood test, MRI, X-Ray, scan report — from any Indian lab or hospital. Even a photo of a paper report works.'
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI reads everything',
                desc: 'Our AI reads every value and finding, checks against normal ranges, understands medical context and Indian health patterns.'
              },
              {
                step: '03',
                icon: '✅',
                title: 'You understand',
                desc: 'Every finding explained in plain language — in Hindi or English. What is normal. What needs attention. What to ask your doctor.'
              }
            ].map((item, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-6 border border-stone-100 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-xs text-stone-300 font-medium mb-2">{item.step}</p>
                <h3 className="font-semibold text-stone-800 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-teal-500 uppercase tracking-widest mb-4">
            Multilingual AI
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-3 serif">
            India speaks 22 languages.<br />
            <span className="text-teal-600">So does Sehat AI.</span>
          </h2>
          <p className="text-stone-500 text-sm mb-8 max-w-lg mx-auto">
            Your report is in English. Your doctor speaks English.
            But you think in Hindi, Tamil, Telugu, or Marathi.
            Sehat AI explains your health in the language your heart understands.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { lang: 'Hindi',    status: 'live' },
              { lang: 'English',  status: 'live' },
              { lang: 'Tamil',    status: 'soon' },
              { lang: 'Telugu',   status: 'soon' },
              { lang: 'Marathi',  status: 'soon' },
              { lang: 'Bengali',  status: 'soon' },
              { lang: 'Gujarati', status: 'soon' },
              { lang: 'Kannada',  status: 'soon' },
              { lang: 'Punjabi',  status: 'soon' },
              { lang: 'Odia',     status: 'soon' },
            ].map((item, i) => (
              <span key={i}
                className={`text-sm px-4 py-2 rounded-full font-medium border ${
                  item.status === 'live'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-stone-400 border-stone-200'
                }`}>
                {item.lang}
                {item.status === 'soon' && (
                  <span className="text-xs ml-1 opacity-60">soon</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="bg-stone-50 border-y border-stone-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-block bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium px-4 py-2 rounded-full mb-4">
              This is 10% of what we are building
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 serif mb-3">
              We are building India's<br />
              Health Intelligence OS
            </h2>
            <p className="text-stone-500 text-sm max-w-xl mx-auto">
              Not just a report reader. A lifelong AI health companion
              for every Indian — from their first test to their last.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                phase: 'V1 — Live Now',
                status: 'live',
                icon: '✅',
                items: [
                  'Blood tests, MRI, X-Ray, scan reports — all explained',
                  'AI explains every finding in plain language',
                  'Hindi + English multilingual output',
                  'Urgent flags and doctor questions',
                  'India-specific diet and lifestyle advice',
                ]
              },
              {
                phase: 'V2 — In Development',
                status: 'building',
                icon: '🔄',
                items: [
                  'Mobile OTP login — personal health OS',
                  'Report history and trend comparison',
                  'Track HbA1c, cholesterol over months',
                  'Personalized accumulated health advice',
                  'Family health management — 4 members',
                ]
              },
              {
                phase: 'V3 — Next Quarter',
                status: 'roadmap',
                icon: '📋',
                items: [
                  'Voice output in 8 regional languages',
                  'WhatsApp — forward report, get explanation',
                  'Medication interaction checker',
                  'ABHA digital health ID integration',
                  'Pre-appointment doctor brief generator',
                ]
              },
              {
                phase: 'V4 — Scale',
                status: 'roadmap',
                icon: '🚀',
                items: [
                  'Corporate wellness — ₹200/employee/month',
                  'Insurance company partnerships',
                  'Diagnostic lab API integrations',
                  'Southeast Asia and Middle East expansion',
                  'Native Android + iOS app',
                ]
              }
            ].map((card, i) => (
              <div key={i}
                className={`rounded-2xl p-6 border ${
                  card.status === 'live'
                    ? 'bg-teal-50 border-teal-200'
                    : card.status === 'building'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-stone-100'
                }`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{card.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    card.status === 'live'
                      ? 'bg-teal-600 text-white'
                      : card.status === 'building'
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {card.phase}
                  </span>
                </div>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j}
                      className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="text-teal-400 flex-shrink-0 mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor gap */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-6">
            The Gap We Fill
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 serif">
            ChatGPT Health launched January 2026.<br />
            <span className="text-teal-400">India is not on their roadmap.</span><br />
            We are.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'ChatGPT Health',
                gap: 'US only. No India. No Hindi. No Indian lab formats. No ABHA.',
                highlight: false
              },
              {
                name: 'Practo / 1mg',
                gap: 'Doctor booking and pharmacy. Zero AI report interpretation.',
                highlight: false
              },
              {
                name: 'Sehat AI',
                gap: 'Built for India. Indian labs. Indian languages. Indian families. Indian problems.',
                highlight: true
              }
            ].map((item, i) => (
              <div key={i}
                className={`rounded-2xl p-5 text-left ${
                  item.highlight
                    ? 'bg-teal-600 border border-teal-500'
                    : 'bg-stone-800 border border-stone-700'
                }`}>
                <p className={`font-semibold mb-2 text-sm ${
                  item.highlight ? 'text-white' : 'text-stone-300'
                }`}>
                  {item.name}
                </p>
                <p className={`text-xs leading-relaxed ${
                  item.highlight ? 'text-teal-100' : 'text-stone-500'
                }`}>
                  {item.gap}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold text-stone-800 mb-4 serif">
          Try it right now.
        </h2>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Upload your blood test, scan report, or MRI finding.
          See what Sehat AI can do.
          No signup. No credit card. Completely free to try.
        </p>
        <Link href="/upload"
          className="inline-block bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-10 py-4 rounded-2xl transition-all text-base shadow-sm">
          Upload My Report — Free →
        </Link>
        <p className="text-xs text-stone-400 mt-4">
          Works on mobile • No app download • Every Indian lab • Every report type
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-teal-700">Sehat AI</span>
            <p className="text-xs text-stone-400 text-center max-w-lg leading-relaxed">
              For educational purposes only. Not medical advice.
              Always consult a qualified doctor before making health decisions.
            </p>
            <p className="text-xs text-stone-400">Built in India 🇮🇳</p>
          </div>
        </div>
      </footer>

    </main>
  )
}