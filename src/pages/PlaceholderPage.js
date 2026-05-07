import Layout from '../Components/Layout/Layout';

const S = {
  page:  { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:  { background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '52px 44px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.06)' },
  emoji: { fontSize: '44px', marginBottom: '18px' },
  title: { fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' },
  sub:   { fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 },
  badge: { display: 'inline-block', marginTop: '20px', padding: '4px 12px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 600 },
};

export default function PlaceholderPage({ title = 'Em breve', subtitle, emoji = '🚧' }) {
  return (
    <Layout>
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.emoji}>{emoji}</div>
          <div style={S.title}>{title}</div>
          <p style={S.sub}>
            {subtitle || 'Esta funcionalidade está em desenvolvimento e estará disponível em breve.'}
          </p>
          <div style={S.badge}>Em desenvolvimento</div>
        </div>
      </div>
    </Layout>
  );
}
