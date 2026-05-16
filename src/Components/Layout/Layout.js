import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

const WIDTH_KEY = 'financontrol_width_mode';

export default function Layout({ children }) {
  const [expanded,  setExpanded]  = useState(true);
  const [widthMode, setWidthMode] = useState(
    () => localStorage.getItem(WIDTH_KEY) || 'confortavel'
  );

  const toggleWidth = () => {
    setWidthMode(m => {
      const next = m === 'confortavel' ? 'total' : 'confortavel';
      localStorage.setItem(WIDTH_KEY, next);
      return next;
    });
  };

  return (
    <div className="app-layout">
      <Sidebar expanded={expanded} onToggleExpand={() => setExpanded(v => !v)} />
      <div className="app-body">
        <TopBar widthMode={widthMode} onToggleWidth={toggleWidth} />
        <main className="app-content">
          <div style={{
            maxWidth:   widthMode === 'confortavel' ? '1400px' : '100%',
            margin:     '0 auto',
            transition: 'max-width 0.3s ease',
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
