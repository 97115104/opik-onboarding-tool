import { useEffect, useState } from 'react'
import { StepPanel } from '@/components/StepPanel'
import { contributionStore } from '@/features/issues'
import {
  PERSONA_OPTIONS,
  writePersona,
  readPersona,
  type Persona,
} from '@/lib/persona'

type StoreWithOptionalPersona = typeof contributionStore & {
  setPersona?: (persona: Persona | null) => void
}

function persistPersona(persona: Persona) {
  // Always write B's localStorage key (same key C uses when present).
  writePersona(persona)

  const store = contributionStore as StoreWithOptionalPersona
  if (typeof store.setPersona === 'function') {
    store.setPersona(persona)
    return
  }

  // Interim if setPersona is missing: map engineer/external to isEngineer.
  store.setIsEngineer(persona === 'engineer' || persona === 'external')
}

export function AboutYouStep() {
  const [selected, setSelected] = useState<Persona | null>(() => readPersona())

  useEffect(() => {
    const existing = readPersona()
    if (existing) persistPersona(existing)
  }, [])

  const onSelect = (persona: Persona) => {
    setSelected(persona)
    persistPersona(persona)
  }

  return (
    <StepPanel
      testId="step-about"
      title="About you"
      subtitle="Pick the role that best matches how you will use this wizard. Everyone still walks the contribution path."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {PERSONA_OPTIONS.map((option) => {
          const active = selected === option.id
          return (
            <li key={option.id}>
              <button
                type="button"
                data-testid={option.testId}
                onClick={() => onSelect(option.id)}
                className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-[var(--color-border)] bg-white text-slate-800 hover:border-slate-400'
                }`}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    </StepPanel>
  )
}
