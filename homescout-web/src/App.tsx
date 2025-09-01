import { useMemo, useState } from 'react'

type CityKey = `${string}, ${string}`

type CityData = {
  walkability: number   // 0–100
  schoolScore: number   // 0–10
  crimeIndex: number    // 0–100 (lower is better)
  income: number        // USD median household income
  demographics: { group: string; value: number }[]
  growth5y: number      // % home price growth in 5y
}

const MOCK: Record<CityKey, CityData> = {
  'Fullerton, CA': {
    walkability: 68, schoolScore: 7.8, crimeIndex: 42, income: 98000,
    demographics: [
      { group: 'Under 18', value: 19 },
      { group: '18-34', value: 28 },
      { group: '35-54', value: 26 },
      { group: '55+', value: 27 },
    ],
    growth5y: 6.2,
  },
  'Anaheim, CA': {
    walkability: 71, schoolScore: 6.5, crimeIndex: 55, income: 82000,
    demographics: [
      { group: 'Under 18', value: 22 },
      { group: '18-34', value: 30 },
      { group: '35-54', value: 25 },
      { group: '55+', value: 23 },
    ],
    growth5y: 5.1,
  },
  'Buena Park, CA': {
    walkability: 62, schoolScore: 7.0, crimeIndex: 48, income: 90000,
    demographics: [
      { group: 'Under 18', value: 21 },
      { group: '18-34', value: 29 },
      { group: '35-54', value: 27 },
      { group: '55+', value: 23 },
    ],
    growth5y: 5.5,
  },
}

const QUICK = ['Fullerton, CA', 'Anaheim, CA', 'Buena Park, CA'] as const

function dollars(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function computeProsCons(d?: CityData) {
  const pros: string[] = []
  const cons: string[] = []
  if (!d) return { pros, cons }

  if (d.walkability >= 70) pros.push('High walkability for errands')
  else if (d.walkability >= 60) pros.push('Decent walkability in core areas')
  else cons.push('Car-dependent neighborhoods')

  if (d.schoolScore >= 8) pros.push('Strong school ratings (8/10+)')
  else if (d.schoolScore >= 7) pros.push('Solid school options (~7/10)')
  else cons.push('Below-average school ratings')

  if (d.crimeIndex <= 40) pros.push('Lower-than-average crime index')
  else if (d.crimeIndex <= 50) pros.push('Moderate crime index')
  else cons.push('Higher crime index vs peers')

  if (d.income >= 100_000) pros.push('High median household income')
  else if (d.income < 85_000) cons.push('Lower median household income')

  if (d.growth5y >= 7) pros.push('Healthy 5-year home price growth')
  else if (d.growth5y < 5) cons.push('Slower recent price growth')

  return { pros, cons }
}

export default function App() {
  const [cityInput, setCityInput] = useState('Fullerton')
  const [stateInput, setStateInput] = useState('CA')
  const [selectedKey, setSelectedKey] = useState<CityKey>('Fullerton, CA')
  const data = MOCK[selectedKey]

  const { pros, cons } = useMemo(() => computeProsCons(data), [selectedKey])

  function handleSearch() {
    const key = `${cityInput}, ${stateInput}` as CityKey
    setSelectedKey(key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">HomeScout (Frontend Demo)</div>
          <div className="space-x-2">
            <button className="px-3 py-1.5 rounded-lg border bg-white">Sign in</button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">Create account</button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="font-medium mb-3">Find a city</div>
          <div className="grid gap-3 sm:grid-cols-[1fr,120px,auto] items-center">
            <div className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="City (e.g., Fullerton)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
              <input
                className="border rounded-lg px-3 py-2 w-24"
                placeholder="State"
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 bg-white"
              defaultValue={selectedKey}
              onChange={(e) => {
                const [c, s] = e.target.value.split(', ')
                setCityInput(c)
                setStateInput(s)
                setSelectedKey(e.target.value as CityKey)
              }}
            >
              {QUICK.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Metric label="Walkability" value={data?.walkability ?? '—'} suffix="/100" tip="Higher = easier errands on foot" />
          <Metric label="School score" value={data ? data.schoolScore.toFixed(1) : '—'} suffix="/10" />
          <Metric label="Crime index" value={data?.crimeIndex ?? '—'} tip="Lower is safer (0–100)" />
          <Metric label="Median income" value={data ? dollars(data.income) : '—'} />
        </div>

        {/* Pros / Cons */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Panel title="Pros">
            <ul className="list-disc pl-5 space-y-2">
              {pros.length ? pros.map((p, i) => <li key={i}>{p}</li>) : <li>No strong positives detected yet.</li>}
            </ul>
          </Panel>
          <Panel title="Cons">
            <ul className="list-disc pl-5 space-y-2">
              {cons.length ? cons.map((c, i) => <li key={i}>{c}</li>) : <li>No major concerns flagged.</li>}
            </ul>
          </Panel>
        </div>

        {/* Demographics (simple table to avoid extra deps) */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="font-medium mb-3">Demographics</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Group</th>
                <th className="py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {data?.demographics.map((row) => (
                <tr key={row.group} className="border-t">
                  <td className="py-2">{row.group}</td>
                  <td className="py-2">{row.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Assistant (frontend stub) */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="font-medium mb-3">AI Assistant (stub)</div>
          <p className="text-sm text-gray-600 mb-3">
            This is a frontend stub. Later, wire it to your Java/Maven API (e.g., <code>/api/ai/explain</code>).
          </p>
          <AssistantStub cityKey={selectedKey} data={data} />
        </div>

        {/* Footer note */}
        <div className="py-10 text-center text-xs text-gray-500">
          Demo only — metrics are mock values. Replace with backend data next.
        </div>
      </div>
    </div>
  )
}

function Metric({
  label, value, suffix, tip,
}: { label: string; value: string | number; suffix?: string; tip?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <span>{label}</span>
        {tip ? <span className="text-[10px] border rounded px-1 py-0.5 bg-gray-50">{'i'}</span> : null}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}{suffix || ''}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  )
}

function AssistantStub({ cityKey, data }: { cityKey: string; data?: CityData }) {
  const [q, setQ] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Ask me about schools, safety, walkability, or resale outlook.' },
  ])

  function answer(prompt: string) {
    if (!data) return 'Pick a city first.'
    const { walkability, schoolScore, crimeIndex, income, growth5y } = data
    return [
      `Quick take on ${cityKey}:`,
      `• Walkability ${walkability}/100 — ${walkability >= 70 ? 'good for errands' : walkability >= 60 ? 'decent' : 'car-dependent'}.`,
      `• Schools ${schoolScore.toFixed(1)}/10 — ${schoolScore >= 8 ? 'strong' : schoolScore >= 7 ? 'solid' : 'mixed'}.`,
      `• Crime index ${crimeIndex} (lower is safer).`,
      `• Median income ${dollars(income)}.`,
      `• 5-year price growth ${growth5y}% — ${growth5y >= 7 ? 'healthy' : growth5y >= 5 ? 'steady' : 'slower'}.`,
      `Share your budget + horizon for a tailored resale view.`,
    ].join('\n')
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-xl p-3 h-56 overflow-auto bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : ''}`}>
            <span className={`inline-block rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="Ask something about this city..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          onClick={() => {
            if (!q.trim()) return
            const user = q.trim()
            setQ('')
            setMessages((ms) => [...ms, { role: 'user', text: user }])
            setTimeout(() => {
              const a = answer(user)
              setMessages((ms) => [...ms, { role: 'assistant', text: a }])
            }, 250)
          }}
        >
          Ask
        </button>
      </div>
    </div>
  )
}
