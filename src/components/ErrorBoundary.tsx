import React, { Component, ErrorInfo, ReactNode } from "react";
import { logError } from "../lib/logger";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError("React ErrorBoundary", { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center font-sans">
          <h2 className="font-display font-bold text-2xl text-red-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-brand-dark/60 mb-6 max-w-md">
            An unexpected error occurred. We have logged the issue and are looking into it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-accent transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
