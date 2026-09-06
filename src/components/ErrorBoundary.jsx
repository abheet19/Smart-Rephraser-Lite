import React from "react";
import { sendEvent } from "../utils/telemetry";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // send to telemetry (sample or with user consent)
    sendEvent("exception", { message: error.message, stack: error.stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <div className="error-boundary glass-card">
            <h2>Something went wrong.</h2>
            <p>We’ve recorded this issue. Try refreshing the page.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
