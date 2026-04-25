import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import api from '../services/api';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const pizzaRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (pizzaRef.current) {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new Chart(pizzaRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Cartões', 'Mercado', 'Casa', 'Outros'],
          datasets: [{ data: [62, 16, 9, 13], backgroundColor: ['#EF4444','#60A5FA','#34D399','#94A3B8'], borderWidth: 2, borderColor: 'rgba(30,27,75,.8)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
      });
    }
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* LADO ESQUERDO */}
      <div style={{ background: '#1E1B4B', padding: '40px 44px', display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
          <div style={{ width: 34, height: 34, background: '#93C5FD', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
          </div>
          <span style={{ color: 'white', fontSize: 17, fontWeight: 700 }}>FinanControl</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(129,140,248,.2)', border: '1px solid rgba(129,140,248,.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#93C5FD' }}></div>
            <span style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 500 }}>Gestão de finanças pessoais</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 10 }}>
            Controle suas finanças<br /><span style={{ color: '#A5B4FC' }}>pessoais</span> com clareza
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
            Visão completa de entradas, saídas, metas e muito mais — tudo em um só lugar.
          </div>
        </div>

        {/* Mini cards KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { lbl: 'Entradas', val: 'R$ 7.226', sub: 'Abril 2026', subColor: 'rgba(255,255,255,.45)', bar: '#93C5FD', barW: '80%' },
            { lbl: 'Saldo', val: 'R$ 589', valColor: '#86EFAC', sub: 'Positivo', subColor: '#86EFAC', bar: '#34D399', barW: '55%' },
            { lbl: 'Meta viagem', val: '68%', valColor: '#A5B4FC', sub: 'R$ 1.600 restam', subColor: 'rgba(255,255,255,.45)', bar: '#A5B4FC', barW: '68%' },
            { lbl: 'Saídas', val: 'R$ 6.637', sub: 'Cartões lideram', subColor: '#FCA5A5', bar: '#FCA5A5', barW: '90%' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{c.lbl}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: c.valColor || 'white', marginBottom: 4 }}>{c.val}</div>
              <div style={{ fontSize: 10, color: c.subColor }}>{c.sub}</div>
              <div style={{ height: 2, borderRadius: 1, marginTop: 8, background: c.bar, width: c.barW }}></div>
            </div>
          ))}
        </div>

        {/* Pizza */}
        <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>Gastos por categoria — Abril</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>mês atual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 80, flexShrink: 0 }}>
              <canvas ref={pizzaRef}></canvas>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['#EF4444','Cartões','62%'],['#60A5FA','Mercado','16%'],['#34D399','Casa','9%'],['#94A3B8','Outros','13%']].map(([cor, nome, pct]) => (
                <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: cor, display: 'inline-block' }}></span>{nome}
                  </span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
          {[
            { icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', txt: 'Painel interativo com visão mensal e anual' },
            { icon: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z', txt: 'Metas financeiras com progresso em tempo real' },
            { icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z', txt: 'Importação de planilhas e insights automáticos' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(129,140,248,.15)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#A5B4FC"><path d={f.icon}/></svg>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{f.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DIREITO — formulário */}
      <div style={{ background: 'white', padding: '48px 48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <form onSubmit={handleLogin} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <div style={{ fontSize: 32, fontWeight: 800, color: '#0A0A23', lineHeight: 1.15, marginBottom: 8, letterSpacing: '-.5px' }}>
            Bem-vindo<br />de volta
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.5, marginBottom: 32 }}>
            Insira suas credenciais para acessar<br />suas finanças pessoais.
          </div>

          {/* E-mail */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6, letterSpacing: '.07em', textTransform: 'uppercase' }}>E-mail</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#CBD5E1"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                style={{ width: '100%', padding: '13px 14px 13px 42px', border: '1.5px solid #E8ECF4', borderRadius: 10, fontSize: 14, color: '#0A0A23', fontFamily: 'inherit', outline: 'none', background: '#F8FAFF' }} />
            </div>
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '.07em', textTransform: 'uppercase' }}>Senha</label>
              <span style={{ fontSize: 13, color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Esqueceu a senha?</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#CBD5E1"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </div>
              <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '13px 42px 13px 42px', border: '1.5px solid #E8ECF4', borderRadius: 10, fontSize: 14, color: '#0A0A23', fontFamily: 'inherit', outline: 'none', background: '#F8FAFF' }} />
              <div onClick={() => setShowSenha(!showSenha)} style={{ position: 'absolute', right: 14, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#CBD5E1"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              </div>
            </div>
          </div>

          {/* Lembrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div onClick={() => setLembrar(!lembrar)} style={{ width: 18, height: 18, border: lembrar ? 'none' : '1.5px solid #E2E8F0', borderRadius: 5, background: lembrar ? '#3B82F6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {lembrar && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
            </div>
            <span style={{ fontSize: 13, color: '#64748B' }}>Lembrar neste dispositivo</span>
          </div>

          {/* Erro */}
          {erro && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991B1B', marginBottom: 16 }}>{erro}</div>}

          {/* Botão */}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '15px 20px', background: loading ? '#A5B4FC' : '#3B82F6', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, color: 'white', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading ? 'Entrando...' : 'Entrar na plataforma'}
            {!loading && <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }}></div>
            <span style={{ fontSize: 12, color: '#CBD5E1', whiteSpace: 'nowrap' }}>ou continue com</span>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }}></div>
          </div>

          {/* Social */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" style={{ padding: 12, border: '1.5px solid #E8ECF4', borderRadius: 10, fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" disabled style={{ padding: 12, border: '1.5px solid #E8ECF4', borderRadius: 10, fontSize: 13, color: '#94A3B8', cursor: 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', opacity: 0.5, position: 'relative' }}>
              <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 9, background: '#F1F5F9', color: '#94A3B8', borderRadius: 4, padding: '2px 6px', border: '1px solid #E2E8F0' }}>Em breve</span>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M13 1h10v10H13z"/><path fill="#7FBA00" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
              Microsoft
            </button>
          </div>
        </form>

        {/* Rodapé */}
        <div style={{ paddingTop: 24, borderTop: '1px solid #F8FAFC', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#64748B', marginBottom: 6 }}>
            Ainda não tem conta? <span style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 600 }}>Fale com a gente</span>
          </div>
          <div style={{ fontSize: 11, color: '#CBD5E1' }}>Plataforma privada · acesso mediante convite</div>
        </div>
      </div>
    </div>
  );
}
