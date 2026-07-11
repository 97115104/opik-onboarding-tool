export type Persona = 'engineer' | 'pm' | 'support' | 'external'

export const PERSONA_STORAGE_KEY = 'opik-onboarding-persona'
/** C should set this to `1` when the quiz results panel is shown. */
export const QUIZ_FINISHED_KEY = 'opik-quiz-finished'
/** C should set this to `1` when the contributing quiz results panel is shown. */
export const CONTRIBUTING_QUIZ_FINISHED_KEY = 'opik-contributing-quiz-finished'
export const PERSONA_CHANGED_EVENT = 'opik-persona-changed'

export const PERSONA_OPTIONS: { id: Persona; label: string; testId: string }[] = [
  { id: 'engineer', label: 'Engineer', testId: 'about-persona-engineer' },
  { id: 'pm', label: 'PM', testId: 'about-persona-pm' },
  { id: 'support', label: 'Support', testId: 'about-persona-support' },
  { id: 'external', label: 'External contributor', testId: 'about-persona-external' },
]

export function isPersona(value: string | null | undefined): value is Persona {
  return value === 'engineer' || value === 'pm' || value === 'support' || value === 'external'
}

export function readPersona(): Persona | null {
  try {
    const value = localStorage.getItem(PERSONA_STORAGE_KEY)
    return isPersona(value) ? value : null
  } catch {
    return null
  }
}

export function writePersona(persona: Persona): void {
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, persona)
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(PERSONA_CHANGED_EVENT, { detail: persona }))
}

export function isQuizFinishedInStorage(): boolean {
  try {
    return localStorage.getItem(QUIZ_FINISHED_KEY) === '1'
  } catch {
    return false
  }
}

export function isContributingQuizFinishedInStorage(): boolean {
  try {
    return localStorage.getItem(CONTRIBUTING_QUIZ_FINISHED_KEY) === '1'
  } catch {
    return false
  }
}

export function personaSubtitle(
  map: Partial<Record<Persona, string>> & { default: string },
  persona: Persona | null = readPersona(),
): string {
  if (persona && map[persona]) return map[persona]!
  return map.default
}
