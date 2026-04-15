import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  entradas: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
    </svg>
  ),
  saidas: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
    </svg>
  ),
  cartao: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  ),
  fluxo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
    </svg>
  ),
  metas: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5S9.51 16.5 12 16.5s4.5-2.01 4.5-4.5S14.49 7.5 12 7.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    </svg>
  ),
  relatorios: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
  importar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  ),
  configuracoes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ),
};

const navGroups = [
  {
    group: 'Principal',
    items: [
      { to: '/dashboard', label: 'Painel',    icon: icons.dashboard },
      { to: '/entradas',  label: 'Entradas',  icon: icons.entradas  },
      { to: '/saidas',    label: 'Saídas',    icon: icons.saidas    },
      { to: '/cartao',    label: 'Cartões',   icon: icons.cartao    },
    ],
  },
  {
    group: 'Planejamento',
    items: [
      { to: '/fluxo', label: 'Fluxo Anual', icon: icons.fluxo },
      { to: '/metas', label: 'Metas',       icon: icons.metas, badge: 'Novo' },
    ],
  },
  {
    group: 'Análise',
    items: [
      { to: '/relatorios', label: 'Relatórios',    icon: icons.relatorios },
      { to: '/importar',   label: 'Importar Dados', icon: icons.importar  },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { to: '/configuracoes', label: 'Configurações', icon: icons.configuracoes },
    ],
  },
];

function Sidebar({ expanded, onToggleExpand }) {
  const [hovered, setHovered] = useState(false);
  const isOpen = expanded || hovered;

  return (
    <aside
      className={`sidebar ${isOpen ? 'expanded' : ''}`}
      onMouseEnter={() => { if (!expanded) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="sidebar-inner">

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.group} className="sb-section">
              <div className="sb-group-label">{group.group}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
                  data-tip={item.label}
                >
                  <span className="sb-icon">{item.icon}</span>
                  <span className="sb-text">{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="sb-item sb-footer-item"
            onClick={onToggleExpand}
            data-tip={expanded ? 'Recolher menu' : 'Expandir menu'}
          >
            <span className={`sb-icon sb-expand-icon ${expanded ? 'rotated' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <span className="sb-text">{expanded ? 'Recolher menu' : 'Expandir menu'}</span>
          </div>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
