import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

export default function Layout({ children }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="app-layout">
      <Sidebar expanded={expanded} onToggleExpand={() => setExpanded(v => !v)} />
      <div className="app-body">
        <TopBar />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
