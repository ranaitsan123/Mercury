/**
 * Error Boundary Component
 * 
 * Purpose: Catch React errors and display fallback UI
 * Prevents entire app from crashing due to component errors
 */

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="m-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Something went wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            An error occurred while rendering this component. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <details className="text-xs">
                                <summary className="cursor-pointer font-medium">Error details</summary>
                                <pre className="mt-2 overflow-auto rounded bg-muted p-2">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <Button onClick={this.handleReset} variant="outline">
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}