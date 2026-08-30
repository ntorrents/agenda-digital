import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Petit Diari web:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-pd-cream flex items-center justify-center p-6">
          <div className="max-w-md rounded-2xl bg-white border border-stone-200 p-6 shadow-lg">
            <p className="font-display font-black text-lg text-stone-800">S&apos;ha produït un error</p>
            <p className="mt-2 text-sm text-stone-500">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-pd-teal text-white text-sm font-bold rounded-xl"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
