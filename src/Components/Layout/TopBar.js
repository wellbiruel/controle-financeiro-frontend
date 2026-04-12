import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

function TopBar() {
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [wideMode, setWideMode] = useState(true);
  const userRef = useRef();
  const notifRef = useRef();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nome = user.nome || user.email || 'Usuário';
  const initials = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
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

              <div className="dd-item" onClick={() => navigate('/configuracoes')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                Minha conta
              </div>
              <div className="dd-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                Redefinir senha
              </div>
              <div className="dd-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/></svg>
                Novidades
                <span className="dd-badge">3</span>
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
  );
}

export default TopBar;