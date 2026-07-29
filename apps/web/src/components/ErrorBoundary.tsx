import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Something went wrong.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("UI crash:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-main--contained" role="alert">
        <h1>We hit a problem</h1>
        <p>
          The page could not be shown. You can refresh and continue shopping —
          your guest session is usually still saved in this browser.
        </p>
        <p className="field-error">{this.state.message}</p>
        <div className="button-row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.assign("/")}
          >
            Go to home
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        </div>
      </main>
    );
  }
}
