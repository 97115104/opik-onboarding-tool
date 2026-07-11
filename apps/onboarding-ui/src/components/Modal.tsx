import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  testId?: string
}

export function Modal({ open, title, onClose, children, testId = 'modal' }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      data-testid={`${testId}-backdrop`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${testId}-title`}
        data-testid={testId}
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id={`${testId}-title`} className="font-display text-2xl text-slate-950">
            {title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            data-testid={`${testId}-close`}
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
