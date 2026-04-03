import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-lg font-semibold text-teal-700">getsehat.ai</span>
        <span className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full font-medium border border-teal-100">
          Free to try
        </span>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pt-14 pb-16 text-center">
        <div className="inline-block bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-amber-100">
          No signup required • Works with any Indian lab
        </div>
        <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-stone-900 serif">
          Apni lab report<br />ab samjho aasaani se
        </h1>
        <p className="text-base text-stone-500 mb-8 max-w-lg mx-auto leading-relaxed">
          Upload any blood test, lipid profile or health report.
          AI explains every value in simple Hindi and English — no jargon, no confusion.
        </p>
        <Link href="/upload"
          className="inline-block bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-medium px-8 py-3.5 rounded-2xl transition-all text-base shadow-sm">
          Upload report — it's free →
        </Link>
        <p className="text-xs text-stone-400 mt-4">
          SRL, Lal PathLabs, Apollo, Metropolis, Thyrocare — sab chalega
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📋', title: 'Upload karo', desc: 'PDF ya photo — kisi bhi lab ki report chalegi. Paper report ka photo bhi.' },
            { icon: '🔍', title: 'AI padhega',  desc: 'Har value AI read karta hai aur normal range se compare karta hai.' },
            { icon: '✅', title: 'Samjho',      desc: 'Har parameter simple bhasha mein explain hoga. Doctor se kya poochna hai — woh bhi.' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-stone-800 mb-2 text-sm">{item.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-100 py-6 text-center px-6">
        <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
          GetSehat AI is for educational purposes only. Not medical advice. 
          Always consult a doctor before making health decisions.
        </p>
      </footer>
    </main>
  )
}