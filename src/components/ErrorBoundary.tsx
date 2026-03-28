import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="w-10 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground font-body text-sm">
                We encountered an unexpected error. For your security, we've halted the operation to protect your data.
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </Button>
            <p className="text-xs text-muted-foreground pt-4 border-t border-border">
              If the problem persists, please contact our professional support team.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
