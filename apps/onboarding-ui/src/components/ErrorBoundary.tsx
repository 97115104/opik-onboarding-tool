import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Wizard step error:', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-testid="step-error-boundary"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-slate-800"
        >
          <h2 className="font-display text-2xl text-slate-950">Something went wrong</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This step hit an unexpected error. You can try again without leaving the wizard.
          </p>
          <p className="mt-3 font-mono text-xs text-slate-500">{this.state.error.message}</p>
          <button
            type="button"
            data-testid="step-error-retry"
            onClick={this.handleReset}
            className="mt-5 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
