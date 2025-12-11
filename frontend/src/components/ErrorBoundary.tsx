
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    margin: '1rem'
                }}>
                    <h3 style={{ color: 'var(--color-error)' }}>Algo salió mal.</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Ocurrió un error inesperado al cargar esta sección.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
                    >
                        Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
