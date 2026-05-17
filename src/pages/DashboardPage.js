import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ── 
const fmt  = v => 'R$ ' + Math.round(Math.abs(v ?? 0)).toLocaleString('pt-BR');
const fmtS = v => (v >= 0 ? '+' : '-') + 'R$ ' + Math.abs(Math.round(v ?? 0)).toLocaleString('pt-BR');
const fmtP = v => (v ?? 0).toFixed(1) + '%';

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
  cardLink:{ fontSize: 12, color: '#3B82F6', cursor: 'pointer', marginTop: 8, display: 'block' },
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
  const pos = reverse ? val < 0 : val >= 0;
  const cor = pos ? '#16A34A' : '#EF4444';
  return (
    <div style={{ fontSize: 12, fontWeight: 500, color: cor, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
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
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#16A34A', borderRadius: '10px 10px 0 0' }} />
      <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Análise mensal</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Saldo por mês · 2026</div>
        <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver fluxo →</span>
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Evolução do saldo acumulado mês a mês</div>
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

      <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 22, position: 'relative', marginBottom: 6 }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 12, borderTop: '0.5px solid #F3F4F6' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ cor: '#86EFAC', txt: 'Positivo' }, { cor: '#FCA5A5', txt: 'Negativo' }, { cor: '#F1F5F9', txt: 'Sem dados' }].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.cor }} />{l.txt}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: acum >= 0 ? '#16A34A' : '#EF4444' }}>Acumulado: {fmtS(acum)}</div>
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
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }} onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#3B82F6', borderRadius: '10px 10px 0 0' }} />
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
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#F59E0B', borderRadius: '10px 10px 0 0' }} />
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

        {/* ROW 1 — grid 4 colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>

          {/* Card triplo: Entradas / Saídas / Saldo */}
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
              {/* Esquerda: Entradas em cima, Saídas embaixo */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 3, background: '#16A34A' }} />
                <div style={{ padding: '16px 18px', flex: 1, borderBottom: '0.5px solid #E5E7EB', borderRight: '0.5px solid #E5E7EB' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Ico.up} Entradas
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: '#111827', lineHeight: 1, marginBottom: 4 }}>{fmt(D.entradas?.valor)}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{D.entradas?.sub || 'Salário + extras'}</div>
                  <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 500 }}>
                    {(D.entradas?.tendencia ?? 0) >= 0 ? '↑' : '↓'} {(D.entradas?.tendencia ?? 0) >= 0 ? '+' : ''}{D.entradas?.tendencia ?? 0}% vs mês anterior
                  </div>
                </div>
                <div style={{ padding: '16px 18px', flex: 1, borderRight: '0.5px solid #E5E7EB' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Ico.down} Saídas
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: '#EF4444', lineHeight: 1, marginBottom: 4 }}>{fmt(D.saidas?.valor)}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Total de gastos</div>
                  <div style={{ fontSize: 11, color: (D.saidas?.tendencia ?? 0) <= 0 ? '#16A34A' : '#EF4444', fontWeight: 500 }}>
                    {(D.saidas?.tendencia ?? 0) <= 0 ? '↓' : '↑'} {(D.saidas?.tendencia ?? 0) >= 0 ? '+' : ''}{D.saidas?.tendencia ?? 0}% vs mês anterior
                  </div>
                </div>
                <div style={{ height: 3, background: '#EF4444' }} />
              </div>
              {/* Direita: Saldo em destaque */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>$ Saldo do mês</div>
                <div style={{ fontSize: 30, fontWeight: 500, color: (D.saldo?.valor ?? 0) >= 0 ? '#16A34A' : '#EF4444', lineHeight: 1 }}>{(D.saldo?.valor ?? 0) >= 0 ? '+' : ''}{fmt(D.saldo?.valor)}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtP(D.saldo?.pctRenda)} da renda guardada</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: (D.saldo?.valor ?? 0) >= 0 ? '#F0FDF4' : '#FEF2F2', border: `0.5px solid ${(D.saldo?.valor ?? 0) >= 0 ? '#BBF7D0' : '#FECACA'}`, fontSize: 11, color: (D.saldo?.valor ?? 0) >= 0 ? '#16A34A' : '#EF4444', fontWeight: 500, width: 'fit-content' }}>
                  {(D.saldo?.valor ?? 0) >= 0 ? '↑ Superávit no mês' : '↓ Déficit no mês'}
                </div>
                {D.saldo?.melhorMes && <div style={{ fontSize: 11, color: '#3B82F6', fontWeight: 500 }}>Melhor mês do ano</div>}
                <span style={{ ...S.cardLink, marginTop: 4 }} onClick={() => navigate('/fluxo-anual')}>Ver evolução do saldo →</span>
              </div>
            </div>
          </div>

          {/* Limite Restante */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#F59E0B' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 3 }}>Orçamento</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>Limite Restante {Ico.info}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>Disponível no mês</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#F59E0B', lineHeight: 1, marginBottom: 8 }}>{fmt(D.limiteRestante?.valor)}</div>
            <ProgressBar pct={D.limiteRestante?.teto > 0 ? Math.min(Math.max(isFinite(D.limiteRestante?.pctRestante) ? 100 - D.limiteRestante.pctRestante : 0, 0), 100) : 0} color="#F59E0B" />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>{fmtP(D.limiteRestante?.pctRestante)} do teto · {fmt(D.limiteRestante?.teto)}/mês</div>
            <span style={S.cardLink} onClick={() => navigate('/fluxo-anual')}>Ver planejamento →</span>
          </div>

          {/* Teto de Gastos */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#F59E0B' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 3 }}>Controle</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>Teto de Gastos {Ico.info}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: gaugePct < 80 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444', lineHeight: 1, marginBottom: 3 }}>{Math.round(gaugePct)}%</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>do orçamento utilizado</div>
            <div style={{ height: 5, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min(gaugePct, 100)}%`, background: gaugePct < 80 ? '#16A34A' : gaugePct < 100 ? '#F59E0B' : '#EF4444', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
              <span>Gasto: <span style={{ color: '#EF4444', fontWeight: 600 }}>{fmt(D.saidas?.valor)}</span></span>
              <span>Teto: {fmt(D.tetoGastos?.teto)}</span>
            </div>
            {gaugePct >= 100
              ? <div style={S.badge('#FEE2E2', '#DC2626')}>{Ico.warn} Teto ultrapassado!</div>
              : <div style={S.badge('#FEF3C7', '#D97706')}>{Ico.warn} Atenção — {Math.round(gaugePct)}% usado</div>}
            <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, cursor: 'pointer' }} onClick={() => setModalTeto(true)}>
              {Ico.gear} Alterar teto mensal
            </div>
          </div>

          {/* Maior Gasto */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 3 }}>Destaque</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 8 }}>{Ico.warn} Maior Gasto</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{D.maiorGasto?.nome || '—'}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#EF4444', lineHeight: 1, marginBottom: 6 }}>{fmt(D.maiorGasto?.valor)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{fmtP(D.maiorGasto?.pctSaidas)} das saídas de {MESES_ABREV[mes-1]}</div>
            <Trend val={D.maiorGasto?.tendencia} suffix={`% vs ${MESES_ABREV[mes <= 1 ? 11 : mes - 2]}`} />
            <div style={{ ...S.badge('#FEE2E2', '#DC2626'), marginTop: 6 }}>{Ico.warn} Alto impacto</div>
            <span style={S.cardLink} onClick={() => navigate('/saidas')}>Ver análise do cartão →</span>
          </div>
        </div>

        {/* ROW 2 — grid 4 colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>

          {/* Investimentos duplo */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#2563EB' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563EB"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
              Investimentos {Ico.info}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Aporte do mês</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#2563EB', lineHeight: 1, marginBottom: 3 }}>{fmt(D.investimentos?.aporteMes)}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{fmtP(D.investimentos?.aportePctRenda)} da renda</div>
                <ProgressBar pct={D.investimentos?.aportePctRenda || 0} color="#3B82F6" />
                <div style={{ fontSize: 11, color: (D.investimentos?.aporteVsAnterior ?? 0) >= 0 ? '#16A34A' : '#EF4444', fontWeight: 500, marginBottom: 6 }}>
                  {(D.investimentos?.aporteVsAnterior ?? 0) >= 0 ? '↑' : '↓'} {(D.investimentos?.aporteVsAnterior ?? 0) >= 0 ? '+' : ''}{fmt(D.investimentos?.aporteVsAnterior)} vs {MESES_ABREV[mes <= 1 ? 11 : mes - 2]}
                </div>
                <span style={S.cardLink} onClick={() => navigate('/investimentos')}>Ver histórico →</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Patrimônio total</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#2563EB', lineHeight: 1, marginBottom: 3 }}>{fmt(D.investimentos?.patrimonioTotal)}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>Total acumulado</div>
                <ProgressBar pct={Math.min(Math.max(isFinite(D.investimentos?.patrimonioVsAno) ? D.investimentos.patrimonioVsAno : 0, 0), 100)} color="#3B82F6" />
                <div style={{ fontSize: 11, color: (D.investimentos?.patrimonioVsMes ?? 0) >= 0 ? '#16A34A' : '#EF4444', fontWeight: 500, marginBottom: 3 }}>
                  {(D.investimentos?.patrimonioVsMes ?? 0) >= 0 ? '↑' : '↓'} {(D.investimentos?.patrimonioVsMes ?? 0) >= 0 ? '+' : ''}{fmt(D.investimentos?.patrimonioVsMes)}{D.investimentos?.patrimonioVsMesPct != null ? ` (${D.investimentos.patrimonioVsMesPct >= 0 ? '+' : ''}${D.investimentos.patrimonioVsMesPct}%)` : ''} em {MESES_ABREV[mes <= 1 ? 11 : mes - 2]}
                </div>
                <div style={{ fontSize: 11, color: (D.investimentos?.patrimonioVsAno ?? 0) >= 0 ? '#16A34A' : '#EF4444', fontWeight: 500, marginBottom: 6 }}>
                  {(D.investimentos?.patrimonioVsAno ?? 0) >= 0 ? '↑' : '↓'} {(D.investimentos?.patrimonioVsAno ?? 0) >= 0 ? '+' : ''}{D.investimentos?.patrimonioVsAno}% em {ano}
                </div>
                <span style={S.cardLink} onClick={() => navigate('/investimentos')}>Ver carteira →</span>
              </div>
            </div>
          </div>

          {/* Reserva de Segurança */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#16A34A' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 3 }}>Segurança</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#0F766E"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              Reserva {Ico.info}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>Saldo acumulado</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#0F766E', lineHeight: 1, marginBottom: 3 }}>{fmt(D.reserva?.valor)}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{fmtP(D.reserva?.pctMeta)} da meta · {D.reserva?.mesesCobertos} meses</div>
            <ProgressBar pct={Math.min(Math.max(isFinite(D.reserva?.pctMeta) ? D.reserva.pctMeta : 0, 0), 100)} color="#16A34A" />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
              {(D.reserva?.pctMeta ?? 0) >= 100
                ? 'Meta atingida ✓'
                : `Faltam ${fmt((D.reserva?.metaValor || 0) - (D.reserva?.valor || 0))} para a meta`}
            </div>
            {D.reserva?.estado === 'crescendo' && <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 500 }}>↑ +{fmt(D.reserva?.variacao)} vs mês anterior</div>}
            {D.reserva?.estado === 'reduzindo' && <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 500 }}>↓ {fmt(D.reserva?.variacao)} vs mês anterior</div>}
            {D.reserva?.estado === 'zerado' && <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 500 }}>Sem reserva de emergência</div>}
            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/reserva')}>Ver detalhes →</span>
          </div>

          {/* Reserva em dia — visual */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#16A34A' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', alignSelf: 'flex-start', marginTop: 4 }}>Cobertura</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', alignSelf: 'flex-start', marginBottom: 6 }}>Reserva em dia</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i < Math.floor(D.reserva?.mesesCobertos || 0) ? '#16A34A' : '#F1F5F9' }} />
              ))}
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#111827' }}>{D.reserva?.mesesCobertos || 0} <span style={{ fontSize: 13, color: '#9CA3AF' }}>de 6 meses</span></div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>cobertura de emergência</div>
            {(D.reserva?.mesesCobertos || 0) < 3
              ? <div style={S.badge('#FEE2E2', '#DC2626')}>● Crítico</div>
              : (D.reserva?.mesesCobertos || 0) < 6
              ? <div style={S.badge('#FEF3C7', '#D97706')}>● Em progresso</div>
              : <div style={S.badge('#F0FDF4', '#16A34A')}>✓ Proteção ativa</div>}
            <span style={S.cardLink} onClick={() => navigate('/reserva')}>Ver reserva →</span>
          </div>

          {/* Metas Ativas */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#8B5CF6' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 3 }}>Progresso</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#8B5CF6"><path d="M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/></svg>
              Metas Ativas {Ico.info}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>Em andamento</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#8B5CF6', lineHeight: 1, marginBottom: 5 }}>{D.metasAtivas?.total ?? 0} metas</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>
              {D.metasAtivas?.total ? `${D.metasAtivas.total} meta${D.metasAtivas.total !== 1 ? 's' : ''} cadastrada${D.metasAtivas.total !== 1 ? 's' : ''}` : 'Nenhuma meta cadastrada'}
            </div>
            <span style={{ ...S.cardLink, marginTop: 'auto' }} onClick={() => navigate('/metas')}>Ver todas as metas →</span>
          </div>
        </div>

        {/* ROW 3 – Saldo gráfico + Categorias + Saude – 10 colunas alinhadas com ROW 1+2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 10, marginBottom: 10 }}>

          {/* GraficoSaldo span4 = mesma largura de Entradas+Saídas acima */}
          <GraficoSaldo meses={D.saldoPorMes} style={{ gridColumn: 'span 4' }} />

          {/* Categorias */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', gridColumn: 'span 3' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, marginTop: 4 }}>Distribuição</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Categorias vs Saldo</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{MESES_ABREV[mes - 1]}</div>
            </div>
            {/* Barra empilhada */}
            {(() => {
              const lista = D.categorias?.lista || [];
              const total = D.entradas?.valor || 0;
              const saidas = D.categorias?.total || 0;
              const saldoRestante = Math.max(0, total - saidas);
              const saldoPct = total > 0 ? Math.round((saldoRestante / total) * 100) : 0;
              return (
                <>
                  <div style={{ display: 'flex', height: 18, borderRadius: 5, overflow: 'hidden', gap: 1, marginBottom: 12 }}>
                    {lista.map((c, i) => (
                      <div key={i} title={`${c.nome}: ${c.pct}%`} style={{ width: `${(c.valor / total) * 100}%`, background: c.cor, minWidth: c.pct > 2 ? 2 : 0 }} />
                    ))}
                    {saldoRestante > 0 && (
                      <div style={{ flex: 1, background: '#16A34A', minWidth: 3 }} title={`Saldo: ${saldoPct}%`} />
                    )}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {lista.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '0.5px solid #F9FAFB' }}>
                          <td style={{ padding: '4px 0', width: 14, verticalAlign: 'middle' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: c.cor }} />
                          </td>
                          <td style={{ padding: '4px 6px', fontSize: 12, color: '#6B7280', verticalAlign: 'middle' }}>{c.nome}</td>
                          <td style={{ padding: '4px 0', fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{fmt(c.valor)}</td>
                          <td style={{ padding: '4px 0 4px 8px', fontSize: 11, color: '#9CA3AF', textAlign: 'right', verticalAlign: 'middle', width: 34 }}>{c.pct}%</td>
                        </tr>
                      ))}
                      {saldoRestante > 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', verticalAlign: 'middle' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#16A34A' }} />
                          </td>
                          <td style={{ padding: '4px 6px', fontSize: 12, color: '#16A34A', fontWeight: 500, verticalAlign: 'middle' }}>Saldo restante</td>
                          <td style={{ padding: '4px 0', fontSize: 12, fontWeight: 600, color: '#16A34A', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{fmt(saldoRestante)}</td>
                          <td style={{ padding: '4px 0 4px 8px', fontSize: 11, color: '#16A34A', textAlign: 'right', verticalAlign: 'middle', width: 34 }}>{saldoPct}%</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#6B7280' }}>Total saídas</span>
                    <span style={{ fontWeight: 700, color: '#DC2626' }}>{fmt(saidas)}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Tendência trimestral */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden', gridColumn: 'span 3' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#6D28D9', borderRadius: '10px 10px 0 0' }} />
            {(() => {
              const mesesAbrev = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
              const t3 = (D.trimestre || []).map((d, i) => ({
                lbl: mesesAbrev[d.mes - 1],
                e: d.entradas, s: d.saidas, inv: d.aportes, res: d.reserva,
                atual: i === 2,
              }));
              if (t3.length < 3) return null;
              const mediaE   = Math.round(t3.reduce((a, m) => a + m.e,   0) / 3);
              const mediaS   = Math.round(t3.reduce((a, m) => a + m.s,   0) / 3);
              const mediaInv = Math.round(t3.reduce((a, m) => a + m.inv, 0) / 3);
              const mediaRes = Math.round(t3.reduce((a, m) => a + m.res, 0) / 3);
              const maxE   = Math.max(...t3.map(m => m.e),   1);
              const maxS   = Math.max(...t3.map(m => m.s),   1);
              const maxInv = Math.max(...t3.map(m => m.inv), 1);
              const maxRes = Math.max(...t3.map(m => m.res), 1);
              const metricas = [
                { lbl: 'Entradas',      cor: '#16A34A', corLight: '#BBF7D0', vals: t3.map(m => ({ v: m.e,   h: Math.round((m.e   / maxE)   * 100), lbl: m.lbl, atual: m.atual })), media: fmt(mediaE)   + '/mês' },
                { lbl: 'Saídas',        cor: '#EF4444', corLight: '#FECACA', vals: t3.map(m => ({ v: m.s,   h: Math.round((m.s   / maxS)   * 100), lbl: m.lbl, atual: m.atual })), media: fmt(mediaS)   + '/mês' },
                { lbl: 'Investimentos', cor: '#2563EB', corLight: '#DBEAFE', vals: t3.map(m => ({ v: m.inv, h: Math.round((m.inv / maxInv) * 100), lbl: m.lbl, atual: m.atual })), media: fmt(mediaInv) + '/mês' },
                { lbl: 'Reserva',       cor: '#8B5CF6', corLight: '#DDD6FE', vals: t3.map(m => ({ v: m.res, h: Math.round((m.res / maxRes) * 100), lbl: m.lbl, atual: m.atual })), media: fmt(mediaRes) + '/mês' },
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
                        <span style={{ fontSize: 11, fontWeight: 600, color: m.cor }}>{m.media}</span>
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
                    <span style={{ color: '#6B7280' }}>Saldo médio/mês</span>
                    <span style={{ fontWeight: 600, color: mediaE - mediaS >= 0 ? '#16A34A' : '#EF4444' }}>{mediaE - mediaS >= 0 ? '+' : ''}{fmt(mediaE - mediaS)}</span>
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: r.cor }}>{r.val}</span>
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: r.cor }}>{r.val}</span>
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

          {/* Metas em andamento */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#8B5CF6', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Progresso</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Metas em andamento</div>
              <span style={{ fontSize: 12, color: '#3B82F6', cursor: 'pointer' }} onClick={() => navigate('/metas')}>Ver todas →</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>Acompanhe o progresso das suas metas financeiras</div>
            {(D.metasAndamento || []).map((m, i) => (
              <div key={i} style={{ padding: '7px 0', borderBottom: i < (D.metasAndamento.length - 1) ? '0.5px solid #F3F4F6' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.nome}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: m.cor }}>{m.pct}%</span>
                </div>
                <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: m.ctxCor, marginTop: 2 }}>{m.ctx}</div>
              </div>
            ))}
          </div>

          {/* Score */}
          <ScoreGauge score={D.scoreFinanceiro} />
        </div>

        {/* RESUMO DO PERÍODO */}
        <div style={{ background: '#111827', borderRadius: 10, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', flexWrap: 'wrap', gap: 0, marginBottom: 4 }}>
          <div style={{ minWidth: 90, paddingRight: 18, borderRight: '1px solid rgba(255,255,255,.08)', paddingBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{R.titulo || 'Resumo'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1, marginBottom: 8 }}>{R.intervalo}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Diagnóstico</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FCD34D' }}>{R.diagnostico}</div>
          </div>
          {[
            { lbl: 'Entradas',               val: fmt(R.entradasTotal),                          sub: `Média/mês: ${fmt(R.entradasMediaMes)}` },
            { lbl: 'Saídas',                 val: fmt(R.saidasTotal),                            sub: `Média/mês: ${fmt(R.saidasMediaMes)}` },
            { lbl: 'Saldo',                  val: fmtS(R.saldoPeriodo || 0),                     sub: `Taxa de poupança: ${fmtP(R.taxaPoupancaPeriodo)}`, valCor: '#86EFAC' },
            { lbl: 'Do mês total',           val: fmtS(R.saldoMesSelecionado || 0),              sub: `Melhor mês: ${R.melhorMes}`, valCor: '#86EFAC' },
            { lbl: 'Saída que mais impactou', val: R.maiorImpactoNome,                           sub: `${fmt(R.maiorImpactoValor)} (${fmtP(R.maiorImpactoPercentual)})`, isCartao: true },
            { lbl: 'Investimentos',          val: fmt(R.investimentosPeriodo),                   sub: `${fmtP(R.investimentosPercentualRenda)} da renda` },
            { lbl: 'Patrimônio',             val: `+${R.patrimonioCrescimentoPercentual || 0}%`, sub: 'Crescimento no período', valCor: '#86EFAC' },
            { lbl: 'Score médio',            val: `${R.scoreMedio || 0}/100`,                    sub: null, valCor: '#FCD34D' },
            { lbl: 'Pior mês',               val: R.piorMes,                                     sub: null, valCor: '#FCA5A5' },
          ].map((item, i, arr) => (
            <div key={i} style={{ padding: '0 14px', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none', minWidth: 90 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{item.lbl}</div>
              {item.isCartao && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2zm-7 7h5v-2h-5v2z"/></svg>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{item.val}</div>
                </div>
              )}
              {!item.isCartao && <div style={{ fontSize: 14, fontWeight: 700, color: item.valCor || 'white', whiteSpace: 'nowrap' }}>{item.val}</div>}
              {item.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1, whiteSpace: 'nowrap' }}>{item.sub}</div>}
              {item.isCartao && item.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{item.sub}</div>}
            </div>
          ))}
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