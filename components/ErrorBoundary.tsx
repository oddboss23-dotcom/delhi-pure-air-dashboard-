
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AppErrorBoundary handles unexpected system logic errors.
 * Explicitly extending Component with Props and State generics
 * ensures that 'this.props' and 'this.state' are correctly recognized
 * by the TypeScript compiler across all methods.
 */
// Fix: Use Component explicitly from 'react' to ensure base class members like 'props' are correctly typed and visible.
export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PureAir System Exception:', error, errorInfo);
  }

  public render(): ReactNode {
    const { hasError, error } = this.state;
    // Accessing children from this.props which is defined in the base Component class.
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-8">
            <AlertTriangle className="text-rose-500" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-4 uppercase">System Logic Error</h1>
          <p className="text-white/40 max-w-md mb-8 font-medium leading-relaxed">
            The NCT Intelligence node encountered an unexpected instruction state (Error #31 or similar).
            <br />
            <code className="block mt-4 p-4 bg-white/5 rounded-xl text-xs text-rose-400 font-mono">
              {error?.message || 'Unknown Exception'}
            </code>
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
          >
            <RefreshCw size={16} />
            Re-initialize System
          </button>
        </div>
      );
    }

    return children || null;
  }
}
