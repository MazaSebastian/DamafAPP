import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#ffebee',
                    color: '#b71c1c',
                    height: '100vh',
                    width: '100vw',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'left'
                }}>
                    <div style={{ maxWidth: '600px', width: '100%' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️ Something went wrong</h2>
                        <p style={{ marginBottom: '20px' }}>The application crashed. Please report this error:</p>

                        <div style={{
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #ffcdd2',
                            marginBottom: '20px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                        </div>

                        {this.state.errorInfo && (
                            <details style={{ marginTop: '10px' }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>View Component Stack</summary>
                                <div style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '10px',
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    overflowX: 'auto'
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </div>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#b71c1c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
