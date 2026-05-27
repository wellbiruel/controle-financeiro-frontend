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
  if (!meses?.length) meses = [];

  const comDados  = meses.filter(m => m != null && m.saldo != null);
  const positivos = comDados.filter(m => m.saldo >= 0).length;
  const negativos = comDados.filter(m => m.saldo < 0).length;
  const acum      = comDados.reduce((s, m) => s + (m.saldo || 0), 0);

  const dadosPorMes = MESES_ABREV.map((label, i) => {
    const found = meses.find(m => m != null && m.mes === i + 1);
    return { label, mes: i + 1, ...found };
  });

  const comSaldo  = dadosPorMes.filter(m => m.saldo != null);
  const melhorMes = comSaldo.length ? comSaldo.reduce((a, b) => b.saldo > a.saldo ? b : a) : null;
  const piorMes   = comSaldo.length ? comSaldo.reduce((a, b) => b.saldo < a.saldo ? b : a) : null;

  // Maior sequência positiva consecutiva — busca no histórico completo
  let maxSeq = 0, maxSeqStart = -1, maxSeqEnd = -1, curSeq = 0, curStart = -1;
  for (let i = 0; i < comSaldo.length; i++) {
    if (comSaldo[i].saldo >= 0) {
      if (curSeq === 0) curStart = i;
      curSeq++;
      if (curSeq > maxSeq) { maxSeq = curSeq; maxSeqStart = curStart; maxSeqEnd = i; }
    } else { curSeq = 0; }
  }
  const maiorSeqLabel = maxSeq >= 2 && maxSeqStart !== -1
    ? `${comSaldo[maxSeqStart]?.label} · ${comSaldo[maxSeqEnd]?.label}`
    : null;

  // Período com dados
  const primMes = comSaldo.length ? MESES_ABREV[(comSaldo[0].mes || 1) - 1] : null;
  const ultMes  = comSaldo.length ? MESES_ABREV[(comSaldo[comSaldo.length - 1].mes || 1) - 1] : null;
  const periodoLabel = primMes && ultMes && primMes !== ultMes
    ? `${primMes} – ${ultMes} ${new Date().getFullYear()}`
    : primMes ? `${primMes} ${new Date().getFullYear()}` : '';

  // Escala SVG
  const SVG_W    = 580; const SVG_H = 170; const ZERO_Y = 90;
  const PAD_LEFT = 36;  const AREA_W = SVG_W - PAD_LEFT - 4;
  const BAR_W    = Math.floor(AREA_W / 12) - 4;
  const maxAbs   = Math.max(...comSaldo.map(m => Math.abs(m.saldo || 0)), 1);
  const SCALE    = 70 / maxAbs;

  const picoPos  = melhorMes?.saldo > 0 ? melhorMes.saldo : null;
  const picoNeg  = piorMes?.saldo < 0 ? piorMes.saldo : null;
  const picoYPos = picoPos ? ZERO_Y - Math.round(picoPos * SCALE) : null;
  const picoYNeg = picoNeg ? ZERO_Y + Math.round(Math.abs(picoNeg) * SCALE) : null;

  const barXs = dadosPorMes.map((_, i) =>
    PAD_LEFT + Math.round(i * (AREA_W / 12)) + Math.floor((AREA_W / 12) / 2)
  );

  const linePoints = dadosPorMes.map((m, i) => {
    if (m.saldo == null) return null;
    const h = Math.max(3, Math.round(Math.abs(m.saldo) * SCALE));
    const pos = m.saldo >= 0;
    return { x: barXs[i], y: pos ? ZERO_Y - h : ZERO_Y + h, pos };
  });
  const validPoints = linePoints.filter(p => p !== null);
  const linePath = validPoints.length >= 2
    ? validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
    : null;

  return (
    <div style={{ ...S.card, ...style }}>

      {/* Header */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Análise mensal</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>Saldo por mês · {new Date().getFullYear()}</div>
        <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver fluxo →</span>
      </div>

      {/* 3 KPIs — Melhor mês / Pior mês / Maior sequência */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>

        {/* Melhor mês — verde */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Melhor mês</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{melhorMes?.label || '—'}</div>
            <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2, whiteSpace: 'nowrap' }}>{melhorMes ? fmtS(melhorMes.saldo) : '—'}</div>
          </div>
        </div>

        {/* Pior mês — vermelho */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Pior mês</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{piorMes?.label || '—'}</div>
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 2, whiteSpace: 'nowrap' }}>{piorMes ? fmtS(piorMes.saldo) : '—'}</div>
          </div>
        </div>

        {/* Maior sequência — ícone check verde, texto verde, fundo #DCFCE7 */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Maior sequência</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{maxSeq >= 1 ? `${maxSeq} meses` : '—'}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, whiteSpace: 'nowrap' }}>{maiorSeqLabel || '—'}</div>
          </div>
        </div>

      </div>

      {/* Gráfico SVG */}
      <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>Saldo mensal (R$)</div>
      <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block', overflow: 'visible' }}>
        {picoYPos !== null && (
          <>
            <text x={PAD_LEFT - 4} y={picoYPos + 4} fontSize="9" fill="#16A34A" fontWeight="600" textAnchor="end">{`+${Math.round(picoPos).toLocaleString('pt-BR')}`}</text>
            <line x1={PAD_LEFT - 2} y1={picoYPos} x2={PAD_LEFT + 2} y2={picoYPos} stroke="#E5E7EB" strokeWidth="1"/>
          </>
        )}
        {picoYNeg !== null && (
          <>
            <text x={PAD_LEFT - 4} y={picoYNeg + 4} fontSize="9" fill="#EF4444" fontWeight="600" textAnchor="end">{`${Math.round(picoNeg).toLocaleString('pt-BR')}`}</text>
            <line x1={PAD_LEFT - 2} y1={picoYNeg} x2={PAD_LEFT + 2} y2={picoYNeg} stroke="#E5E7EB" strokeWidth="1"/>
          </>
        )}
        <line x1={PAD_LEFT} y1={ZERO_Y} x2={SVG_W} y2={ZERO_Y} stroke="#E5E7EB" strokeWidth="1"/>
        {(() => {
          const yMeta = ZERO_Y - Math.round(500 * SCALE);
          return (
            <>
              <line x1={PAD_LEFT} y1={yMeta} x2={SVG_W * 0.62} y2={yMeta} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3"/>
              <text x={SVG_W * 0.63} y={yMeta + 3} fontSize="8" fill="#9CA3AF">+R$500</text>
            </>
          );
        })()}
        {dadosPorMes.map((m, i) => {
          const fut  = m.saldo == null;
          const pos  = !fut && m.saldo >= 0;
          const h    = fut ? 3 : Math.max(3, Math.round(Math.abs(m.saldo) * SCALE));
          const x    = barXs[i] - Math.floor(BAR_W / 2);
          const y    = pos ? ZERO_Y - h : ZERO_Y;
          const cor  = fut ? '#F1F5F9' : pos ? '#22C55E' : '#EF4444';
          const corV = fut ? '#D1D5DB' : pos ? '#16A34A' : '#EF4444';
          const valTxt = fut ? '' : (pos ? '+' : '') + 'R$' + Math.round(m.saldo).toLocaleString('pt-BR');
          return (
            <g key={i} style={{ cursor: fut ? 'default' : 'pointer' }}
              onMouseEnter={e => { if (!fut) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ x: r.left + r.width/2, y: r.top - 38, m: m.label, val: m.saldo, pos }); }}}
              onMouseLeave={() => setTooltip(null)}>
              <rect x={x} y={y} width={BAR_W} height={h} rx="3" fill={cor} opacity={fut ? 1 : 0.8}/>
              {!fut && pos  && <text x={barXs[i]} y={y - 4} fontSize="8" fill={corV} fontWeight="600" textAnchor="middle">{valTxt}</text>}
              {!fut && !pos && <text x={barXs[i]} y={ZERO_Y + h + 12} fontSize="8" fill={corV} fontWeight="600" textAnchor="middle">{valTxt}</text>}
              <text x={barXs[i]} y={!fut && !pos ? ZERO_Y + h + 23 : SVG_H - 2} fontSize="9" fill={fut ? '#D1D5DB' : '#9CA3AF'} textAnchor="middle">{m.label}</text>
            </g>
          );
        })}
        {linePath && <path d={linePath} fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>}
        {linePoints.map((p, i) => {
          if (!p) return null;
          const isLast = i === linePoints.reduce((li, lp, idx) => lp ? idx : li, -1);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={isLast ? 3.5 : 2.5}
              fill={isLast ? (p.pos ? '#16A34A' : '#EF4444') : '#fff'}
              stroke={p.pos ? '#16A34A' : '#EF4444'} strokeWidth="1.5"/>
          );
        })}
        {tooltip && (
          <foreignObject x={0} y={0} width={1} height={1} style={{ overflow: 'visible' }}>
            <div style={{ position: 'fixed', background: '#111827', color: 'white', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 200, left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}>
              {tooltip.m}: <span style={{ color: tooltip.pos ? '#86EFAC' : '#FCA5A5' }}>{tooltip.pos ? '+' : ''}R$ {Math.abs(Math.round(tooltip.val)).toLocaleString('pt-BR')}</span>
            </div>
          </foreignObject>
        )}
      </svg>

      <div style={{ height: '0.5px', background: '#E5E7EB', margin: '10px 0' }} />

      {/* Bottom: Entradas/Saídas + Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

        {/* Entradas e Saídas — hierarquia refinada, barras proporcionais */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Entradas e Saídas
          </div>
          {(() => {
            const totalEntradas = comDados.reduce((s, m) => s + Math.max(0, m.entradas || 0), 0);
            const totalSaidas   = comDados.reduce((s, m) => s + Math.abs(m.saidas || 0), 0);
            const maxVal = Math.max(totalEntradas, totalSaidas, 1);
            return (
              <>
                {/* Entradas — label discreto 10px, valor protagonista 14px */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', opacity: 0.7 }}/>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>Entradas</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{fmtS(totalEntradas)}</span>
                </div>
                {/* Barra entradas proporcional — maior valor = 100% */}
                <div style={{ height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${Math.round((totalEntradas / maxVal) * 100)}%`, height: '100%', background: '#16A34A', borderRadius: 99, opacity: 0.6 }}/>
                </div>
                {/* Saídas — label discreto 10px, valor protagonista 14px */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', opacity: 0.7 }}/>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>Saídas</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{fmtS(totalSaidas)}</span>
                </div>
                {/* Barra saídas proporcional ao maxVal — visivelmente menor quando valor menor */}
                <div style={{ height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${Math.round((totalSaidas / maxVal) * 100)}%`, height: '100%', background: '#EF4444', borderRadius: 99, opacity: 0.6 }}/>
                </div>
                <div style={{ height: '0.5px', background: '#E5E7EB', margin: '4px 0 8px' }} />
                {/* Saldo líquido + período dinâmico */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 1 }}>Saldo líquido</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{periodoLabel}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: acum >= 0 ? '#16A34A' : '#EF4444' }}>{fmtS(acum)}</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Resumo do período — só positivos + negativos + aproveitamento */}
        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Resumo do período
          </div>
          {/* Apenas positivos e negativos — sem "sem dados" */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: '#F0FDF4', borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16A34A', lineHeight: 1 }}>{positivos}</div>
              <div style={{ fontSize: 11, color: '#16A34A', marginTop: 3 }}>positivos</div>
            </div>
            <div style={{ flex: 1, background: '#FEF2F2', borderRadius: 6, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444', lineHeight: 1 }}>{negativos}</div>
              <div style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>negativos</div>
            </div>
          </div>
          {/* Insight de aproveitamento dinâmico */}
          {comSaldo.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fff', borderRadius: 6, padding: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: positivos >= negativos ? '#16A34A' : '#EF4444', marginBottom: 2 }}>
                  {Math.round((positivos / comSaldo.length) * 100)}% de aproveitamento
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>
                  {positivos} de {comSaldo.length} meses positivos em {new Date().getFullYear()}.
                </div>
              </div>
            </div>
          )}
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
  const [salvandoTeto, setSalvandoTeto] = useState(false);
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

  const handleSalvarTeto = async () => {
    if (!valorTeto || valorTeto <= 0) return;
    setSalvandoTeto(true);
    try {
      await api.put('/dashboard/teto', { valor: valorTeto });
      setModalTeto(false);
      carregarDados(mes, ano);
    } catch (err) {
      console.error('Erro ao salvar teto:', err.message);
    } finally {
      setSalvandoTeto(false);
    }
  };

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

            {/* Percentual grande + valor impacto lado a lado */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: gaugePct === 0 ? '#9CA3AF' : gaugePct < 70 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>
                  {Math.round(gaugePct)}%
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>do teto utilizado</div>
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: gaugePct >= 100 ? '#EF4444' : gaugePct >= 70 ? '#F59E0B' : '#16A34A' }}>
                  {gaugePct >= 100
                    ? `${fmt(Math.max(0, (D.saidas?.valor || 0) - (D.tetoGastos?.teto || 0)))} acima`
                    : fmt(D.limiteRestante?.valor || 0)}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                  {gaugePct >= 100 ? 'do planejado' : 'ainda disponível'}
                </div>
              </div>
            </div>

            {/* Barra trizona */}
            {(() => {
              // ESCALA VISUAL DA BARRA — 3 zonas fixas proporcionais:
              // Verde  0–70%  real → 50% da largura visual
              // Âmbar  70–100% real → 30% da largura visual
              // Verm   100%+  real → 20% da largura visual (cap 15% excesso)
              // Conversão valor real → posição visual:
              // 0–70%:   posVisual = (valor / 70) * 50
              // 70–100%: posVisual = 50 + ((valor - 70) / 30) * 30
              // 100%+:   posVisual = 80 + (Math.min(valor - 100, 15) / 15) * 20

              const VERDE_END  = 50;  // % visual onde termina verde
              const AMBAR_END  = 80;  // % visual onde termina âmbar
              const VERM_END   = 100; // % visual onde termina vermelho

              // Preenchimento de cada segmento (0–100% de cada zona)
              const verdePreench  = Math.min(gaugePct / 70, 1) * 100;
              const ambarPreench  = gaugePct > 70  ? Math.min((gaugePct - 70)  / 30, 1) * 100 : 0;
              const vermelhoPreench = gaugePct > 100 ? Math.min((gaugePct - 100) / 15, 1) * 100 : 0;

              // Posição visual do dot (0–100% da largura total da barra)
              const dotVisual = gaugePct <= 70
                ? (gaugePct / 70) * VERDE_END
                : gaugePct <= 100
                ? VERDE_END + ((gaugePct - 70) / 30) * (AMBAR_END - VERDE_END)
                : AMBAR_END + (Math.min(gaugePct - 100, 15) / 15) * (VERM_END - AMBAR_END);

              const dotCor = gaugePct < 70 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444';

              return (
                <div style={{ marginBottom: 8 }}>

                  {/* Barra com marcadores acima */}
                  <div style={{ position: 'relative', marginTop: 18, marginBottom: 4 }}>

                    {/* Marcador fixo 70% — sempre visível */}
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 2px)', left: `${VERDE_END}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: '#9CA3AF', whiteSpace: 'nowrap', marginBottom: 1 }}>70%</span>
                      <div style={{ width: 1, height: 5, background: '#D1D5DB' }} />
                    </div>

                    {/* Marcador fixo 100% — sempre visível */}
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 2px)', left: `${AMBAR_END}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, color: '#9CA3AF', whiteSpace: 'nowrap', marginBottom: 1 }}>100%</span>
                      <div style={{ width: 1, height: 5, background: '#D1D5DB' }} />
                    </div>

                    {/* Marcador dinâmico — só aparece quando gaugePct > 100, mostra valor real */}
                    {gaugePct > 100 && (
                      <div style={{ position: 'absolute', bottom: 'calc(100% + 2px)', left: `${dotVisual}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, whiteSpace: 'nowrap', marginBottom: 1 }}>{Math.round(gaugePct)}%</span>
                        <div style={{ width: 1, height: 5, background: '#EF4444' }} />
                      </div>
                    )}

                    {/* Barra principal — 3 segmentos com overflow: visible para o dot */}
                    <div style={{ position: 'relative', height: 8, borderRadius: 99, overflow: 'hidden', background: '#F3F4F6' }}>
                      {/* Segmento verde: largura visual 50%, preenchimento proporcional */}
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${VERDE_END}%`, background: '#F3F4F6' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${verdePreench}%`, background: '#16A34A', borderRadius: verdePreench < 100 ? '99px' : '0' }} />
                      </div>
                      {/* Divisor verde/âmbar */}
                      <div style={{ position: 'absolute', left: `${VERDE_END}%`, top: 0, height: '100%', width: 1, background: '#E5E7EB', zIndex: 1 }} />
                      {/* Segmento âmbar: largura visual 30% */}
                      <div style={{ position: 'absolute', left: `${VERDE_END}%`, top: 0, height: '100%', width: `${AMBAR_END - VERDE_END}%`, background: '#F3F4F6' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${ambarPreench}%`, background: '#F59E0B' }} />
                      </div>
                      {/* Divisor âmbar/vermelho */}
                      <div style={{ position: 'absolute', left: `${AMBAR_END}%`, top: 0, height: '100%', width: 1, background: '#E5E7EB', zIndex: 1 }} />
                      {/* Segmento vermelho: largura visual 20% */}
                      <div style={{ position: 'absolute', left: `${AMBAR_END}%`, top: 0, height: '100%', width: `${VERM_END - AMBAR_END}%`, background: '#F3F4F6', borderRadius: '0 99px 99px 0' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${vermelhoPreench}%`, background: '#EF4444', borderRadius: vermelhoPreench >= 100 ? '0 99px 99px 0' : '0' }} />
                      </div>
                    </div>

                    {/* Dot indicador — fora do overflow:hidden para aparecer sobre a barra */}
                    <div style={{ position: 'absolute', top: '50%', left: `calc(${dotVisual}% - 6px)`, transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: dotCor, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${dotCor}`, zIndex: 3 }} />
                  </div>

                  {/* Labels das zonas — alinhadas às larguras visuais reais */}
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: `${VERDE_END}%`, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A' }}>Saudável</span>
                      <span style={{ fontSize: 9, color: '#16A34A' }}>0% – 70%</span>
                    </div>
                    <div style={{ width: `${AMBAR_END - VERDE_END}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: gaugePct >= 70 ? '#F59E0B' : '#9CA3AF' }}>Atenção</span>
                      <span style={{ fontSize: 9, color: gaugePct >= 70 ? '#F59E0B' : '#9CA3AF' }}>70–100%</span>
                    </div>
                    <div style={{ width: `${VERM_END - AMBAR_END}%`, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: gaugePct >= 100 ? '#EF4444' : '#9CA3AF' }}>Crítico</span>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* Gasto atual + Teto definido */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>Gasto atual</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: (D.saidas?.valor || 0) > 0 ? '#EF4444' : '#9CA3AF' }}>{fmt(D.saidas?.valor)}</div>
              </div>
              <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>Teto definido</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{fmt(D.tetoGastos?.teto)}</div>
              </div>
            </div>

            {/* Insight dinâmico por estado */}
            {(() => {
              const isSaudavel = gaugePct < 70;
              const isAtencao = gaugePct >= 70 && gaugePct < 100;
              const isCritico = gaugePct >= 100;
              const excesso = Math.round(gaugePct - 100);
              const bg = isSaudavel ? '#F0FDF4' : isAtencao ? '#FEF3C7' : '#FEF2F2';
              const icoBg = isSaudavel ? '#DCFCE7' : isAtencao ? '#FDE68A' : '#FECACA';
              const cor = isSaudavel ? '#16A34A' : isAtencao ? '#D97706' : '#EF4444';
              const titulo = isSaudavel ? 'Controle saudável do orçamento'
                : isAtencao ? 'Próximo do limite definido'
                : `Orçamento ultrapassado em ${excesso}%`;
              const subtexto = isSaudavel ? 'Seu padrão de gastos está dentro do planejado.'
                : isAtencao ? 'Pequenos ajustes podem evitar exceder o orçamento.'
                : 'Revise categorias variáveis e priorize gastos essenciais.';
              const icoPath = isSaudavel
                ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                : isAtencao
                ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>;
              return (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icoPath}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: cor, marginBottom: 1 }}>{titulo}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>{subtexto}</div>
                  </div>
                </div>
              );
            })()}

            {/* Links rodapé */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver análise →</span>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, cursor: 'pointer', border: '0.5px solid #E5E7EB', padding: '3px 8px', borderRadius: 6 }} onClick={() => setModalTeto(true)}>Ajustar teto</span>
            </div>
          </div>

          {/* Reserva de Segurança — card premium */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Header: ícone + título + badge status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    {(D.reserva?.mesesCobertos || 0) >= 3 && <polyline points="9 12 11 14 15 10"/>}
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em' }}>Segurança</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>Reserva de Segurança</div>
                </div>
              </div>
              {/* Badge status dinâmico */}
              {(() => {
                const m = D.reserva?.mesesCobertos || 0;
                const bg = m < 1 ? '#FEF2F2' : m < 3 ? '#FEF3C7' : m < 6 ? '#F0FDF4' : '#EFF6FF';
                const cor = m < 1 ? '#EF4444' : m < 3 ? '#D97706' : m < 6 ? '#16A34A' : '#2563EB';
                const txt = m < 1 ? 'Prioridade alta' : m < 3 ? 'Em evolução' : m < 6 ? 'Boa proteção' : 'Meta alcançada';
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: cor, padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cor }} />
                    {txt}
                  </div>
                );
              })()}
            </div>

            {/* Valor principal + mini info gasto/meta */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: (D.reserva?.valor || 0) > 0 ? ((D.reserva?.mesesCobertos || 0) >= 3 ? '#16A34A' : (D.reserva?.mesesCobertos || 0) >= 1 ? '#D97706' : '#EF4444') : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>
                  {fmt(D.reserva?.valor)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: (D.reserva?.mesesCobertos || 0) < 1 ? '#EF4444' : (D.reserva?.mesesCobertos || 0) < 3 ? '#D97706' : '#16A34A', whiteSpace: 'nowrap' }}>
                  {(D.reserva?.mesesCobertos || 0) < 1
                    ? <><b>Menos de 1 mês</b> protegido</>
                    : <><b>{(D.reserva?.mesesCobertos || 0).toFixed(1)} meses</b> protegidos</>}
                </div>
              </div>
              {/* Mini bloco gasto essencial + meta */}
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {(() => {
                    const faltam = Math.max(0, (D.reserva?.metaValor || 0) - (D.reserva?.valor || 0));
                    const m = D.reserva?.mesesCobertos || 0;
                    const cor = m < 1 ? '#EF4444' : m < 3 ? '#D97706' : '#16A34A';
                    const icoBg = m < 1 ? '#FEF2F2' : m < 3 ? '#FEF3C7' : '#F0FDF4';
                    return (
                      <>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>Faltam para meta</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: faltam > 0 ? cor : '#16A34A' }}>{faltam > 0 ? fmt(faltam) : 'Meta atingida!'}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Barra de progresso global */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em' }}>Progresso da meta</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(Math.max(isFinite(D.reserva?.pctMeta) ? D.reserva.pctMeta : 0, 0), 100)}%`, background: (D.reserva?.mesesCobertos || 0) < 1 ? '#EF4444' : (D.reserva?.mesesCobertos || 0) < 3 ? '#F59E0B' : '#16A34A', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: (D.reserva?.mesesCobertos || 0) < 1 ? '#EF4444' : (D.reserva?.mesesCobertos || 0) < 3 ? '#D97706' : '#16A34A', whiteSpace: 'nowrap' }}>
                  {Math.round(isFinite(D.reserva?.pctMeta) ? D.reserva.pctMeta : 0)}%
                </span>
              </div>
            </div>

            {/* Blocos de proteção — 6 meses */}
            {(() => {
              const META_MESES = 6;
              const mesesCobertos = D.reserva?.mesesCobertos || 0;
              const mesesInteiros = Math.floor(mesesCobertos);
              const fracao = mesesCobertos - mesesInteiros;
              const corBloco = mesesCobertos < 1 ? { bg: '#FEF2F2', border: '#FECACA', txt: '#EF4444' }
                : mesesCobertos < 3 ? { bg: '#FEF3C7', border: '#FDE68A', txt: '#D97706' }
                : { bg: '#F0FDF4', border: '#86EFAC', txt: '#16A34A' };
              return (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Sua proteção em meses</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: META_MESES }).map((_, i) => {
                      const cheio = i < mesesInteiros;
                      // quando mesesCobertos < 1, o primeiro bloco é parcial com fracao = mesesCobertos
                      const fracaoReal = mesesCobertos < 1 ? mesesCobertos : fracao;
                      const parcial = mesesCobertos < 1 ? i === 0 : (i === mesesInteiros && fracao > 0);
                      const vazio = !cheio && !parcial;
                      const pct = mesesCobertos < 1 ? Math.round(mesesCobertos * 100) : Math.round(fracaoReal * 100);
                      return (
                        <div key={i} style={{ flex: 1, borderRadius: 6, padding: '4px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${cheio || parcial ? corBloco.border : '#E5E7EB'}`, background: cheio ? corBloco.bg : parcial ? `linear-gradient(to right, ${corBloco.bg} ${pct}%, #F8FAFC ${pct}%)` : '#F8FAFC' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: cheio ? corBloco.txt : parcial ? corBloco.txt : '#D1D5DB' }}>{i + 1}</span>
                          <span style={{ fontSize: 8, color: cheio ? corBloco.txt : '#D1D5DB' }}>{i === 0 ? 'mês' : 'meses'}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insight cruzado dinâmico por estado */}
                  {(() => {
                    const isCritico  = mesesCobertos < 1;
                    const isAtencao  = mesesCobertos >= 1 && mesesCobertos < 3;
                    const isSaudavel = mesesCobertos >= 3 && mesesCobertos < 6;
                    const isCompleto = mesesCobertos >= 6;

                    // CRÍTICO — cruzamento com maior gasto
                    if (isCritico) {
                      const maiorVal  = D.maiorGasto?.valor || 0;
                      const maiorNome = D.maiorGasto?.descricao || D.maiorGasto?.nome || 'seu maior gasto';
                      const reservaVal = D.reserva?.valor || 0;
                      const multiplicador = reservaVal > 0 ? Math.round(maiorVal / reservaVal) : null;
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginTop: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#EF4444', marginBottom: 2 }}>Reserva vs maior gasto</div>
                            <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>
                              {maiorNome} ({fmt(maiorVal)}) é{multiplicador ? <span style={{ fontWeight: 600, color: '#EF4444' }}> {multiplicador}x maior</span> : ' maior'} que sua reserva. Um imprevisto comprometeria tudo.
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ATENÇÃO — cruzamento com saldo positivo
                    if (isAtencao) {
                      const saldoVal = D.saldo?.valor || 0;
                      const gastoEssencial = D.reserva?.metaValor ? D.reserva.metaValor / 6 : 0;
                      const metade = Math.round(saldoVal / 2);
                      const mesesGanhos = gastoEssencial > 0 ? (metade / gastoEssencial).toFixed(1) : null;
                      if (saldoVal > 0) {
                        return (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginTop: 6 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#D97706', marginBottom: 2 }}>Oportunidade de aporte</div>
                              <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>
                                Seu saldo este mês foi <span style={{ fontWeight: 600 }}>{fmt(saldoVal)}</span>. Aportar metade (<span style={{ fontWeight: 600, color: '#D97706' }}>{fmt(metade)}</span>) aceleraria{mesesGanhos ? <span> sua reserva em <span style={{ fontWeight: 600 }}>{mesesGanhos} meses</span></span> : ' sua reserva'}.
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    // SAUDÁVEL — projeção temporal
                    if (isSaudavel) {
                      const faltam = Math.max(0, (D.reserva?.metaValor || 0) - (D.reserva?.valor || 0));
                      const ritmo  = D.reserva?.variacao || 0;
                      if (faltam > 0 && ritmo > 0) {
                        const mesesParaMeta  = Math.ceil(faltam / ritmo);
                        const dataProjetada  = new Date(ano, mes - 1 + mesesParaMeta, 1);
                        const mesProjetado   = MESES_ABREV[dataProjetada.getMonth()];
                        const anoProjetado   = dataProjetada.getFullYear();
                        return (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginTop: 6 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', marginBottom: 2 }}>Projeção da meta</div>
                              <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>
                                Na média atual, você atingirá <span style={{ fontWeight: 600 }}>6 meses de proteção</span> em <span style={{ fontWeight: 600, color: '#16A34A' }}>{mesProjetado}/{anoProjetado}</span>. Continue assim!
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    // COMPLETO — cruzamento com investimentos
                    if (isCompleto) {
                      const patrimonio     = D.investimentos?.patrimonioTotal || 0;
                      const gastoEssencial = D.reserva?.metaValor ? D.reserva.metaValor / 6 : 0;
                      const mesesTotal     = gastoEssencial > 0 ? Math.round((patrimonio + (D.reserva?.valor || 0)) / gastoEssencial) : null;
                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginTop: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#2563EB', marginBottom: 2 }}>Reserva + investimentos</div>
                            <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>
                              Somando seu patrimônio de <span style={{ fontWeight: 600 }}>{fmt(patrimonio)}</span>, você tem cobertura real de{mesesTotal ? <span style={{ fontWeight: 600, color: '#2563EB' }}> {mesesTotal} meses</span> : ' longo prazo'}. Segurança sólida!
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              );
            })()}

            {/* Variação vs mês anterior */}
            {D.reserva?.estado === 'crescendo' && (
              <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ color: '#16A34A' }}>↑</span> +{fmt(D.reserva?.variacao)} vs mês anterior
              </div>
            )}
            {D.reserva?.estado === 'reduzindo' && (
              <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ color: '#EF4444' }}>↓</span> -{fmt(Math.abs(D.reserva?.variacao))} vs mês anterior
              </div>
            )}

            {/* Insight preditivo */}
            {(() => {
              const faltam = Math.max(0, (D.reserva?.metaValor || 0) - (D.reserva?.valor || 0));
              const ritmo = D.reserva?.variacao || 0;
              if (faltam <= 0 || ritmo <= 0) return null;
              const mesesParaMeta = Math.ceil(faltam / ritmo);
              if (mesesParaMeta > 120) return null;
              const dataProjetada = new Date(ano, mes - 1 + mesesParaMeta, 1);
              const mesProjetado = MESES_ABREV[dataProjetada.getMonth()];
              const anoProjetado = dataProjetada.getFullYear();
              return (
                <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Na média atual, meta em <span style={{ color: '#6B7280', fontWeight: 500, marginLeft: 3 }}>{mesProjetado}/{anoProjetado}</span>
                </div>
              );
            })()}

            {/* Links rodapé */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/reserva')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Ver detalhes →
              </span>
              <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 500, cursor: 'pointer', border: '0.5px solid #E5E7EB', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/reserva')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                Ver plano da reserva
              </span>
            </div>

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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '6px 0', borderTop: '0.5px solid #F3F4F6', marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icoPath}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: cor, marginBottom: 1 }}>{titulo}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.4 }}>{subtexto}</div>
                  </div>
                </div>
              );
            })()}

            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/saidas')}>Ver análise do cartão →</span>
          </div>

          {/* Investimentos — card premium com gráfico de linha */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            {/* Faixa azul topo */}
            <div style={{ height: 6, background: '#2563EB', width: '100%', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 14 }}>

              {/* Label com ícone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                </svg>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '.06em' }}>Investimentos</div>
              </div>

              {/* 3 KPIs — sem ícones, tipografia protagonista, separadores verticais */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', gap: 0, marginBottom: 16, alignItems: 'stretch' }}>

                {/* Patrimônio Total */}
                <div style={{ paddingRight: 16, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Patrimônio Total</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: (D.investimentos?.patrimonioTotal || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>{fmt(D.investimentos?.patrimonioTotal)}</div>
                  <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {D.investimentos?.patrimonioVsMes > 0 ? '↑' : D.investimentos?.patrimonioVsMes < 0 ? '↓' : '—'}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{D.investimentos?.patrimonioVsMes !== 0 ? `+${fmt(D.investimentos?.patrimonioVsMes)} (${D.investimentos?.patrimonioVsMesPct > 0 ? '+' : ''}${D.investimentos?.patrimonioVsMesPct}%) em ${MESES_ABREV[mes <= 1 ? 11 : mes - 2]}` : 'sem variação'}</span>
                  </div>
                  {(() => {
                    const hist = (D.investimentos?.patrimonioHistorico || []).filter(p => p?.valor > 0);
                    const mesesCrescendo = hist.length >= 2 ? hist.filter((p, i) => i > 0 && p.valor > hist[i-1].valor).length : 0;
                    if (mesesCrescendo < 2) return null;
                    return (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: '#F0FDF4', color: '#16A34A', marginTop: 6 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        {mesesCrescendo} meses crescendo
                      </div>
                    );
                  })()}
                </div>

                {/* Separador vertical */}
                <div style={{ background: '#E5E7EB', alignSelf: 'stretch' }} />

                {/* Aporte */}
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Aporte em {MESES_ABREV[mes - 1]}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: (D.investimentos?.aporteMes || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 4 }}>{fmt(D.investimentos?.aporteMes)}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtP(D.investimentos?.aportePctRenda)} da renda</div>
                  {(() => {
                    const semAporte = (D.investimentos?.aporteMes || 0) === 0;
                    const hist = (D.investimentos?.patrimonioHistorico || []).filter(p => p?.valor > 0);
                    const mesesSemAporte = hist.filter(p => !p.aporte || p.aporte === 0).length;
                    if (semAporte && mesesSemAporte >= 2) return (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: '#FEF3C7', color: '#D97706', marginTop: 6 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {mesesSemAporte}m sem aporte
                      </div>
                    );
                    return (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: '#F0FDF4', color: '#16A34A', marginTop: 6 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                        Aporte realizado
                      </div>
                    );
                  })()}
                </div>

                {/* Separador vertical */}
                <div style={{ background: '#E5E7EB', alignSelf: 'stretch' }} />

                {/* Rentabilidade — período dinâmico no label */}
                <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                    Rentabilidade <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>· Jan–{MESES_ABREV[mes - 1]}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: (D.investimentos?.patrimonioVsAno || 0) > 0 ? '#16A34A' : '#9CA3AF', lineHeight: 1, marginBottom: 2 }}>
                    {D.investimentos?.patrimonioVsAno > 0 ? '+' : ''}{D.investimentos?.patrimonioVsAno}%
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', marginBottom: 2 }}>
                    +{fmt((D.investimentos?.patrimonioTotal || 0) - (D.investimentos?.patrimonioHistorico?.[0]?.valor || D.investimentos?.patrimonioTotal || 0))}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: '#F0FDF4', color: '#16A34A', marginTop: 6 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                    Acima da inflação
                  </div>
                </div>
              </div>

              {/* Linha separadora */}
              <div style={{ height: '0.5px', background: '#E5E7EB', margin: '0 0 14px' }} />

              {/* Gráfico de linha */}
              {(() => {
                const histRaw = (D.investimentos?.patrimonioHistorico || []).filter(p => p != null && p.valor > 0);
                if (histRaw.length < 2) return <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sem dados de evolução</div>;
                const hist = histRaw.filter((p, i) => i === 0 || p.valor !== histRaw[i-1].valor);
                const n = hist.length;
                const W = 460; const H = 85;
                const PAD_X = 20; const PAD_TOP = 24;
                const minV = Math.min(...hist.map(p => p.valor));
                const maxV = Math.max(...hist.map(p => p.valor));
                const rangeV = maxV - minV || 1;
                const xs = hist.map((_, i) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2));
                const ys = hist.map(p => PAD_TOP + (1 - (p.valor - minV) / rangeV) * (H - PAD_TOP - 5));
                const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${ys[i]}`).join(' ');
                const areaPath = linePath + ` L${xs[n-1]} ${H} L${xs[0]} ${H} Z`;
                return (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                      Evolução do patrimônio • {ano}
                    </div>
                    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12"/>
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#invGrad)"/>
                      <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {hist.map((p, i) => {
                        const isLast = i === n - 1;
                        const val = Math.round(p.valor).toLocaleString('pt-BR');
                        return (
                          <g key={i}>
                            <circle cx={xs[i]} cy={ys[i]} r={isLast ? 5.5 : 4} fill="#2563EB" stroke={isLast ? '#fff' : 'none'} strokeWidth={isLast ? 2 : 0}/>
                            <text x={xs[i]} y={ys[i] - 8} fontSize="10" fill={isLast ? '#16A34A' : '#9CA3AF'} fontWeight={isLast ? '700' : '500'} textAnchor="middle">{val}</text>
                          </g>
                        );
                      })}
                    </svg>
                    {/* Rendimentos por mês alinhados aos pontos X */}
                    <div style={{ position: 'relative', height: 36, marginTop: 2, marginBottom: 10 }}>
                      {hist.map((p, i) => {
                        const varTotal = i > 0 ? p.valor - hist[i-1].valor : null;
                        const rendeu = varTotal !== null ? varTotal - (p.aporte || 0) : null;
                        const pct = i > 0 && hist[i-1].valor > 0 ? ((p.valor / hist[i-1].valor - 1) * 100).toFixed(1) : null;
                        const posLeft = `${(xs[i] / W) * 100}%`;
                        return (
                          <div key={i} style={{ position: 'absolute', left: posLeft, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{MESES_ABREV[(p.mes || 1) - 1]}</span>
                            {rendeu !== null ? (
                              <>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', whiteSpace: 'nowrap' }}>{rendeu >= 0 ? '+' : ''}{fmt(rendeu)}</span>
                                <span style={{ fontSize: 10, color: '#16A34A', whiteSpace: 'nowrap' }}>{pct !== null ? `${parseFloat(pct) >= 0 ? '+' : ''}${pct}%` : ''}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: 10, color: '#D1D5DB' }}>—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Linha separadora */}
              <div style={{ height: '0.5px', background: '#E5E7EB', margin: '10px 0' }} />

              {/* Objetivo anual — 3 blocos */}
              {(() => {
                const meta = 60000;
                const atual = D.investimentos?.patrimonioTotal || 0;
                const faltam = Math.max(0, meta - atual);
                const pctMeta = Math.min(Math.round((atual / meta) * 100), 100);
                const hist = (D.investimentos?.patrimonioHistorico || []).filter(p => p?.valor > 0);
                const rendMedio = hist.length >= 2
                  ? hist.slice(1).reduce((acc, p, i) => acc + (p.valor - hist[i].valor - (p.aporte || 0)), 0) / (hist.length - 1)
                  : 0;
                const mesesParaMeta = rendMedio > 0 ? Math.ceil(faltam / rendMedio) : null;
                const dataProj = mesesParaMeta ? new Date(ano, mes - 1 + mesesParaMeta, 1) : null;
                const mesProj = dataProj ? MESES_ABREV[dataProj.getMonth()] : null;
                const anoProj = dataProj ? dataProj.getFullYear() : null;
                const dash = 94.25;
                const offset = dash - (pctMeta / 100) * dash;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '9px 11px' }}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                        Objetivo anual
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{fmt(meta)}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Meta {ano}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="40" height="40" viewBox="0 0 38 38" style={{ flexShrink: 0 }}>
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                        <circle cx="19" cy="19" r="15" fill="none" stroke="#2563EB" strokeWidth="3"
                          strokeDasharray={dash} strokeDashoffset={offset}
                          strokeLinecap="round" transform="rotate(-90 19 19)"/>
                        <text x="19" y="23" fontSize="9" fill="#2563EB" fontWeight="700" textAnchor="middle">{pctMeta}%</text>
                      </svg>
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Progresso atual</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{fmt(atual)}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>Faltam {fmt(faltam)}</div>
                      </div>
                    </div>
                    <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '9px 11px' }}>
                      <div style={{ fontSize: 11, color: '#2563EB', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Projeção
                      </div>
                      {mesProj ? (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB' }}>Meta em {mesProj}/{anoProj}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Ritmo: ~{fmt(rendMedio)}/mês</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>Sem projeção</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Adicione aportes</div>
                        </>
                      )}
                    </div>
                  </div>
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

        {/* ROW 4 – linha inferior */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1fr)', gap: 10, marginBottom: 10 }}>

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
              <div style={{ background: '#EFF6FF', borderRadius: 7, padding: '10px 12px', fontSize: 12, color: '#1D4ED8', lineHeight: 1.5, marginBottom: 16 }}>
                Com renda de {fmt(D.entradas?.valor || 0)}, um teto de {fmt(valorTeto)} deixa {fmt(Math.max(0, (D.entradas?.valor || 0) - valorTeto))} de margem.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setModalTeto(false)} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button onClick={handleSalvarTeto} disabled={salvandoTeto} style={{ flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: salvandoTeto ? 'not-allowed' : 'pointer', opacity: salvandoTeto ? 0.7 : 1, fontFamily: 'inherit' }}>{salvandoTeto ? 'Salvando…' : 'Salvar teto'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}