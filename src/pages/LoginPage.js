import React, { useState } from 'react';
import api from '../services/api';

const styles = {
  page: {
    display: 'grid',
    gridTemplateColumns: '60% 40%',
    minHeight: '100vh',
    height: '100vh',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
  },
  left: {
    background: 'linear-gradient(135deg, #020617 0%, #0c1628 50%, #0a1525 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    padding: '56px 72px 40px 72px',
    gap: '24px',
  },
  leftGlow1: {
    position: 'absolute', top: '-180px', right: '-100px',
    width: '480px', height: '480px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  leftGlow2: {
    position: 'absolute', bottom: '80px', left: '-120px',
    width: '360px', height: '360px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2, flexShrink: 0 },
  logoIcon: {
    width: '40px', height: '40px',
    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: "'Sora', sans-serif", fontSize: '20px', fontWeight: 700, color: '#fff' },
  leftMain: { flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', zIndex: 2 },
  leftContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: '99px', padding: '5px 14px 5px 10px', width: 'fit-content',
  },
  badgeDot: { width: '7px', height: '7px', background: '#22C55E', borderRadius: '50%', flexShrink: 0 },
  headline: {
    fontFamily: "'Sora', sans-serif", fontSize: '48px', fontWeight: 800,
    lineHeight: 1.10, color: '#fff', margin: 0,
  },
  subheadline: { fontSize: '17px', lineHeight: 1.55, color: '#CBD5E1', maxWidth: '430px', margin: 0 },
  benefits: { display: 'flex', flexDirection: 'column', gap: '14px' },
  benefit: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  benefitTitle: { fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '2px' },
  benefitDesc: { fontSize: '13px', color: '#94A3B8', lineHeight: 1.4 },
  mockupCard: {
    width: '272px', minWidth: '252px',
    background: 'rgba(15,23,42,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '24px', padding: '20px 18px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', gap: '12px',
    flexShrink: 0, alignSelf: 'center',
  },
  mockupLabel: { fontSize: '11px', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' },
  mockupMonth: { fontSize: '14px', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' },
  mockupDivider: { height: '1px', background: 'rgba(255,255,255,0.07)' },
  mockupSubGray: { fontSize: '11px', color: '#94A3B8' },
  mockupBarWrap: { background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '5px', overflow: 'hidden', marginTop: '4px' },
  testimonial: {
    zIndex: 2, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px', padding: '18px 22px',
    display: 'flex', gap: '18px', alignItems: 'flex-start', flexShrink: 0,
  },
  testimonialAvatar: {
    width: '50px', height: '50px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #334155, #1E293B)',
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
  },
  testimonialQuote: { fontSize: '13px', color: '#CBD5E1', lineHeight: 1.55, fontStyle: 'italic', marginBottom: '6px' },
  testimonialAuthor: { fontSize: '13px', color: '#3B82F6', fontWeight: 600 },
  testimonialRole: { fontSize: '12px', color: '#94A3B8' },
  testimonialStats: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '155px', flexShrink: 0 },
  tStatLabel: { fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
  tStatValue: { fontSize: '15px', fontWeight: 700, color: '#22C55E', fontFamily: "'Sora', sans-serif" },
  tStatDesc: { fontSize: '11px', color: '#94A3B8' },
  right: {
    background: '#F8FAFC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 32px', overflowY: 'auto',
  },
  loginCard: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' },
  securityBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    background: '#EEF4FF', borderRadius: '99px',
    padding: '7px 16px', width: 'fit-content', alignSelf: 'center',
  },
  loginTitle: { fontFamily: "'Sora', sans-serif", fontSize: '32px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 },
  loginSub: { fontSize: '15px', color: '#64748B', marginTop: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '14px', fontWeight: 600, color: '#0F172A' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputBase: {
    width: '100%', height: '54px', borderRadius: '14px',
    border: '1.5px solid #CBD5E1', background: '#fff',
    padding: '0 16px 0 44px', fontSize: '15px', color: '#0F172A',
    fontFamily: "'Inter', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  },
  inputIcon: { position: 'absolute', left: '15px', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' },
  togglePw: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '4px' },
  rememberRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0F172A', cursor: 'pointer', userSelect: 'none' },
  btnSubmit: {
    width: '100%', height: '56px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    color: '#fff', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: 700, fontFamily: "'Sora', sans-serif",
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(37,99,235,0.35)', marginTop: '4px',
  },
  divider: { display: 'flex', alignItems: 'center', gap: '14px', color: '#94A3B8', fontSize: '13px' },
  dividerLine: { flex: 1, height: '1px', background: '#E2E8F0' },
  socialRow: { display: 'flex', gap: '12px' },
  btnSocial: {
    flex: 1, height: '52px', border: '1.5px solid #E2E8F0', background: '#fff',
    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', fontSize: '15px', fontWeight: 600, color: '#0F172A',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  newHereCard: { background: '#F1F5F9', borderRadius: '18px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' },
  newHereIcon: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #EEF4FF, #DBEAFE)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontSize: '20px',
  },
  newHereTitle: { fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' },
  newHereDesc: { fontSize: '13px', color: '#64748B' },
  btnRegister: {
    display: 'block', textAlign: 'center', padding: '13px',
    border: '2px solid #2563EB', borderRadius: '12px',
    color: '#2563EB', fontSize: '14px', fontWeight: 700,
    textDecoration: 'none', fontFamily: "'Sora', sans-serif",
    cursor: 'pointer', background: 'transparent', width: '100%',
  },
  helpText: { textAlign: 'center', fontSize: '14px', color: '#64748B' },
  errorMsg: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    color: '#DC2626', borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
  },
};

const iconBgs = {
  blue:   { background: 'rgba(37,99,235,0.18)',  borderRadius: '12px', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  green:  { background: 'rgba(34,197,94,0.15)',   borderRadius: '12px', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  purple: { background: 'rgba(139,92,246,0.18)',  borderRadius: '12px', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  amber:  { background: 'rgba(245,158,11,0.15)',  borderRadius: '12px', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};

const barColors = {
  blue:  'linear-gradient(90deg, #2563EB, #60A5FA)',
  amber: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
  green: 'linear-gradient(90deg, #22C55E, #4ADE80)',
};

function MockupBar({ color, width }) {
  return (
    <div style={styles.mockupBarWrap}>
      <div style={{ height: '100%', borderRadius: '99px', background: barColors[color], width }} />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('');

  function inputStyle(field) {
    return {
      ...styles.inputBase,
      borderColor: focus === field ? '#2563EB' : '#CBD5E1',
      boxShadow: focus === field ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
    };
  }

  async function handleLogin() {
    setError('');
    if (!email) { setError('Informe seu e-mail.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Digite um e-mail válido.'); return; }
    if (!senha) { setError('Digite uma senha.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, senha });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'E-mail ou senha incorretos.');
      }
    } catch (e) {
      const msg = e?.response?.data?.message;
      setError(msg || 'Erro ao conectar. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) { if (e.key === 'Enter') handleLogin(); }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={styles.page}>

        {/* ===== LEFT ===== */}
        <div style={styles.left}>
          <div style={styles.leftGlow1} />
          <div style={styles.leftGlow2} />

          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="white"/>
                <rect x="14" y="3" width="7" height="7" rx="2" fill="white" opacity="0.6"/>
                <rect x="3" y="14" width="7" height="7" rx="2" fill="white" opacity="0.6"/>
                <rect x="14" y="14" width="7" height="7" rx="2" fill="white"/>
              </svg>
            </div>
            <div style={styles.logoText}>Finan<span style={{ color: '#3B82F6' }}>Control</span></div>
          </div>

          {/* Main row */}
          <div style={styles.leftMain}>
            <div style={styles.leftContent}>
              {/* Badge */}
              <div style={styles.badge}>
                <div style={styles.badgeDot} />
                <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 500 }}>Finanças pessoais para casais</span>
              </div>

              {/* Headline */}
              <h1 style={styles.headline}>
                Transforme números<br />
                em <span style={{ color: '#3B82F6' }}>decisões melhores.</span>
              </h1>

              {/* Sub */}
              <p style={styles.subheadline}>
                Tenha clareza, controle e planejamento para construir o futuro que vocês sonham juntos.
              </p>

              {/* Benefits */}
              <div style={styles.benefits}>
                {[
                  {
                    color: 'blue', title: 'Visão completa', desc: 'Entradas, saídas e investimentos em um só lugar.',
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
                  },
                  {
                    color: 'green', title: 'Metas que se tornam realidade', desc: 'Planeje, acompanhe e conquiste seus objetivos.',
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
                  },
                  {
                    color: 'purple', title: 'Controle e segurança', desc: 'Seus dados protegidos com criptografia de ponta.',
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>,
                  },
                  {
                    color: 'amber', title: 'Insights inteligentes', desc: 'Análises personalizadas para melhores decisões.',
                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
                  },
                ].map((b) => (
                  <div key={b.title} style={styles.benefit}>
                    <div style={iconBgs[b.color]}>{b.icon}</div>
                    <div>
                      <div style={styles.benefitTitle}>{b.title}</div>
                      <div style={styles.benefitDesc}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div style={styles.mockupCard}>
              <div>
                <div style={styles.mockupLabel}>Resumo do mês</div>
                <div style={styles.mockupMonth}>
                  Abril 2026
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div style={styles.mockupDivider} />
              <div>
                <div style={styles.mockupSubGray}>Saldo</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#3B82F6', fontFamily: "'Sora',sans-serif", lineHeight: 1.1 }}>R$ 756</div>
                <div style={{ fontSize: '11px', color: '#22C55E' }}>+ 8,2% vs Março</div>
              </div>
              <div style={styles.mockupDivider} />
              <div>
                <div style={styles.mockupSubGray}>Taxa de poupança</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'Sora',sans-serif" }}>8,2%</div>
                <div style={styles.mockupSubGray}>Meta: 20%</div>
                <MockupBar color="blue" width="41%" />
              </div>
              <div style={styles.mockupDivider} />
              <div>
                <div style={styles.mockupSubGray}>Teto de gastos</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B', fontFamily: "'Sora',sans-serif" }}>94%</div>
                <div style={styles.mockupSubGray}>R$ 363 disponíveis</div>
                <MockupBar color="amber" width="94%" />
              </div>
              <div style={styles.mockupDivider} />
              <div>
                <div style={styles.mockupSubGray}>Metas ativas</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Sora',sans-serif" }}>3</div>
                <div style={styles.mockupSubGray}>Em andamento</div>
              </div>
              <div style={styles.mockupDivider} />
              <div>
                <div style={{ ...styles.mockupSubGray, marginBottom: '6px' }}>Saúde financeira</div>
                <svg width="160" height="120" viewBox="0 0 160 130" style={{ display: 'block', margin: '0 auto' }}>
                  <polygon points="80,15 130,42 130,88 80,115 30,88 30,42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                  <polygon points="80,30 117,50 117,80 80,100 43,80 43,50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <polygon points="80,45 104,58 104,72 80,85 56,72 56,58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                  <line x1="80" y1="15" x2="80" y2="115" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <line x1="30" y1="42" x2="130" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <line x1="130" y1="42" x2="30" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  <polygon points="80,28 118,54 112,82 80,108 44,84 42,50" fill="rgba(59,130,246,0.22)" stroke="#3B82F6" strokeWidth="1.5"/>
                  <text x="80" y="11" fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="Inter">Poupança</text>
                  <text x="134" y="46" fill="#64748B" fontSize="8" textAnchor="start" fontFamily="Inter">Reserva</text>
                  <text x="134" y="92" fill="#64748B" fontSize="8" textAnchor="start" fontFamily="Inter">Gastos</text>
                  <text x="80" y="126" fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="Inter">Gastos</text>
                  <text x="26" y="92" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="Inter">Reserva</text>
                  <text x="26" y="46" fill="#64748B" fontSize="8" textAnchor="end" fontFamily="Inter">Reserva</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div style={styles.testimonial}>
            <div style={styles.testimonialAvatar}>👫</div>
            <div style={{ flex: 1 }}>
              <div style={styles.testimonialQuote}>"Finalmente entendemos para onde nosso dinheiro vai e estamos construindo nosso futuro com confiança."</div>
              <div style={styles.testimonialAuthor}>— Amanda &amp; Well</div>
              <div style={styles.testimonialRole}>Usuários FinanControl</div>
            </div>
            <div style={styles.testimonialStats}>
              <div style={styles.tStatLabel}>Casais que usam FinanControl têm:</div>
              {[
                { v: '+38%', d: 'mais controle financeiro' },
                { v: '+27%', d: 'de economia média' },
                { v: '+2,4x', d: 'mais chances de atingir metas' },
              ].map((s) => (
                <div key={s.v}>
                  <div style={styles.tStatValue}>{s.v}</div>
                  <div style={styles.tStatDesc}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div style={styles.right}>
          <div style={styles.loginCard}>

            {/* Security badge */}
            <div style={styles.securityBadge}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: 500 }}>Seus dados estão protegidos com criptografia de ponta</span>
            </div>

            {/* Title */}
            <div>
              <div style={styles.loginTitle}>Bem-vindo(a) de volta! 👋</div>
              <div style={styles.loginSub}>Entre para acessar seu painel financeiro</div>
            </div>

            {/* Error */}
            {error && <div style={styles.errorMsg}>{error}</div>}

            {/* Form */}
            <div style={styles.form}>
              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="fc-email">E-mail</label>
                <div style={styles.inputWrap}>
                  <div style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                    </svg>
                  </div>
                  <input id="fc-email" type="email" placeholder="Digite seu e-mail" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocus('email')} onBlur={() => setFocus('')}
                    onKeyDown={onKey} autoComplete="email" style={inputStyle('email')} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="fc-senha">Senha</label>
                <div style={styles.inputWrap}>
                  <div style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input id="fc-senha" type={showPw ? 'text' : 'password'} placeholder="Digite sua senha" value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onFocus={() => setFocus('senha')} onBlur={() => setFocus('')}
                    onKeyDown={onKey} autoComplete="current-password"
                    style={{ ...inputStyle('senha'), paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={styles.togglePw} aria-label="Mostrar/ocultar senha">
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={styles.rememberRow}>
                <label style={styles.rememberLabel}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }} />
                  Lembrar de mim
                </label>
                <a href="/esqueci-senha" style={{ fontSize: '14px', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Esqueci minha senha</a>
              </div>

              <button type="button" onClick={handleLogin} disabled={loading}
                style={{ ...styles.btnSubmit, opacity: loading ? 0.85 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Carregando sua visão financeira...' : 'Entrar e ver meu saldo →'}
              </button>
            </div>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} /> ou continue com <div style={styles.dividerLine} />
            </div>

            {/* Social */}
            <div style={styles.socialRow}>
              <button type="button" style={styles.btnSocial}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" style={styles.btnSocial}>
                <svg width="18" height="18" viewBox="0 0 23 23">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                </svg>
                Microsoft
              </button>
            </div>

            {/* New here */}
            <div style={styles.newHereCard}>
              <div style={styles.newHereIcon}>🎁</div>
              <div>
                <div style={styles.newHereTitle}>Novo por aqui?</div>
                <div style={styles.newHereDesc}>Crie sua conta e comece a transformar suas finanças hoje mesmo.</div>
              </div>
            </div>
            <button type="button" onClick={() => window.location.href = '/register'} style={styles.btnRegister}>
              Criar minha conta gratuita
            </button>

            {/* Help */}
            <div style={styles.helpText}>
              Precisa de ajuda?{' '}
              <a href="/contato" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Fale com a gente</a>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #B0BEC5; }
      `}</style>
    </>
  );
}