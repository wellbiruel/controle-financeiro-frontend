import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const NOTIFICACOES = [
  { cor: '#EF4444', txt: 'Teto em 94% — faltam R$ 363 para o limite mensal.', tempo: 'Há 2 horas' },
  { cor: '#F59E0B', txt: 'Reserva abaixo do recomendado — apenas 1,8 meses cobertos.', tempo: 'Hoje, 09:14' },
  { cor: '#16A34A', txt: 'Abril foi seu melhor mês do ano! Saldo positivo de R$ 589.', tempo: 'Ontem' },
];

function IcoSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );
}

function IcoBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  );
}

function IcoUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}
function IcoLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );
}
function IcoNot() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
    </svg>
  );
}
function IcoLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  );
}

function IcoCaret() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#9CA3AF">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  );
}

export default function TopBar() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const nomeExibido  = user.nome  || 'Well e Amanda';
  const emailExibido = user.email || 'wellbiruel@gmail.com';

  return (
    <header className="topbar">

      {/* Busca */}
      <div className="tb-search">
        <IcoSearch />
        <input placeholder="Buscar transações, páginas..." />
      </div>

      <div className="tb-right">

        {/* Notificações */}
        <div className="tb-ico-wrap" ref={notifRef}>
          <button className="tb-ico-btn" onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}>
            <IcoBell />
            <div className="tb-badge" />
          </button>

          {notifOpen && (
            <div className="dd-notif">
              <div className="dd-head">
                <span className="dd-title">Notificações</span>
                <span className="dd-action">Marcar lidas</span>
              </div>
              {NOTIFICACOES.map((n, i) => (
                <div key={i} className="dd-notif-item">
                  <div className="dd-dot" style={{ background: n.cor }} />
                  <div>
                    <div className="dd-notif-txt">{n.txt}</div>
                    <div className="dd-notif-time">{n.tempo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tb-div" />

        {/* Usuário */}
        <div className="tb-user-wrap" ref={userRef}>
          <button className="tb-user" onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}>
            <div className="tb-av">{nomeExibido.slice(0,2).toUpperCase()}</div>
            <span className="tb-name">{nomeExibido}</span>
            <IcoCaret />
          </button>

          {userOpen && (
            <div className="dd-user">
              <div className="dd-user-head">
                <div className="dd-user-name">{nomeExibido}</div>
                <div className="dd-user-email">{emailExibido}</div>
              </div>
              <div className="dd-user-body">
                <div className="dd-user-item" onClick={() => { navigate('/configuracoes'); setUserOpen(false); }}>
                  <IcoUser /> Minha conta
                </div>
                <div className="dd-user-item" onClick={() => { navigate('/configuracoes'); setUserOpen(false); }}>
                  <IcoLock /> Segurança
                </div>
                <div className="dd-user-item" onClick={() => { navigate('/configuracoes'); setUserOpen(false); }}>
                  <IcoNot /> Notificações
                </div>
                <div className="dd-sep" />
                <div className="dd-user-item danger" onClick={handleLogout}>
                  <IcoLogout /> Sair
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
