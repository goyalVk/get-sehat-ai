'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      setError('Please upload a PDF or image (JPG, PNG)')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const takePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const f = e.target.files?.[0]
      if (f) handleFile(f)
    }
    input.click()
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')

    try {
      setLoadingMsg('Uploading your report...')
      const formData = new FormData()
      formData.append('file', file)

      setLoadingMsg('AI is reading your report... (20-30 seconds)')
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      setLoadingMsg('Done! Loading results...')
      router.push(`/results/${data.reportId}`)

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 mb-8 block">← Back</Link>

      <h1 className="text-2xl font-semibold text-stone-800 mb-1 serif">Upload your report</h1>
      <p className="text-sm text-stone-500 mb-8">PDF ya image — kisi bhi Indian lab ki report chalegi</p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && document.getElementById('fileInput')?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all
          ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${dragging ? 'border-teal-400 bg-teal-50' :
            file ? 'border-teal-300 bg-teal-50' :
            'border-stone-200 hover:border-stone-300 bg-white'}`}
      >
        <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file ? (
          <div>
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium text-teal-700 text-sm">{file.name}</p>
            <p className="text-xs text-stone-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {!loading && <p className="text-xs text-stone-400 mt-2">Click to change file</p>}
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📋</div>
            <p className="font-medium text-stone-700 mb-1">Drop report here</p>
            <p className="text-sm text-stone-400">ya click karke select karo</p>
            <p className="text-xs text-stone-300 mt-3">PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
      </div>

      {/* Camera — mobile ke liye */}
      {!file && !loading && (
        <button onClick={takePhoto}
          className="w-full mt-3 py-3.5 border border-stone-200 rounded-2xl text-sm text-stone-500 hover:bg-stone-50 transition-colors bg-white">
          📸 Paper report ka photo lo
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-stone-600 font-medium">{loadingMsg}</p>
          <p className="text-xs text-stone-400 mt-1">Thoda wait karo...</p>
        </div>
      )}

      {!loading && (
        <button onClick={analyze} disabled={!file}
          className={`w-full mt-5 py-4 rounded-2xl font-medium text-base transition-all
            ${file ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-sm'
                   : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
          {file ? 'Analyze karo →' : 'Pehle file select karo'}
        </button>
      )}

      <p className="text-xs text-stone-400 text-center mt-5 leading-relaxed">
        Aapki report securely process hoti hai. Data store nahi hota bina permission ke.
      </p>
    </main>
  )
}