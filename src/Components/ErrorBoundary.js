import { Component } from 'react';

const S = {
  wrap:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', fontFamily: "'Inter',sans-serif", padding: '24px' },
  card:  { background: '#fff', borderRadius: '12px', border: '1px solid #FCA5A5', padding: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.08)' },
  icon:  { fontSize: '32px', marginBottom: '12px' },
  title: { fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' },
  msg:   { fontSize: '13px', color: '#6B7280', marginBottom: '20px' },
  pre:   { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#DC2626', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '20px' },
  btn:   { padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={S.wrap}>
        <div style={S.card}>
          <div style={S.icon}>⚠️</div>
          <div style={S.title}>Algo deu errado</div>
          <div style={S.msg}>
            Um erro inesperado travou esta página. Recarregue para tentar novamente.
            Se o erro persistir, copie a mensagem abaixo e reporte.
          </div>
          <pre style={S.pre}>
            {error?.message || String(error)}
            {info?.componentStack ? '\n\nStack do componente:' + info.componentStack : ''}
          </pre>
          <button style={S.btn} onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
