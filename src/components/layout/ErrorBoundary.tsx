import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center px-6">
          <div>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#1A3A2A' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8F5A0" strokeWidth="2" strokeLinecap="round">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Something went wrong</h2>
            <p className="text-[13px] text-gray-400 mb-4">{this.state.error.message}</p>
            <Link to="/listings" className="btn-primary px-6 py-3 text-[14px]">Back to Listings</Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
