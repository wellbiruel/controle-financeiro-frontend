import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BACKEND_URL = 'https://controle-financeiro-backend-production.up.railway.app';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');
    const erroOauth = params.get('erro');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', decodeURIComponent(user));
      navigate('/dashboard');
    }
    if (erroOauth) {
      setErro(`Falha no login com ${erroOauth}. Tente novamente.`);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setErro('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    wrap: {
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    left: {
      width: '52%', background: '#0D1117',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '40px 48px',
      position: 'relative', overflow: 'hidden',
    },
    leftGlow: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `
        radial-gradient(ellipse 60% 50% at 30% 60%, rgba(59,130,246,.07) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 70% 30%, rgba(16,163,74,.04) 0%, transparent 70%)
      `,
    },
    logo: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },
    logoIcon: {
      width: 32, height: 32, background: '#3B82F6', borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    logoTxt: { color: 'white', fontSize: 15, fontWeight: 500 },
    leftMid: {
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px 0 32px', position: 'relative',
    },
    tag: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.2)',
      borderRadius: 20, padding: '4px 12px', marginBottom: 24, width: 'fit-content',
    },
    tagDot: { width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' },
    tagTxt: { fontSize: 11, color: '#93C5FD', fontWeight: 500 },
    h1: {
      fontSize: 30, fontWeight: 500, color: 'white',
      lineHeight: 1.25, letterSpacing: '-.5px', marginBottom: 14,
    },
    sub: {
      fontSize: 14, color: 'rgba(255,255,255,.45)',
      lineHeight: 1.65, marginBottom: 36, maxWidth: 340,
    },
    bens: { display: 'flex', flexDirection: 'column', gap: 12 },
    ben: { display: 'flex', alignItems: 'flex-start', gap: 12 },
    benTitle: { fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 2 },
    benSub: { fontSize: 11, color: 'rgba(255,255,255,.38)', lineHeight: 1.4 },
    leftFoot: {
      display: 'flex', alignItems: 'center', gap: 14,
      paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.06)',
      position: 'relative',
    },
    avs: { display: 'flex' },
    footTxt: { fontSize: 11, color: 'rgba(255,255,255,.35)' },
    right: {
      width: '48%', background: 'white',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '48px 56px',
    },
    rightH: {
      fontSize: 24, fontWeight: 500, color: '#111827',
      letterSpacing: '-.4px', marginBottom: 6,
    },
    rightSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 32 },
    fieldWrap: { marginBottom: 16 },
    label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 },
    inputWrap: { position: 'relative' },
    inputIco: {
      position: 'absolute', left: 12, top: '50%',
      transform: 'translateY(-50%)', pointerEvents: 'none',
    },
    input: {
      width: '100%', padding: '11px 12px 11px 38px',
      border: '1px solid #E2E8F0', borderRadius: 8,
      fontSize: 13, color: '#111827', outline: 'none',
      fontFamily: 'inherit', background: 'white',
      transition: 'border-color .12s, box-shadow .12s',
      boxSizing: 'border-box',
    },
    inputFocus: { borderColor: '#3B82F6', boxShadow: '0 0 0 3px rgba(59,130,246,.1)' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    lembrar: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', cursor: 'pointer' },
    esqBtn: {
      fontSize: 12, color: '#3B82F6', cursor: 'pointer',
      background: 'none', border: 'none', fontFamily: 'inherit', padding: 0,
    },
    btnCta: {
      width: '100%', padding: '13px', background: '#3B82F6',
      color: 'white', border: 'none', borderRadius: 8,
      fontSize: 14, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'inherit', letterSpacing: '-.1px',
      transition: 'background .12s', marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    seguranca: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 5, fontSize: 11, color: '#CBD5E1', marginBottom: 24,
    },
    divider: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
    divLine: { flex: 1, height: 1, background: '#F1F3F5' },
    divTxt: { fontSize: 11, color: '#D1D5DB', whiteSpace: 'nowrap' },
    socials: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 },
    socBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px', border: '1px solid #E2E8F0', borderRadius: 8,
      fontSize: 12, color: '#374151', cursor: 'pointer',
      background: 'white', fontFamily: 'inherit', transition: 'all .12s',
    },
    footer: { textAlign: 'center', fontSize: 12, color: '#9CA3AF' },
    erro: {
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      color: '#B91C1C', marginBottom: 16,
    },
  };

  const benIcos = [
    {
      bg: 'rgba(59,130,246,.15)', cor: '#3B82F6',
      path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
      title: 'Visão mensal completa',
      sub: 'Entradas, saídas e saldo em um só lugar.',
    },
    {
      bg: 'rgba(16,163,74,.15)', cor: '#16A34A',
      path: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z',
      title: 'Metas inteligentes',
      sub: 'Simule cenários e saiba quando vai atingir cada objetivo.',
    },
    {
      bg: 'rgba(245,158,11,.12)', cor: '#F59E0B',
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
      title: 'Insights automáticos',
      sub: 'O sistema avisa quando algo sai do planejado.',
    },
  ];

  const avsCfg = [
    { txt: 'WA', bg: '#1E3A5F', cor: '#93C5FD' },
    { txt: 'JM', bg: '#1B3A3A', cor: '#6EE7B7' },
    { txt: 'RP', bg: '#3B2A4A', cor: '#C4B5FD' },
    { txt: 'CS', bg: '#2A3020', cor: '#BEF264' },
  ];

  const [focusEmail, setFocusEmail] = useState(false);
  const [focusSenha, setFocusSenha] = useState(false);
  const [hoverGoogle, setHoverGoogle] = useState(false);
  const [hoverMicrosoft, setHoverMicrosoft] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  return (
    <div style={s.wrap}>

      {/* ── ESQUERDA ── */}
      <div style={s.left}>
        <div style={s.leftGlow} />

        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <span style={s.logoTxt}>FinanControl</span>
        </div>

        <div style={s.leftMid}>
          <div style={s.tag}>
            <div style={s.tagDot} />
            <span style={s.tagTxt}>Finanças pessoais para casais</span>
          </div>
          <div style={s.h1}>
            Saiba exatamente<br />
            para onde seu<br />
            <span style={{ color: '#3B82F6' }}>dinheiro está indo.</span>
          </div>
          <div style={s.sub}>
            Controle, planeje e tome decisões financeiras com clareza — sem planilhas confusas.
          </div>
          <div style={s.bens}>
            {benIcos.map((b, i) => (
              <div key={i} style={s.ben}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={b.cor}><path d={b.path} /></svg>
                </div>
                <div>
                  <div style={s.benTitle}>{b.title}</div>
                  <div style={s.benSub}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.leftFoot}>
          <div style={s.avs}>
            {avsCfg.map((av, i) => (
              <div key={i} style={{
                width: 27, height: 27, borderRadius: '50%',
                border: '2px solid #0D1117',
                background: av.bg, color: av.cor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 600,
                marginLeft: i === 0 ? 0 : -7,
              }}>{av.txt}</div>
            ))}
          </div>
          <div style={s.footTxt}>
            <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>Acesso por convite</span> — plataforma privada
          </div>
        </div>
      </div>

      {/* ── DIREITA ── */}
      <div style={s.right}>
        <div style={s.rightH}>Bem-vindo de volta</div>
        <div style={s.rightSub}>Entre para acessar seu painel financeiro</div>

        {erro && <div style={s.erro}>{erro}</div>}

        <form onSubmit={handleLogin}>
          <div style={s.fieldWrap}>
            <label style={s.label}>E-mail</label>
            <div style={s.inputWrap}>
              <div style={s.inputIco}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#CBD5E1">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <input
                type="email" placeholder="seu@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                style={{ ...s.input, ...(focusEmail ? s.inputFocus : {}) }}
              />
            </div>
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Senha</label>
            <div style={s.inputWrap}>
              <div style={s.inputIco}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#CBD5E1">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <input
                type={senhaVisivel ? 'text' : 'password'}
                placeholder="••••••••" value={senha}
                onChange={e => setSenha(e.target.value)}
                onFocus={() => setFocusSenha(true)}
                onBlur={() => setFocusSenha(false)}
                style={{ ...s.input, paddingRight: 40, ...(focusSenha ? s.inputFocus : {}) }}
              />
              <button type="button" onClick={() => setSenhaVisivel(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#CBD5E1' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  {senhaVisivel
                    ? <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    : <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  }
                </svg>
              </button>
            </div>
          </div>

          <div style={s.row}>
            <label style={s.lembrar}>
              <input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} style={{ accentColor: '#3B82F6', width: 13, height: 13 }} />
              Lembrar de mim
            </label>
            <button type="button" style={s.esqBtn}>Esqueci a senha</button>
          </div>

          <button type="submit"
            style={{ ...s.btnCta, background: hoverBtn ? '#2563EB' : '#3B82F6', opacity: loading ? .8 : 1 }}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar e ver meu saldo →'}
          </button>
        </form>

        <div style={s.seguranca}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#CBD5E1">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          Seus dados são protegidos com criptografia
        </div>

        <div style={s.divider}>
          <div style={s.divLine} />
          <span style={s.divTxt}>ou continue com</span>
          <div style={s.divLine} />
        </div>

        <div style={s.socials}>
          <button type="button" disabled style={{ ...s.socBtn, opacity: 0.5, cursor: 'not-allowed' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
            <span style={{ fontSize: 9, background: '#F1F3F5', color: '#9CA3AF', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>Em breve</span>
          </button>
          <button type="button" disabled style={{ ...s.socBtn, opacity: 0.5, cursor: 'not-allowed' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0078D4">
              <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
            </svg>
            Microsoft
            <span style={{ fontSize: 9, background: '#F1F3F5', color: '#9CA3AF', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>Em breve</span>
          </button>
        </div>

        <div style={s.footer}>
          Ainda não tem conta?{' '}
          <a href="mailto:wellbiruel@gmail.com" style={{ color: '#3B82F6', textDecoration: 'none' }}>Fale com a gente</a>
        </div>
      </div>
    </div>
  );
}
