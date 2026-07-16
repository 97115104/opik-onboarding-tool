import { useCallback, useEffect, useState } from 'react'
import { Modal } from './Modal'

type OpenOpikResult = {
  ok: boolean
  path?: string
  error?: string
}

export type OpenOpikInCursorModalProps = {
  open: boolean
  opikPath: string
  onClose: () => void
  /** Fired after a successful open; use to trigger prompt deeplinks. */
  onOpened?: () => void
}

function isAbsolutePath(value: string): boolean {
  return value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)
}

export async function requestOpenOpikInCursor(): Promise<OpenOpikResult> {
  try {
    const res = await fetch('/api/open-opik-in-cursor', { method: 'POST' })
    const data = (await res.json()) as OpenOpikResult
    if (!res.ok && data.ok !== false) {
      return { ok: false, error: data.error ?? `Request failed (${res.status})`, path: data.path }
    }
    return data
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not open Cursor',
    }
  }
}

export function OpenOpikInCursorModal({
  open,
  opikPath,
  onClose,
  onOpened,
}: OpenOpikInCursorModalProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayPath, setDisplayPath] = useState(opikPath)
  const [pathReady, setPathReady] = useState(() => isAbsolutePath(opikPath))

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(null)
    setDisplayPath(opikPath)
    setPathReady(isAbsolutePath(opikPath))

    ;(async () => {
      try {
        const res = await fetch('/api/opik-path')
        if (!res.ok) return
        const data = (await res.json()) as { path?: string }
        if (cancelled || !data.path) return
        setDisplayPath(data.path)
        setPathReady(isAbsolutePath(data.path))
      } catch {
        /* keep parent-provided path */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, opikPath])

  const handleClose = useCallback(() => {
    if (busy) return
    setError(null)
    onClose()
  }, [busy, onClose])

  const handleConfirm = useCallback(async () => {
    if (!pathReady) {
      setError('Still loading the Opik folder path. Try again in a moment.')
      return
    }
    setBusy(true)
    setError(null)
    const result = await requestOpenOpikInCursor()
    setBusy(false)
    if (!result.ok) {
      setError(
        result.error ??
          'Could not start Cursor. Check that the cursor command is on your PATH, then try again.',
      )
      return
    }
    setError(null)
    onOpened?.()
    onClose()
  }, [onClose, onOpened, pathReady])

  return (
    <Modal
      open={open}
      title="Open Opik in Cursor?"
      onClose={handleClose}
      testId="open-opik-confirm-modal"
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-600">
          This opens the Opik folder in Cursor on this machine:
        </p>
        <p
          data-testid="open-opik-path"
          className="break-all rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800"
        >
          {pathReady ? displayPath : 'Loading path…'}
        </p>
        {error ? (
          <p className="text-sm text-amber-800" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="open-opik-confirm"
            disabled={busy || !pathReady}
            onClick={() => void handleConfirm()}
            className="btn-primary px-4 py-2 font-medium disabled:opacity-40"
          >
            {busy ? 'Opening…' : 'Open in Cursor'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
