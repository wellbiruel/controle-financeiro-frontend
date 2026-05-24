import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ── 
const fmt  = v => 'R$ ' + Math.round(Math.abs(v ?? 0)).toLocaleString('pt-BR');
const fmtS = v => (v >= 0 ? '+' : '-') + 'R$ ' + Math.abs(Math.round(v ?? 0)).toLocaleString('pt-BR');
const fmtP = v => { const n = v ?? 0; return (Number.isInteger(n) || n % 1 === 0 ? Math.round(n) : n.toFixed(1)) + '%'; };

const MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_F     = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const STATUS_COR = {
  ok:      { bg: '#DCFCE7', txt: '#15803D' },
  atencao: { bg: '#FEF3C7', txt: '#92400E' },
  critico: { bg: '#FEE2E2', txt: '#991B1B' },
};

function scoreStatus(s) {
  if (s >= 90) return 'ok';
  if (s >= 55) return 'atencao';
  return 'critico';
}
function scoreLabel(s) {
  if (s >= 90) return 'Excelente';
  if (s >= 75) return 'Saudável';
  if (s >= 55) return 'Atenção';
  return 'Crítico';
}

// ── 
const Ico = {
  info:    <svg width="13" height="13" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
  up:      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>,
  down:    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>,
  check:   <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  warn:    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
  cal:     <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>,
  caret:   <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280"><path d="M7 10l5 5 5-5z"/></svg>,
  dots:    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.4)"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>,
  left:    <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>,
  right:   <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.59z"/></svg>,
  gear:    <svg width="11" height="11" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
};

// ── 
const S = {
  page:    { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh' },
  card:    { background: 'white', borderRadius: 10, border: '0.5px solid #E5E7EB', padding: '14px 16px' },
  cardLink:{ fontSize: 12, color: '#9CA3AF', cursor: 'pointer', marginTop: 'auto', display: 'block' },
  bar:     (w, bg) => ({ height: '100%', width: `${Math.min(Math.max(isFinite(w) ? w : 0, 0), 100)}%`, background: bg, borderRadius: 2 }),
  track:   (bg='#F1F5F9') => ({ height: 4, background: bg, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }),
  pill:    (bg, txt) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: txt }),
  badge:   (bg, txt) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: bg, color: txt }),
};

// ── 
function ProgressBar({ pct, color, trackColor }) {
  return (
    <div style={S.track(trackColor)}>
      <div style={S.bar(pct, color)} />
    </div>
  );
}

function Trend({ val, suffix = '', reverse = false }) {
  if (val == null) return null;
  if (val === 0) return (
    <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
      — {suffix ? `0${suffix}` : ''}
    </div>
  );
  const pos = reverse ? val < 0 : val >= 0;
  const cor = pos ? '#16A34A' : '#EF4444';
  return (
    <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
      <span style={{ color: cor }}>{pos ? Ico.up : Ico.down}</span>
      {val > 0 ? '+' : ''}{val}{suffix}
    </div>
  );
}

function KpiCard({ accentColor, icon, label, value, valueColor, sub, trend, trendSuffix, trendReverse, children, style }) {
  return (
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden', minHeight: 0, ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '10px 10px 0 0' }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px', color: valueColor || '#111827', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>{sub}</div>
      {trend != null && <Trend val={trend} suffix={trendSuffix} reverse={trendReverse} />}
      {children}
    </div>
  );
}

// ──
function Tooltip({ children, text, direction = 'up' }) {
  const [show, setShow] = useState(false);
  const isUp = direction === 'up';
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          ...(isUp ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(17, 24, 39, 0.92)',
          color: 'rgba(255,255,255,.88)',
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 1.55,
          padding: '7px 10px',
          borderRadius: 7,
          whiteSpace: 'normal',
          width: 180,
          zIndex: 999,
          textAlign: 'center',
          pointerEvents: 'none',
          textTransform: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute',
            ...(isUp
              ? { top: '100%', borderTop: '5px solid rgba(17,24,39,0.92)', borderBottom: 'none' }
              : { bottom: '100%', borderBottom: '5px solid rgba(17,24,39,0.92)', borderTop: 'none' }),
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
          }} />
        </div>
      )}
    </div>
  );
}

// ──
const PRIORIDADES_PMA = [
  { chave: 'reserva',   btn: 'Ver reserva' },
  { chave: 'teto',      btn: 'Ver planejamento' },
  { chave: 'maiorGasto',btn: 'Ver cartões' },
  { chave: 'meta',      btn: 'Ver metas' },
  { chave: 'poupanca',  btn: 'Ver planejamento' },
];

const ROTAS_PMA = {
  'Ver reserva': '/reserva',
  'Ver planejamento': '/fluxo-anual',
  'Ver cartões': '/cartoes',
  'Ver metas': '/metas',
  'Ver detalhes': '/dashboard',
};

function PMA({ acaoAgora }) {
  const navigate = useNavigate();
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);
  const paused          = useRef(false);

  const msgs = Array.isArray(acaoAgora) ? acaoAgora : (acaoAgora ? [acaoAgora] : []);
  const total = msgs.length;

  const trans = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 300);
  }, []);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => { if (!paused.current) trans((idx + 1) % total); }, 10000);
    return () => clearInterval(t);
  }, [idx, total, trans]);

  if (!total) return null;
  const m = msgs[idx];

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111827', borderRadius: 9, padding: '10px 16px', marginBottom: 12 }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>Ação agora</span>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'white', flex: 1, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(-5px)', transition: 'opacity .3s, transform .3s' }}>
        {typeof m === 'string' ? m : m.txt}
      </span>
      <span style={{ fontSize: 12, color: '#93C5FD', cursor: 'pointer', whiteSpace: 'nowrap' }}
        onClick={() => { const btn = typeof m === 'object' ? m.btn : 'Ver detalhes'; navigate(ROTAS_PMA[btn] || '/dashboard'); }}>
        {typeof m === 'object' ? m.btn : 'Ver detalhes'} →
      </span>
      {total > 1 && (
        <div style={{ display: 'flex', gap: 4 }}>
          {msgs.map((_, i) => (
            <div key={i} onClick={() => trans(i)} style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.25)', cursor: 'pointer' }} />
          ))}
        </div>
      )}
      <span style={{ cursor: 'pointer', marginLeft: 4 }}>{Ico.dots}</span>
    </div>
  );
}

// ──
function GraficoSaldo({ meses, style }) {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  if (!meses?.length) meses = [];

  const comDados  = meses.filter(m => m != null && m.saldo != null);
  const positivos = comDados.filter(m => m.saldo >= 0).length;
  const negativos = comDados.filter(m => m.saldo < 0).length;
  const semDados  = 12 - comDados.length;
  const acum      = comDados.reduce((s, m) => s + (m.saldo || 0), 0);
  const absMax    = Math.max(...comDados.map(m => Math.abs(m.saldo || 0)), 1);
  const maxH      = 100;

  const dadosPorMes = MESES_ABREV.map((label, i) => {
    const found = meses.find(m => m != null && m.mes === i + 1);
    return { label, ...found };
  });

  const toggleFiltro = (tipo) => setFiltro(f => f === tipo ? 'todos' : tipo);

  const pills = [
    { tipo: 'positivos', baseBg: '#F0FDF4', ativoBg: '#D1FAE5', txt: '#15803D', dotBg: '#86EFAC', border: '#16A34A', label: `${positivos} positivos` },
    { tipo: 'negativos', baseBg: '#FEF2F2', ativoBg: '#FEE2E2', txt: '#991B1B', dotBg: '#FCA5A5', border: '#EF4444', label: `${negativos} negativo` },
    { tipo: 'semDados',  baseBg: '#F7F8FA', ativoBg: '#F3F4F6', txt: '#6B7280', dotBg: '#D1D5DB', border: '#9CA3AF', label: `${semDados} sem dados` },
  ];

  return (
    <div style={{ ...S.card, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Análise mensal</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>Saldo por mês · 2026</div>
        <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver fluxo →</span>
      </div>
      <div style={{ marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        {pills.map(p => {
          const ativo = filtro === p.tipo;
          return (
            <div key={p.tipo}
              onClick={() => toggleFiltro(p.tipo)}
              style={{ ...S.pill(ativo ? p.ativoBg : p.baseBg, p.txt), cursor: 'pointer', border: `1.5px solid ${ativo ? p.border : 'transparent'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.dotBg }} />
              {p.label}
            </div>
          );
        })}
      </div>

      <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 22, position: 'relative', marginBottom: 6 }}>
        {dadosPorMes.map((m, i) => {
          const fut = m.saldo == null;
          const pos = !fut && m.saldo >= 0;
          const grayed = filtro !== 'todos' && (
            filtro === 'semDados' ? !fut :
            !fut && ((filtro === 'positivos' && !pos) || (filtro === 'negativos' && pos))
          );
          const cor  = fut ? '#F1F5F9' : grayed ? '#E5E7EB' : pos ? '#86EFAC' : '#EF4444';
          const corV = fut ? '#D1D5DB' : grayed ? '#D1D5DB' : pos ? '#16A34A' : '#EF4444';
          const h = fut ? 3 : Math.max(3, Math.round(Math.abs(m.saldo) / absMax * maxH));
          const valTxt = fut ? '' : (pos ? '+' : '-') + 'R$ ' + Math.abs(Math.round(m.saldo)).toLocaleString('pt-BR');
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: fut ? 'default' : 'pointer', position: 'relative' }}
              onMouseEnter={e => { if (!fut) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ x: r.left + r.width/2, y: r.top - 38, m: m.label, val: m.saldo, pos }); }}}
              onMouseLeave={() => setTooltip(null)}>
              <div style={{ fontSize: 9, fontWeight: 700, position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: corV }}>{valTxt}</div>
              <div style={{ width: '100%', height: h, background: cor, borderRadius: '4px 4px 0 0', minHeight: 3 }} />
              <div style={{ fontSize: 10, color: fut ? '#D1D5DB' : '#9CA3AF' }}>{m.label}</div>
            </div>
          );
        })}
        {tooltip && (
          <div style={{ position: 'fixed', background: '#111827', color: 'white', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 200, left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}>
            {tooltip.m}: <span style={{ color: tooltip.pos ? '#86EFAC' : '#FCA5A5' }}>{tooltip.pos ? '+' : '-'}R$ {Math.abs(Math.round(tooltip.val)).toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>

      <div style={{ height: '0.5px', background: '#F3F4F6', margin: '8px 0' }} />

      {/* Mini cards: Desempenho do ano + Meta anual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        {/* Desempenho do ano */}
        <div style={{ background: acum >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={acum >= 0 ? '#16A34A' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.04em' }}>Desempenho do ano</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>Acumulado 2026</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: acum >= 0 ? '#16A34A' : '#EF4444', lineHeight: 1 }}>{fmtS(acum)}</div>
        </div>

        {/* Meta anual */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.04em' }}>Meta anual</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>R$ 24.000</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(Math.max((acum / 24000) * 100, 0), 100)}%`, height: '100%', background: '#2563EB', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', whiteSpace: 'nowrap' }}>{Math.round(Math.max((acum / 24000) * 100, 0))}% da meta</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──
const COR_RADAR = { alert: { borda: '#FECACA', bg: '#FEF2F2', txt: '#EF4444' }, ok: { borda: '#BBF7D0', bg: '#F0FDF4', txt: '#16A34A' }, warn: { borda: '#FDE68A', bg: '#FFFBEB', txt: '#D97706' }, info: { borda: '#BFDBFE', bg: '#EFF6FF', txt: '#3B82F6' } };
const ROTAS_RADAR = { 'Ver insights': '/radar', 'Ver metas': '/metas', 'Ver fluxo': '/fluxo-anual', 'Ajustar': '/reserva' };

function RadarFinanceiro({ insights = [] }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [timer, setTimer] = useState(10);
  const paused = useRef(false);
  const total = Math.ceil(insights.length / 2);

  const trans = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); setTimer(10); }, 400);
  }, []);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => {
      if (!paused.current) {
        setTimer(prev => {
          if (prev <= 1) { trans((idx + 1) % total); return 10; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [idx, total, trans]);

  const i1 = insights[idx * 2];
  const i2 = insights[idx * 2 + 1];

  return (
    <div style={{ ...S.card }} onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Insights</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        Radar financeiro <Tooltip text="Insights automáticos baseados nos seus dados financeiros do período.">{Ico.info}</Tooltip>
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Alertas e oportunidades identificados no período</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity .4s, transform .4s' }}>
        {[i1, i2].filter(Boolean).map((ins, i) => {
          const c = COR_RADAR[ins.tipo] || COR_RADAR.info;
          return (
            <div key={i} style={{ padding: '10px 11px', borderRadius: 8, border: `0.5px solid ${c.borda}`, background: c.bg }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: c.txt, marginBottom: 4 }}>{ins.cat}</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.45, marginBottom: 4 }}>{ins.txt}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', cursor: 'pointer' }} onClick={() => navigate(ROTAS_RADAR[ins.cta] || '/dashboard')}>{ins.cta} →</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span onClick={() => trans((idx - 1 + total) % total)} style={{ cursor: 'pointer' }}>{Ico.left}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} onClick={() => trans(i)} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#3B82F6' : '#E9ECEF', cursor: 'pointer', transition: 'background .2s' }} />
            ))}
          </div>
          <span onClick={() => trans((idx + 1) % total)} style={{ cursor: 'pointer' }}>{Ico.right}</span>
        </div>
        <div style={{ fontSize: 11, color: '#D1D5DB' }}>{paused.current ? 'pausado' : `próximo em ${timer}s`}</div>
      </div>
    </div>
  );
}

// ── 
function ScoreGauge({ score }) {
  const navigate = useNavigate();
  const s = score || 0;
  const cor = s >= 75 ? '#16A34A' : s >= 55 ? '#F59E0B' : '#EF4444';
  const st = scoreStatus(s);
  const sc = STATUS_COR[st];
  const arc = Math.round((s / 100) * 126);
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, width: '100%', textAlign: 'left' }}>Saúde geral</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>Score financeiro <Tooltip text="Score calculado com base em saldo, poupança, teto, reserva e metas.">{Ico.info}</Tooltip></div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6, width: '100%', textAlign: 'left' }}>Pontuação baseada em 5 indicadores</div>
      <svg width="100" height="56" viewBox="0 0 100 56" style={{ marginBottom: 4 }}>
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round"/>
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={cor} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${arc} 126`} strokeDashoffset="0"/>
        <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{s}</text>
      </svg>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 7 }}>de 100</div>
      <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: sc.bg, color: sc.txt, marginBottom: 10 }}>{scoreLabel(s)}</div>
      <div style={{ textAlign: 'left', width: '100%' }}>
        {[
          { ok: s >= 55,  txt: 'Saldo positivo' },
          { ok: s >= 68,  txt: 'Melhor mês do ano' },
          { ok: false,    txt: 'Teto em 94%' },
          { ok: false,    txt: 'Reserva crítica' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: item.ok ? '#16A34A' : '#EF4444', marginBottom: 5 }}>
            <span style={{ color: 'inherit' }}>{item.ok ? Ico.check : Ico.warn}</span>{item.txt}
          </div>
        ))}
      </div>
      <span style={S.cardLink} onClick={() => navigate('/relatorios')}>Entenda seu score →</span>
    </div>
  );
}

// ──
function PeriodSelector({ mes, ano, onChange }) {
  const [open, setOpen] = useState(false);
  const [tmpMes, setTmpMes] = useState(mes);
  const [tmpAno, setTmpAno] = useState(ano);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const aplicar = () => { onChange(tmpMes, tmpAno); setOpen(false); };
  const ANOS = [ano - 1, ano, ano + 1];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'white', border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
        {Ico.cal} Período: {MESES_F[mes - 1]} {ano} {Ico.caret}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid #E9ECEF', borderRadius: 10, padding: 14, width: 260, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            {ANOS.map(a => (
              <div key={a} onClick={() => setTmpAno(a)}
                style={{ padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: tmpAno === a ? '#3B82F6' : '#F3F4F6', color: tmpAno === a ? 'white' : '#374151' }}>
                {a}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10 }}>
            {MESES_ABREV.map((m, i) => (
              <div key={i} onClick={() => setTmpMes(i + 1)}
                style={{ padding: '5px 0', textAlign: 'center', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: tmpMes === i + 1 ? '#3B82F6' : 'transparent', color: tmpMes === i + 1 ? 'white' : '#374151' }}>
                {m}
              </div>
            ))}
          </div>
          <button onClick={aplicar} style={{ width: '100%', padding: '8px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}

// ── 
function Skeleton({ h = 120 }) {
  return <div style={{ height: h, background: '#F1F5F9', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />;
}

// ── 
function mockData(mes, ano) {
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return {
    periodo: { mes, ano, label: `${nomes[mes-1]} ${ano}` },
    acaoAgora: [
      { txt: 'Aumente o aporte da reserva de R$ 200 para R$ 500/mês → conclui em Jun/2027', btn: 'Ver reserva' },
      { txt: 'Taxa de poupança em 8,2% — meta é 20%. Redirecione R$ 800/mês para metas', btn: 'Ver planejamento' },
      { txt: 'Cartões = 37,8% das saídas — revise o limite deste cartão', btn: 'Ver cartões' },
    ],
    investimentos: { aporteMes: 800, aportePctRenda: 19, aporteVsAnterior: 200, patrimonioTotal: 42000, patrimonioVsMes: 800, patrimonioVsAno: 12, vsMediaSemestral: 15 },
    reserva: { valor: 1800, metaValor: 12000, pctMeta: 15, mesesCobertos: 1.8 },
    metasAtivas: { total: 3, resumo: 'Viagem 68% · Carro 32% · Reserva 15%', barras: [{ pct: 68, cor: '#6D28D9' }, { pct: 32, cor: '#DDD6FE' }] },
    limiteRestante: { valor: 363, teto: 7000, pctRestante: 5 },
    entradas: { valor: 7226, sub: 'Salário + extras', tendencia: 12 },
    saidas: { valor: 6637, sub: 'Total de gastos', tendencia: -8 },
    saldo: { valor: 589, pctRenda: 8.2, melhorMes: true },
    tetoGastos: { pct: 94, gasto: 6637, teto: 7000, status: 'atencao' },
    maiorGasto: { nome: 'Cartão C6', valor: 2450, pctSaidas: 37.8, tendencia: 12 },
    saldoPorMes: [
      { mes: 1, saldo: 415 }, { mes: 2, saldo: -837 }, { mes: 3, saldo: 589 }, { mes: 4, saldo: 589 },
    ],
    categorias: {
      maiorImpacto: { nome: 'Cartões', valor: 3306, pct: 50, tendencia: 12 },
      lista: [
        { nome: 'Cartões', valor: 3306, pct: 50, cor: '#EF4444' },
        { nome: 'Mercado', valor: 784,  pct: 12, cor: '#3B82F6' },
        { nome: 'Casa',    valor: 437,  pct: 7,  cor: '#16A34A' },
        { nome: 'Transporte', valor: 294, pct: 4, cor: '#F59E0B' },
        { nome: 'Outros',  valor: 116,  pct: 2,  cor: '#A78BFA' },
      ],
      total: 6637,
    },
    saudeFinanceira: [
      { lbl: 'Poupança',  val: '8,2%',     cor: '#F59E0B', pct: 41, ctx: 'Meta 20% · Jan–Abr 2026' },
      { lbl: 'Teto',      val: '94%',       cor: '#F59E0B', pct: 94, ctx: 'R$ 363 disponíveis' },
      { lbl: 'Metas',     val: '38%',       cor: '#3B82F6', pct: 38, ctx: '3 metas ativas' },
      { lbl: 'Reserva',   val: '1,8 meses', cor: '#EF4444', pct: 30, ctx: 'Ideal 6 meses · crítico' },
    ],
    comparativos: {
      vsMesAnterior: { label: 'VS Março 2026', entradas: '+9%', saidas: '-13%', saldo: 'melhor', corE: '#16A34A', corS: '#16A34A', corSal: '#3B82F6' },
      vsMedia: { label: 'VS Média Jan–Abr', entradas: '+5%', saidas: '-3%', poupanca: 'abaixo', corE: '#16A34A', corS: '#16A34A', corP: '#F59E0B' },
    },
    comparativoPerfil: { pctPerfil: 12, pctVoce: 8.2 },
    radarFinanceiro: [
      { tipo: 'alert', cat: 'Cartões acima do ideal', txt: 'Cartões representam 50% das suas saídas. O ideal é manter abaixo de 40%. Ajuste seus gastos para aumentar sua taxa de poupança.', cta: 'Ver insights' },
      { tipo: 'info',  cat: 'Comparativo de perfil',  txt: 'Usuários semelhantes guardam 12%. Você guarda 8,2%.', cta: 'Ver metas' },
      { tipo: 'ok',    cat: 'Conquista do mês',        txt: 'Abril foi o melhor mês do ano — saídas caíram 13% e saldo fechou positivo.', cta: 'Ver fluxo' },
      { tipo: 'alert', cat: 'Reserva crítica',         txt: 'Reserva cobre 1,8 meses. O recomendado para o seu padrão é 6 meses.', cta: 'Ajustar' },
    ],
    metasAndamento: [
      { nome: 'Viagem',  pct: 68, cor: '#3B82F6', ctx: 'Faltam R$ 1.600 · Dez/2026', ctxCor: '#9CA3AF' },
      { nome: 'Carro',   pct: 32, cor: '#16A34A', ctx: 'Faltam R$ 10.200 · Jun/2027', ctxCor: '#9CA3AF' },
      { nome: 'Reserva', pct: 15, cor: '#EF4444', ctx: 'Em risco — ritmo lento', ctxCor: '#EF4444' },
    ],
    scoreFinanceiro: 71,
    resumoPeriodo: {
      titulo: 'Resumo 2026', intervalo: 'Jan – Abr', diagnostico: 'Em recuperação',
      entradasTotal: 27382, entradasMediaMes: 6846,
      saidasTotal: 26626, saidasMediaMes: 6657,
      saldoPeriodo: 756, taxaPoupancaPeriodo: 8.2,
      saldoMesSelecionado: 589, melhorMes: 'Abril',
      maiorImpactoNome: 'Cartões', maiorImpactoValor: 10842, maiorImpactoPercentual: 40.7,
      investimentosPeriodo: 2900, investimentosPercentualRenda: 10.6,
      patrimonioCrescimentoPercentual: 12,
      scoreMedio: 63, piorMes: 'Fevereiro',
    },
  };
}

// ── 
export default function DashboardPage() {
  const navigate = useNavigate();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [modalTeto, setModalTeto] = useState(false);
  const [valorTeto, setValorTeto] = useState(7000);
  const [saldoTip, setSaldoTip] = useState(null);

  const carregarDados = useCallback(async (m, a) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await api.get(`/dashboard/completo?mes=${m}&ano=${a}`);
      setDados(res.data);
      if (res.data?.tetoGastos?.teto) setValorTeto(res.data.tetoGastos.teto);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err.message);
      setApiError(err.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(mes, ano); }, [mes, ano, carregarDados]);

  const trocarPeriodo = (m, a) => { setMes(m); setAno(a); };

  if (apiError && !dados) {
    return (
      <Layout>
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #FCA5A5', padding: '40px 44px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Backend indisponível</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Verifique se o servidor está rodando na porta 3001.</div>
            <div style={{ fontSize: '12px', color: '#EF4444', background: '#FEF2F2', borderRadius: '6px', padding: '8px 12px', margin: '12px 0 20px', fontFamily: 'monospace', wordBreak: 'break-word' }}>{apiError}</div>
            <button style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => carregarDados(mes, ano)}>
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading || !dados) {
    return (
      <Layout>
        <div style={S.page}>
          <div style={{ padding: '16px 0 12px', fontSize: 22, fontWeight: 600, color: '#111827' }}>Visão Geral</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} h={140} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 10 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} h={130} />)}
          </div>
        </div>
      </Layout>
    );
  }

  const D = dados;
  const R = D.resumoPeriodo || {};
  const nomeUsuario = (() => { try { return JSON.parse(localStorage.getItem('user'))?.nome || 'Well e Amanda'; } catch { return 'Well e Amanda'; } })();

  const gaugePct  = D.tetoGastos?.pct || 0;
  const gaugeCor  = gaugePct >= 100 ? '#EF4444' : gaugePct >= 90 ? '#EF4444' : gaugePct >= 70 ? '#F59E0B' : '#16A34A';
  const gaugeBg   = gaugePct >= 90 ? '#FEE2E2' : '#FEF3C7';
  const gaugeTxtC = gaugePct >= 90 ? '#991B1B' : '#92400E';
  const gaugeTxt  = gaugePct >= 100 ? 'Teto ultrapassado!' : `Atenção — ${gaugePct}% usado`;

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={S.page}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 12px' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              Visão Geral
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Olá, {nomeUsuario}!</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PeriodSelector mes={mes} ano={ano} onChange={trocarPeriodo} />
            <button style={{ padding: '7px 14px', background: 'white', border: '1px solid #E9ECEF', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>Exportar</button>
          </div>
        </div>

        {/* PMA */}
        <PMA acaoAgora={D.acaoAgora} />

        {/* ROW 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 10, marginBottom: 10, alignItems: 'stretch' }}>

          {/* Card triplo: Entradas / Saídas / Saldo */}
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', height: '100%' }}>

              {/* ESQUERDA: Entradas + Saídas */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Entradas */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Entradas</span>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#16A34A', lineHeight: 1, marginBottom: 3 }}>{fmt(D.entradas?.valor)}</div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 400, marginBottom: 3 }}>{D.entradas?.sub || 'Salário + extras'}</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: D.entradas?.tendencia >= 0 ? '#16A34A' : '#EF4444' }}>{D.entradas?.tendencia >= 0 ? '↑' : '↓'}</span>
                      {D.entradas?.tendencia >= 0 ? '+' : ''}{D.entradas?.tendencia}% vs mês anterior
                    </div>
                  </div>
                </div>

                {/* Separador simples — linha fina sem dot */}
                <div style={{ height: '0.5px', background: '#E5E7EB', margin: '0 16px' }} />

                {/* Saídas */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Saídas</span>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#EF4444', lineHeight: 1, marginBottom: 3 }}>{fmt(D.saidas?.valor)}</div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 400, marginBottom: 3 }}>Total de gastos</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: D.saidas?.tendencia <= 0 ? '#16A34A' : '#EF4444' }}>{D.saidas?.tendencia <= 0 ? '↑' : '↓'}</span>
                      {D.saidas?.tendencia >= 0 ? '+' : ''}{D.saidas?.tendencia}% vs mês anterior
                    </div>
                  </div>
                </div>
              </div>

              {/* SEPARADOR VERTICAL */}
              <div style={{ background: '#E5E7EB' }} />

              {/* DIREITA: Saldo */}
              <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>$ Saldo do mês</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: D.saldo?.valor >= 0 ? '#16A34A' : '#EF4444', lineHeight: 1, marginBottom: 4 }}>
                  {D.saldo?.valor >= 0 ? '+' : ''}{fmt(D.saldo?.valor)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 400, marginBottom: 10 }}>
                  {fmtP(D.saldo?.pctRenda)} da renda preservada
                </div>

                {/* Pill superávit/déficit */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: D.saldo?.valor >= 0 ? '#F0FDF4' : '#FFF7F7', color: D.saldo?.valor >= 0 ? '#16A34A' : '#EF4444', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, marginBottom: 8, width: 'fit-content', border: `1px solid ${D.saldo?.valor >= 0 ? '#DCFCE7' : '#FECACA'}` }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={D.saldo?.valor >= 0 ? '#16A34A' : '#EF4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {D.saldo?.valor >= 0
                      ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                      : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
                  </svg>
                  {D.saldo?.valor >= 0 ? 'Mês positivo' : 'Déficit no mês'}
                </div>

                {/* Melhor mês */}
                {D.saldo?.melhorMes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B', fontWeight: 400, marginBottom: 8 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 9a6 6 0 0 0 12 0"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/>
                    </svg>
                    Melhor mês do ano
                  </div>
                )}

                {/* Mini bloco: Renda preservada + seta discreta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: 8, padding: '8px 10px', marginBottom: 8, marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>Renda preservada</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: D.saldo?.valor >= 0 ? '#16A34A' : '#EF4444' }}>{fmtP(D.saldo?.pctRenda)} da renda</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {(D.saldo?.valor || 0) >= 0 ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                          <polyline points="17 6 23 6 23 12"/>
                        </svg>
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>em alta</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                          <polyline points="17 18 23 18 23 12"/>
                        </svg>
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>em baixa</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Link */}
                <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 500, cursor: 'pointer', paddingTop: 4 }} onClick={() => navigate('/fluxo-anual')}>
                  Ver evolução do saldo →
                </span>

              </div>

            </div>
          </div>

          {/* Teto de Gastos + Limite Restante — card unificado */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Orçamento</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF', marginBottom: 10 }}>Teto de Gastos</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>Utilizado</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: gaugePct === 0 ? '#9CA3AF' : gaugePct < 80 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>{Math.round(gaugePct)}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>Restante</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: (D.limiteRestante?.valor || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1 }}>{fmt(D.limiteRestante?.valor)}</div>
              </div>
            </div>
            <div style={{ height: 4, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(gaugePct, 100)}%`, background: gaugePct < 80 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>
              Gasto: <span style={{ color: (D.saidas?.valor || 0) > 0 ? '#EF4444' : '#9CA3AF', fontWeight: 600 }}>{fmt(D.saidas?.valor)}</span> · Teto: {fmt(D.tetoGastos?.teto)}
            </div>
            {gaugePct >= 100
              ? <div style={{ fontSize: 11, fontWeight: 500, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Teto ultrapassado
                </div>
              : gaugePct >= 80
              ? <div style={{ fontSize: 11, fontWeight: 500, color: '#F59E0B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Atenção — {Math.round(gaugePct)}% usado
                </div>
              : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver planejamento →</span>
              <span style={{ fontSize: 11, color: '#6B7280', cursor: 'pointer' }} onClick={() => setModalTeto(true)}>⚙ Alterar teto</span>
            </div>
          </div>

          {/* Reserva */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Segurança</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF', marginBottom: 10 }}>Reserva de Segurança</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: (D.reserva?.valor || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>{fmt(D.reserva?.valor)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{(D.reserva?.mesesCobertos || 0).toFixed(1)} meses de proteção</div>

            {/* Barra de progresso global */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(Math.max(isFinite(D.reserva?.pctMeta) ? D.reserva.pctMeta : 0, 0), 100)}%`, background: '#16A34A', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 500, whiteSpace: 'nowrap' }}>{Math.round(isFinite(D.reserva?.pctMeta) ? D.reserva.pctMeta : 0)}%</span>
            </div>

            {/* Quadrados de progresso — 6 meses meta */}
            {(() => {
              const META_MESES = 6;
              const mesesCobertos = D.reserva?.mesesCobertos || 0;
              const mesesInteiros = Math.floor(mesesCobertos);
              const fracao = mesesCobertos - mesesInteiros;
              return (
                <>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>Meta ideal: {META_MESES} meses</div>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                    {Array.from({ length: META_MESES }).map((_, i) => {
                      if (i < mesesInteiros) {
                        return <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: '#94A3B8', border: '1px solid #94A3B8' }} />;
                      }
                      if (i === mesesInteiros && fracao > 0) {
                        const pct = Math.round(fracao * 100);
                        return <div key={i} style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #E5E7EB', background: `linear-gradient(to right, #94A3B8 ${pct}%, #F3F4F6 ${pct}%)` }} />;
                      }
                      return <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: '#F3F4F6', border: '1px solid #E5E7EB' }} />;
                    })}
                  </div>
                </>
              );
            })()}

            {/* Faltam R$ X para a meta */}
            {(D.reserva?.metaValor || 0) > (D.reserva?.valor || 0) && (
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
                Faltam <span style={{ color: '#6B7280', fontWeight: 500 }}>{fmt((D.reserva?.metaValor || 0) - (D.reserva?.valor || 0))}</span> para a meta
              </div>
            )}

            {/* Variação vs mês anterior */}
            {D.reserva?.estado === 'crescendo' && (
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                <span style={{ color: '#16A34A' }}>↑</span> +{fmt(D.reserva?.variacao)} vs mês anterior
              </div>
            )}
            {D.reserva?.estado === 'reduzindo' && (
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                <span style={{ color: '#EF4444' }}>↓</span> -{fmt(Math.abs(D.reserva?.variacao))} vs mês anterior
              </div>
            )}

            {/* Insight preditivo */}
            {(() => {
              const faltam = (D.reserva?.metaValor || 0) - (D.reserva?.valor || 0);
              const ritmo = D.reserva?.variacao || 0;
              if (faltam <= 0 || ritmo <= 0) return null;
              const mesesParaMeta = Math.ceil(faltam / ritmo);
              if (mesesParaMeta > 120) return null;
              const dataProjetada = new Date(ano, mes - 1 + mesesParaMeta, 1);
              const mesProjetado = MESES_ABREV[dataProjetada.getMonth()];
              const anoProjetado = dataProjetada.getFullYear();
              return (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Na média atual, meta em <span style={{ color: '#6B7280', fontWeight: 500, marginLeft: 3 }}>{mesProjetado}/{anoProjetado}</span>
                </div>
              );
            })()}

            {/* Badge dinâmico */}
            {(D.reserva?.mesesCobertos || 0) < 1
              ? <div style={{ fontSize: 11, fontWeight: 500, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Cobertura muito baixa
                </div>
              : (D.reserva?.mesesCobertos || 0) < 3
              ? <div style={{ fontSize: 11, fontWeight: 500, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Crítico
                </div>
              : (D.reserva?.mesesCobertos || 0) < 6
              ? <div style={{ fontSize: 11, fontWeight: 500, color: '#F59E0B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Em progresso
                </div>
              : <div style={{ fontSize: 11, fontWeight: 500, color: '#16A34A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Proteção completa
                </div>
            }

            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/reserva')}>Ver detalhes →</span>
          </div>

          {/* Maior Gasto */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Maior Gasto</div>

            {/* Ícone + categoria + descrição + badge variação */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{D.maiorGasto?.descricao || D.maiorGasto?.nome || '—'}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{D.maiorGasto?.nome || ''}</div>
                </div>
              </div>
              {/* Badge variação */}
              {D.maiorGasto?.tendencia != null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: D.maiorGasto.tendencia <= 0 ? '#F0FDF4' : '#FEF2F2', color: D.maiorGasto.tendencia <= 0 ? '#16A34A' : '#EF4444', padding: '3px 7px', borderRadius: 99, fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <span>{D.maiorGasto.tendencia <= 0 ? '↓' : '↑'}</span>
                  {D.maiorGasto.tendencia > 0 ? '+' : ''}{D.maiorGasto.tendencia}% vs {MESES_ABREV[mes <= 1 ? 11 : mes - 2]}
                </div>
              )}
            </div>

            {/* Valor principal */}
            <div style={{ fontSize: 22, fontWeight: 700, color: (D.maiorGasto?.valor || 0) > 0 ? '#EF4444' : '#9CA3AF', lineHeight: 1, marginBottom: 3 }}>{fmt(D.maiorGasto?.valor)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
              Representa <span style={{ color: '#EF4444', fontWeight: 600 }}>{fmtP(D.maiorGasto?.pctSaidas)}</span> das saídas de {MESES_ABREV[mes - 1]}
            </div>

            {/* Barra proporcional */}
            <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${Math.min(D.maiorGasto?.pctSaidas || 0, 100)}%`, height: '100%', background: '#EF4444', borderRadius: 2 }} />
            </div>

            {/* Insight de recorrência */}
            {(() => {
              const vezes = D.maiorGasto?.vezesComoMaior || 0;
              const nome = D.maiorGasto?.nome || 'Esta categoria';
              const totalMeses = mes;
              if (vezes === 0) return null;
              const isPrimeira = vezes === 1;
              const isDominante = vezes >= 4;
              const bg = isPrimeira ? '#F0FDF4' : isDominante ? '#FEF2F2' : '#FEF3C7';
              const icoBg = isPrimeira ? '#DCFCE7' : isDominante ? '#FECACA' : '#FDE68A';
              const cor = isPrimeira ? '#16A34A' : isDominante ? '#EF4444' : '#D97706';
              const icoPath = isPrimeira
                ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                : isDominante
                ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>;
              const titulo = isPrimeira ? '1ª vez como maior gasto' : isDominante ? `${vezes}ª vez — gasto dominante` : `${vezes}ª vez como maior gasto`;
              const subtexto = isPrimeira
                ? `${nome} nunca havia liderado os gastos em ${ano}.`
                : `${nome} lidera os gastos em ${vezes} dos ${totalMeses} meses de ${ano}.`;
              return (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: bg, borderRadius: 8, padding: '8px', marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icoPath}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: cor, marginBottom: 2 }}>{titulo}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>{subtexto}</div>
                  </div>
                </div>
              );
            })()}

            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/saidas')}>Ver análise do cartão →</span>
          </div>

          {/* Investimentos — card unificado com Evolução */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Faixa azul topo */}
            <div style={{ height: 6, background: '#2563EB', width: '100%', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 14 }}>

            {/* Label com ícone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em' }}>Investimentos</div>
            </div>

            {/* 3 KPIs em linha com separadores verticais */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', marginBottom: 12 }}>

              {/* Patrimônio Total */}
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Patrimônio Total</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: (D.investimentos?.patrimonioTotal || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>{fmt(D.investimentos?.patrimonioTotal)}</div>
                <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {D.investimentos?.patrimonioVsMes > 0 ? <span style={{ color: '#16A34A' }}>↑</span> : D.investimentos?.patrimonioVsMes < 0 ? <span style={{ color: '#EF4444' }}>↓</span> : <span style={{ color: '#9CA3AF' }}>—</span>}
                  <span>{D.investimentos?.patrimonioVsMes !== 0 ? `+${fmt(D.investimentos?.patrimonioVsMes)} (${D.investimentos?.patrimonioVsMesPct > 0 ? '+' : ''}${D.investimentos?.patrimonioVsMesPct}%) em ${MESES_ABREV[mes <= 1 ? 11 : mes - 2]}` : 'sem variação'}</span>
                </div>
              </div>

              {/* Separador vertical */}
              <div style={{ background: '#E5E7EB' }} />

              {/* Aporte do mês */}
              <div style={{ padding: '0 12px' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Aporte em {MESES_ABREV[mes - 1]}</div>
                <div style={{ fontSize: 17, fontWeight: 500, color: (D.investimentos?.aporteMes || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>{fmt(D.investimentos?.aporteMes)}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{fmtP(D.investimentos?.aportePctRenda)} da renda</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {Math.abs(D.investimentos?.aporteVsAnterior || 0) < 1 ? 'sem variação'
                    : D.investimentos?.aporteVsAnterior > 0
                    ? `+${fmt(D.investimentos?.aporteVsAnterior)} vs ${MESES_ABREV[mes <= 1 ? 11 : mes - 2]}`
                    : `${fmt(D.investimentos?.aporteVsAnterior)} vs ${MESES_ABREV[mes <= 1 ? 11 : mes - 2]}`}
                </div>
              </div>

              {/* Separador vertical */}
              <div style={{ background: '#E5E7EB' }} />

              {/* Rentabilidade */}
              <div style={{ paddingLeft: 12 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Rentabilidade</div>
                <div style={{ fontSize: 17, fontWeight: 500, color: (D.investimentos?.patrimonioVsAno || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>
                  {D.investimentos?.patrimonioVsAno > 0 ? '+' : ''}{D.investimentos?.patrimonioVsAno}%
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Jan – {MESES_ABREV[mes - 1]} {ano}</div>
                <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {(D.investimentos?.patrimonioVsAno || 0) > 0 ? <span style={{ color: '#16A34A' }}>↑</span> : <span style={{ color: '#9CA3AF' }}>—</span>}
                  <span>{fmt((D.investimentos?.patrimonioTotal || 0) - (D.investimentos?.patrimonioHistorico?.[0]?.valor || D.investimentos?.patrimonioTotal || 0))}</span>
                </div>
              </div>
            </div>

            {/* Linha separadora horizontal entre KPIs e tabela */}
            <div style={{ height: '0.5px', background: '#E5E7EB', margin: '0 0 12px' }} />

            {/* Tabela Evolução */}
            {(() => {
              const histRaw = (D.investimentos?.patrimonioHistorico || []).filter(p => p != null && p.valor > 0);
              if (!histRaw.length) return <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sem dados de evolução</div>;
              const hist = histRaw.filter((p, i) => i === 0 || p.valor !== histRaw[i - 1].valor);
              if (hist.length < 2) return null;
              const maxVar = Math.max(...hist.map((p, i) => i > 0 ? Math.abs(p.valor - hist[i - 1].valor) : 0), 1);
              const mesIni = MESES_ABREV[(hist[0].mes || 1) - 1];
              const mesFim = MESES_ABREV[(hist[hist.length - 1].mes || 1) - 1];
              const grid = { display: 'grid', gridTemplateColumns: '28px 40px 1fr 1fr 28px 1fr', gap: '0 6px', alignItems: 'center' };
              return (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                    Evolução {ano}
                  </div>
                  <div style={{ ...grid, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Mês</span>
                    <span />
                    <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>Aporte</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>Rendeu</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>%</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>Saldo</div>
                  </div>
                  {hist.map((p, i) => {
                    const varTotal = i > 0 ? p.valor - hist[i - 1].valor : null;
                    const aporteMes = p.aporte || 0;
                    const rendeuMes = varTotal !== null ? varTotal - aporteMes : null;
                    const barW = varTotal !== null ? Math.round((Math.abs(varTotal) / maxVar) * 100) : 0;
                    const pctMes = i > 0 && hist[i - 1].valor > 0 ? ((p.valor / hist[i - 1].valor - 1) * 100).toFixed(1) : null;
                    return (
                      <div key={i} style={{ ...grid, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{MESES_ABREV[(p.mes || 1) - 1]}</span>
                        <div style={{ height: 2, background: i === 0 ? 'transparent' : '#F3F4F6', borderRadius: 1, overflow: 'hidden', minWidth: 0 }}>
                          <div style={{ width: i === 0 ? '0%' : `${barW}%`, height: '100%', background: '#16A34A', borderRadius: 1 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>{aporteMes > 0 ? fmt(aporteMes) : '—'}</span>
                        <span style={{ fontSize: 12, color: rendeuMes === null ? '#9CA3AF' : '#16A34A', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {rendeuMes === null ? '—' : `${rendeuMes >= 0 ? '+' : ''}${fmt(rendeuMes)}`}
                        </span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {pctMes === null ? '—' : `${parseFloat(pctMes) >= 0 ? '+' : ''}${pctMes}%`}
                        </span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(p.valor)}</span>
                      </div>
                    );
                  })}
                </>
              );
            })()}
            </div>
          </div>

          {/* Categorias */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Distribuição</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>Categorias vs Saldo</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{MESES_ABREV[mes - 1]}</div>
            </div>
            {(() => {
              const lista = D.categorias?.lista || [];
              const total = D.entradas?.valor || 0;
              const saidas = D.categorias?.total || 0;
              const saldoRestante = Math.max(0, total - saidas);
              const saldoPct = total > 0 ? Math.round((saldoRestante / total) * 100) : 0;
              return (
                <>
                  {/* Categorias com hierarquia visual — maior gasto em destaque */}
                  {lista.map((c, i) => {
                    const isMaior = i === 0;
                    const maxValor = lista[0]?.valor || 1;
                    const barW = Math.round((c.valor / maxValor) * 100);

                    const getIcone = (nome) => {
                      const n = (nome || '').toLowerCase();
                      if (n.includes('cart') || n.includes('card')) return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isMaior ? '#EF4444' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                      );
                      if (n.includes('aliment') || n.includes('comida') || n.includes('restaur')) return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                        </svg>
                      );
                      if (n.includes('casa') || n.includes('aluguel') || n.includes('moradia')) return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      );
                      if (n.includes('saúde') || n.includes('saude') || n.includes('médic') || n.includes('medic')) return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                      );
                      if (n.includes('transporte') || n.includes('carro') || n.includes('uber') || n.includes('gasolina')) return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      );
                      return (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
                        </svg>
                      );
                    };

                    return (
                      <div key={i} style={{ padding: '6px 0', borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: isMaior ? '#FEF2F2' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {getIcone(c.nome)}
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</span>
                            {isMaior && (
                              <span style={{ fontSize: 10, fontWeight: 500, color: '#EF4444', background: '#FEF2F2', padding: '2px 6px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0 }}>Maior gasto</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isMaior ? '#EF4444' : '#111827', whiteSpace: 'nowrap' }}>{fmt(c.valor)}</span>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>{c.pct}%</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginLeft: 40 }}>
                          <div style={{ width: `${barW}%`, height: '100%', background: isMaior ? '#EF4444' : '#94A3B8', borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Saldo restante — separado como RESULTADO, não categoria */}
                  {total > 0 && saldoRestante >= 0 && (
                    <>
                      <div style={{ height: '0.5px', background: '#E5E7EB', margin: '6px 0' }} />
                      <div style={{ padding: '6px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#16A34A' }}>Saldo restante</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', whiteSpace: 'nowrap' }}>{fmt(saldoRestante)}</span>
                            <span style={{ fontSize: 11, color: '#16A34A' }}>{saldoPct}%</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginLeft: 40 }}>
                          <div style={{ width: `${saldoPct}%`, height: '100%', background: '#16A34A', borderRadius: 2 }} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Total saídas */}
                  <div style={{ marginTop: 4, paddingTop: 8, borderTop: '0.5px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>Total saídas</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>{fmt(saidas)}</span>
                  </div>
                </>
              );
            })()}
            <span style={{ ...S.cardLink, marginTop: 8 }} onClick={() => navigate('/saidas')}>Ver saídas →</span>
          </div>

          <GraficoSaldo meses={D.saldoPorMes} style={{ gridColumn: 'span 2' }} />

        </div>

        {/* ROW 3 – Tendência trimestral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 10 }}>

          {/* Tendência trimestral */}
          <div style={{ ...S.card }}>
            {(() => {
              const mesesAbrev = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
              const t3 = (D.trimestre || []).map((d, i) => ({
                lbl: mesesAbrev[d.mes - 1],
                e: d.entradas, s: d.saidas, inv: d.aportes, res: d.reserva,
                atual: i === 2,
              }));
              if (t3.length < 3) return null;
              const totalE   = Math.round(t3.reduce((a, m) => a + m.e,   0));
              const totalS   = Math.round(t3.reduce((a, m) => a + m.s,   0));
              const totalInv = Math.round(t3.reduce((a, m) => a + m.inv, 0));
              const totalRes = Math.round(t3.reduce((a, m) => a + m.res, 0));
              const maxE   = Math.max(...t3.map(m => m.e),   1);
              const maxS   = Math.max(...t3.map(m => m.s),   1);
              const maxInv = Math.max(...t3.map(m => m.inv), 1);
              const maxRes = Math.max(...t3.map(m => m.res), 1);
              const metricas = [
                { lbl: 'Entradas',      cor: '#16A34A', corLight: '#BBF7D0', vals: t3.map(m => ({ v: m.e,   h: Math.round((m.e   / maxE)   * 100), lbl: m.lbl, atual: m.atual })), total: fmt(totalE)   },
                { lbl: 'Saídas',        cor: '#EF4444', corLight: '#FECACA', vals: t3.map(m => ({ v: m.s,   h: Math.round((m.s   / maxS)   * 100), lbl: m.lbl, atual: m.atual })), total: fmt(totalS)   },
                { lbl: 'Investimentos', cor: '#2563EB', corLight: '#DBEAFE', vals: t3.map(m => ({ v: m.inv, h: Math.round((m.inv / maxInv) * 100), lbl: m.lbl, atual: m.atual })), total: fmt(totalInv) },
                { lbl: 'Reserva',       cor: '#8B5CF6', corLight: '#DDD6FE', vals: t3.map(m => ({ v: m.res, h: Math.round((m.res / maxRes) * 100), lbl: m.lbl, atual: m.atual })), total: fmt(totalRes) },
              ];
              return (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, marginTop: 4 }}>Tendência</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Resumo do trimestre</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t3[0].lbl}–{t3[2].lbl}</div>
                  </div>
                  {metricas.map((m, mi) => (
                    <div key={mi} style={{ marginBottom: mi < metricas.length - 1 ? 10 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.cor, display: 'inline-block' }} />
                          {m.lbl}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: m.cor }}>{m.total}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                        {m.vals.map((v, vi) => (
                          <div key={vi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: '100%', background: v.atual ? m.cor : m.corLight, borderRadius: '2px 2px 0 0', height: `${Math.max(v.h, 3)}%`, minHeight: 3, transition: 'height .3s' }} />
                            <div style={{ fontSize: 9, color: v.atual ? '#6B7280' : '#D1D5DB', fontWeight: v.atual ? 600 : 400 }}>{v.lbl}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#6B7280' }}>Saldo do trimestre</span>
                    <span style={{ fontWeight: 600, color: totalE - totalS >= 0 ? '#16A34A' : '#EF4444' }}>{totalE - totalS >= 0 ? '+' : ''}{fmt(totalE - totalS)}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ROW 4 – linha inferior */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1fr)', gap: 10, marginBottom: 10 }}>

          {/* Comparativos */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#6B7280', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Análise</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>Comparativos {Ico.info}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Variação vs mês anterior e média semestral</div>
            {D.comparativos?.vsMesAnterior && (
              <>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>{D.comparativos.vsMesAnterior.label}</div>
                {[
                  { arrow: '↑', lbl: 'Entradas', val: D.comparativos.vsMesAnterior.entradas, cor: D.comparativos.vsMesAnterior.corE },
                  { arrow: '↓', lbl: 'Saídas',   val: D.comparativos.vsMesAnterior.saidas,   cor: D.comparativos.vsMesAnterior.corS },
                  { arrow: '↑', lbl: 'Saldo',    val: D.comparativos.vsMesAnterior.saldo,    cor: D.comparativos.vsMesAnterior.corSal },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 18, color: r.cor }}>{r.arrow}</span>
                    <span style={{ fontSize: 13, color: '#6B7280', flex: 1 }}>{r.lbl}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6B7280' }}>{r.val}</span>
                  </div>
                ))}
              </>
            )}
            <div style={{ height: '0.5px', background: '#F3F4F6', margin: '8px 0' }} />
            {D.comparativos?.vsMedia && (
              <>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>{D.comparativos.vsMedia.label}</div>
                {[
                  { arrow: '↑', lbl: 'Entradas', val: D.comparativos.vsMedia.entradas, cor: D.comparativos.vsMedia.corE },
                  { arrow: '↓', lbl: 'Saídas',   val: D.comparativos.vsMedia.saidas,   cor: D.comparativos.vsMedia.corS },
                  { arrow: '↓', lbl: 'Poupança', val: D.comparativos.vsMedia.poupanca, cor: D.comparativos.vsMedia.corP },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 18, color: r.cor }}>{r.arrow}</span>
                    <span style={{ fontSize: 13, color: '#6B7280', flex: 1 }}>{r.lbl}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6B7280' }}>{r.val}</span>
                  </div>
                ))}
              </>
            )}
            <span style={S.cardLink} onClick={() => navigate('/relatorios')}>Ver detalhes e métodos de cálculo →</span>
          </div>

          {/* Comparativo de perfil */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#F59E0B', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Benchmark</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>Comparativo de perfil <Tooltip text="Comparação baseada em médias de usuários com perfil semelhante. Dados agregados e anônimos.">{Ico.info}</Tooltip></div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>Sua taxa de poupança vs usuários semelhantes</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
                Usuários com perfil semelhante guardam <strong>{D.comparativoPerfil?.pctPerfil}%</strong> da renda. Você guarda <strong>{D.comparativoPerfil?.pctVoce}%</strong>.
              </div>
            </div>
            <div style={{ background: '#F7F8FA', borderRadius: 7, padding: '10px 12px', marginBottom: 10 }}>
              {[
                { lbl: 'Perfil semelhante', pct: D.comparativoPerfil?.pctPerfil || 0, cor: '#6B7280', bg: '#E9ECEF', val: `${D.comparativoPerfil?.pctPerfil}%`, valCor: '#374151' },
                { lbl: 'Você', pct: D.comparativoPerfil?.pctVoce || 0, cor: '#F59E0B', bg: '#FEF3C7', val: `${D.comparativoPerfil?.pctVoce}%`, valCor: '#F59E0B' },
              ].map((b, i) => (
                <div key={i} style={{ marginBottom: i === 0 ? 8 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{b.lbl}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: b.valCor }}>{b.val}</span>
                  </div>
                  <div style={{ height: 4, background: b.bg, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(b.pct / 20 * 100, 100)}%`, background: b.cor, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <span style={S.cardLink} onClick={() => navigate('/relatorios')}>Entenda esse comparativo →</span>
          </div>

          {/* Radar */}
          <RadarFinanceiro insights={D.radarFinanceiro || []} />


          {/* Score */}
          <ScoreGauge score={D.scoreFinanceiro} />

          {/* Metas — card unificado */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Progresso</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>Metas Ativas</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Acompanhe o progresso das suas metas</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#8B5CF6', lineHeight: 1, marginBottom: 4 }}>{D.metasAtivas?.total ?? 0} metas</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>Em andamento</div>
            {(D.metasAndamento || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {(D.metasAndamento || []).slice(0, 3).map((m, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: '#374151', fontWeight: 500 }}>{m.nome}</span>
                      <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{m.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.pct}%`, background: m.cor || '#8B5CF6', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{m.ctx}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px', textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Nenhuma meta cadastrada</div>
              </div>
            )}
            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/metas')}>Ver todas as metas →</span>
          </div>
        </div>

        {/* Modal Teto */}
        {modalTeto && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalTeto(false)}>
            <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 380, boxShadow: '0 16px 48px rgba(0,0,0,.12)', border: '1px solid #E9ECEF' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>Teto mensal de gastos</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>Limite máximo de saídas que você se permite por mês</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Valor do teto (R$)</label>
                <input type="number" value={valorTeto} onChange={e => setValorTeto(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 11px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' }} />
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>Renda estimada do mês: {fmt(D.entradas?.valor || 0)}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Válido a partir de</label>
                <input type="month" defaultValue={`${ano}-${String(mes).padStart(2,'0')}`}
                  style={{ width: '100%', padding: '9px 11px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' }} />
              </div>
              <div style={{ background: '#EFF6FF', borderRadius: 7, padding: '10px 12px', fontSize: 12, color: '#1D4ED8', lineHeight: 1.5, marginBottom: 16 }}>
                Com renda de {fmt(D.entradas?.valor || 0)}, um teto de {fmt(valorTeto)} deixa {fmt(Math.max(0, (D.entradas?.valor || 0) - valorTeto))} de margem.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setModalTeto(false)} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button onClick={() => setModalTeto(false)} style={{ flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Salvar teto</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}