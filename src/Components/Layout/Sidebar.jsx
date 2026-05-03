import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const MENU = [
  {
    grupo: 'Principal',
    itens: [
      { label: 'Painel',   path: '/dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
      { label: 'Entradas', path: '/entradas',  icon: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z' },
      { label: 'Saidas',   path: '/saidas',    icon: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z' },
      {
        label: 'Compromissos', path: '/compromissos',
        icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
        sub: [
          { label: 'Cartoes',     path: '/cartoes',     icon: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z' },
          { label: 'Parcelas',    path: '/parcelas',    icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z' },
          { label: 'Assinaturas', path: '/assinaturas', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' },
          { label: 'Dividas',     path: '/dividas',     icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
        ],
      },
    ],
  },
  {
    grupo: 'Planejamento',
    itens: [
      { label: 'Visao Anual', path: '/fluxo-anual', icon: 'M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z' },
      { label: 'Metas',       path: '/metas',       icon: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z' },
      { label: 'Reserva',     path: '/reserva',     icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' },
    ],
  },
  {
    grupo: 'Analise',
    itens: [
      { label: 'Relatorios',       path: '/relatorios', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
      { label: 'Radar Financeiro', path: '/radar',      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
    ],
  },
  {
    grupo: 'Ferramentas',
    itens: [
      { label: 'Importar Dados', path: '/importacao', icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' },
      { label: 'Simulacoes',     path: '/simulacoes',  icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' },
    ],
  },
];

const SISTEMA = {
  label: 'Configuracoes', path: '/configuracoes',
  icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
};

function SbIcon({ path }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}

export default function Sidebar({ expanded, onToggleExpand }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [openSub, setOpenSub] = useState({});
  const isActive  = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const toggleSub = (label) => setOpenSub(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>

      <div className="sb-logo">
        <div className="sb-logo-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
        <span className="sb-label">FinanControl</span>
      </div>

      <nav className="sb-nav">
        {MENU.map((grupo, gi) => (
          <div key={gi} className="sb-group">
            {gi > 0 && <div className="sb-sep" />}
            <div className="sb-grp-lbl">{grupo.grupo}</div>
            {grupo.itens.map((item) => {
              const active = isActive(item.path);
              const hasSub = item.sub && item.sub.length > 0;
              const subOpen = openSub[item.label];
              return (
                <div key={item.path}>
                  <div
                    className={`sb-item ${active ? 'active' : ''}`}
                    onClick={() => hasSub ? toggleSub(item.label) : navigate(item.path)}
                    title={!expanded ? item.label : undefined}
                  >
                    {active && <div className="sb-active-bar" />}
                    <SbIcon path={item.icon} />
                    <span className="sb-label">{item.label}</span>
                    {hasSub && expanded && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
                        style={{ marginLeft: 'auto', opacity: .5, transform: subOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    )}
                    {!expanded && <div className="sb-tooltip">{item.label}</div>}
                  </div>
                  {hasSub && subOpen && expanded && (
                    <div style={{ paddingLeft: 8 }}>
                      {item.sub.map(s => {
                        const sa = isActive(s.path);
                        return (
                          <div key={s.path}
                            className={`sb-item ${sa ? 'active' : ''}`}
                            style={{ paddingLeft: 24, fontSize: 12 }}
                            onClick={() => navigate(s.path)}>
                            {sa && <div className="sb-active-bar" />}
                            <SbIcon path={s.icon} />
                            <span className="sb-label">{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div className="sb-sep" />

        <div className="sb-item" onClick={() => navigate(SISTEMA.path)} title={!expanded ? SISTEMA.label : undefined}>
          {isActive(SISTEMA.path) && <div className="sb-active-bar" />}
          <SbIcon path={SISTEMA.icon} />
          <span className="sb-label">{SISTEMA.label}</span>
          {!expanded && <div className="sb-tooltip">{SISTEMA.label}</div>}
        </div>
      </nav>

      <div className="sb-footer">
        <div className="sb-toggle-btn" onClick={onToggleExpand}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
            style={{ flexShrink: 0, transition: 'transform .25s', transform: expanded ? '' : 'rotate(180deg)' }}>
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
          <span className="sb-label">Recolher menu</span>
        </div>
      </div>
    </aside>
  );
}
