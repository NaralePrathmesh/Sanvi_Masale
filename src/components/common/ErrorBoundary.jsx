import { Component } from 'react';
import { resetDemoAndGoHome } from '@/utils/reset';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
        <h1 className="font-display text-2xl text-chilli">Something went wrong</h1>
        <p className="max-w-md text-charcoal-500">The demo hit an unexpected error. Resetting demo data usually fixes it.</p>
        <div className="flex gap-3">
          <button type="button" className="btn-outline" onClick={() => window.location.reload()}>Reload</button>
          <button type="button" className="btn-primary" onClick={resetDemoAndGoHome}>Reset demo data</button>
        </div>
      </div>
    );
  }
}
