import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TopBar.css';

const NOVIDADES = [
  { icon: '🎯', title: 'Página Metas criada', desc: 'Gerencie suas metas financeiras com acompanhamento de progresso.' },
  { icon: '📊', title: 'Importação de planilhas', desc: 'Importe lançamentos via CSV/Excel diretamente no sistema.' },
  { icon: '📈', title: 'Dashboard com gráficos', desc: 'Visualize receitas, despesas e saldo com gráficos interativos.' },
  { icon: '🎨', title: 'Tema Índigo Profundo', desc: 'Novo visual moderno com paleta índigo em toda a interface.' },
];

function ModalPortal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

function TopBar() {
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [wideMode, setWideMode] = useState(() => localStorage.getItem('wideMode') === 'true');
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [showNovidades, setShowNovidades] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const [senhaSucesso, setSenhaSucesso] = useState('');
  const [senhaLoading, setSenhaLoading] = useState(false);
  const userRef = useRef();
  const notifRef = useRef();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nome = user.nome || user.email || 'Usuário';
  const initials = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Apply dark-mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Apply wide-mode class
  useEffect(() => {
    if (wideMode) {
      document.body.classList.add('wide-mode');
    } else {
      document.body.classList.remove('wide-mode');
    }
    localStorage.setItem('wideMode', wideMode);
  }, [wideMode]);

  const closeAll = () => { setShowUser(false); setShowNotif(false); };

  const handleLogout = () => {
    closeAll();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangeSenha = async (e) => {
    e.preventDefault();
    setSenhaErro('');
    setSenhaSucesso('');
    if (novaSenha !== confirmSenha) {
      setSenhaErro('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSenhaLoading(true);
    try {
      await api.put('/auth/senha', { senhaAtual, novaSenha });
      setSenhaSucesso('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmSenha('');
    } catch (err) {
      setSenhaErro(err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setSenhaLoading(false);
    }
  };

  const closeSenhaModal = () => {
    setShowSenhaModal(false);
    setSenhaErro(''); setSenhaSucesso('');
    setSenhaAtual(''); setNovaSenha(''); setConfirmSenha('');
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginTop: 4,
  };

  const labelStyle = { fontSize: 12, color: '#64748B', fontWeight: 500, display: 'block', marginTop: 12 };

  return (
    <>
      <header className="topbar">
        <span className="tb-logo">FinanControl</span>
        <div className="tb-divider" />

        <div className="tb-search">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input placeholder="Buscar transações, páginas..." />
        </div>

        <div className="tb-right">

          {/* Notificações */}
          <div className="tb-icon-btn" ref={notifRef} onClick={() => { setShowNotif(v => !v); setShowUser(false); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            <span className="tb-badge">3</span>
            {showNotif && (
              <div className="tb-dropdown notif-dd">
                <div className="dd-header">
                  <span className="dd-title">Notificações</span>
                  <span className="dd-action">marcar todas lidas</span>
                </div>
                {[
                  { txt: 'Cartões subiram +22% em Abril vs Março', time: 'há 2 horas', color: '#F59E0B', unread: true },
                  { txt: 'Saldo de Fevereiro ficou negativo — R$ -837', time: 'há 1 dia', color: '#EF4444', unread: true },
                  { txt: 'Lançamento de Março adicionado', time: 'há 3 dias', color: '#E2E8F0', unread: false },
                ].map((n, i) => (
                  <div key={i} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notif-dot" style={{ background: n.color }}></div>
                    <div>
                      <div className="notif-txt">{n.txt}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tb-divider" />

          {/* Usuário */}
          <div className="tb-user" ref={userRef} onClick={() => { setShowUser(v => !v); setShowNotif(false); }}>
            <div className="tb-avatar">{initials}</div>
            <span className="tb-name">{nome}</span>
            <span className="tb-arr">▾</span>

            {showUser && (
              <div className="tb-dropdown user-dd">
                <div className="dd-header">
                  <div className="dd-title">{nome}</div>
                  <div className="dd-sub">{user.email || ''}</div>
                </div>

                <div className="dd-item" onClick={(e) => { e.stopPropagation(); closeAll(); navigate('/configuracoes'); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  Minha conta
                </div>

                <div className="dd-item" onClick={(e) => { e.stopPropagation(); closeAll(); setShowSenhaModal(true); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  Redefinir senha
                </div>

                <div className="dd-item" onClick={(e) => { e.stopPropagation(); closeAll(); setShowNovidades(true); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/></svg>
                  Novidades
                  <span className="dd-badge">4</span>
                </div>

                <div className="dd-sep" />

                <div className="dd-toggle" onClick={(e) => { e.stopPropagation(); setDarkMode(v => !v); }}>
                  <span className="dd-toggle-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#9E9E9E"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                    Modo escuro
                  </span>
                  <div className={`dd-sw ${darkMode ? 'on' : ''}`} />
                </div>

                <div className="dd-toggle" onClick={(e) => { e.stopPropagation(); setWideMode(v => !v); }}>
                  <span className="dd-toggle-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#9E9E9E"><path d="M3 5v14h18V5H3zm16 12H5V7h14v10z"/></svg>
                    Largura total
                  </span>
                  <div className={`dd-sw ${wideMode ? 'on' : ''}`} />
                </div>

                <div className="dd-sep" />

                <div className="dd-item danger" onClick={handleLogout}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                  Sair
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal: Redefinir Senha */}
      {showSenhaModal && (
        <ModalPortal>
          <div
            onClick={closeSenhaModal}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, minHeight: '100vh',
              background: 'rgba(15,23,42,0.45)', zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 12, width: 360, padding: '28px 28px 24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Redefinir senha</span>
                <button onClick={closeSenhaModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 4px' }}>Preencha os campos abaixo para alterar sua senha.</p>

              <form onSubmit={handleChangeSenha}>
                <label style={labelStyle}>Senha atual</label>
                <input
                  type="password" value={senhaAtual} required
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  style={inputStyle} placeholder="••••••••"
                />
                <label style={labelStyle}>Nova senha</label>
                <input
                  type="password" value={novaSenha} required
                  onChange={(e) => setNovaSenha(e.target.value)}
                  style={inputStyle} placeholder="Mínimo 6 caracteres"
                />
                <label style={labelStyle}>Confirmar nova senha</label>
                <input
                  type="password" value={confirmSenha} required
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  style={inputStyle} placeholder="Repita a nova senha"
                />

                {senhaErro && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: '#FEF2F2', borderRadius: 6, color: '#EF4444', fontSize: 12 }}>
                    {senhaErro}
                  </div>
                )}
                {senhaSucesso && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: '#F0FDF4', borderRadius: 6, color: '#16A34A', fontSize: 12 }}>
                    {senhaSucesso}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button
                    type="button" onClick={closeSenhaModal}
                    style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: 13, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={senhaLoading}
                    style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', background: '#6366F1', color: '#fff', fontSize: 13, fontWeight: 600, cursor: senhaLoading ? 'not-allowed' : 'pointer', opacity: senhaLoading ? 0.7 : 1 }}
                  >
                    {senhaLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Painel lateral: Novidades */}
      {showNovidades && (
        <ModalPortal>
          <div
            onClick={() => setShowNovidades(false)}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, minHeight: '100vh',
              background: 'rgba(15,23,42,0.35)', zIndex: 9000,
              display: 'flex', justifyContent: 'flex-end',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 340, background: '#fff', height: '100vh', overflowY: 'auto',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Novidades</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Últimas atualizações do sistema</div>
                </div>
                <button onClick={() => setShowNovidades(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>

              {/* Lista */}
              <div style={{ flex: 1, padding: '12px 0' }}>
                {NOVIDADES.map((item, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center' }}>FinanControl v2.0 — Abril 2026</div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

export default TopBar;
