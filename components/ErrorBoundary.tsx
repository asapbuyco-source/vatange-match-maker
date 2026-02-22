import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#111418',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ color: '#f43f5e', fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
                    <p style={{ color: '#9ca3af', maxWidth: '500px', marginBottom: '2rem' }}>
                        The application crashed during initialization or rendering. This is often due to missing environment variables or a configuration error.
                    </p>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'left',
                        maxWidth: '100%',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        border: '1px solid #334155'
                    }}>
                        <code style={{ color: '#fda4af' }}>{this.state.error?.toString()}</code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f43f5e',
                            border: 'none',
                            borderRadius: '9999px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Website
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
