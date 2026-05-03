import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  bar:     (w, bg) => ({ height: '100%', width: `${Math.min(w, 100)}%`, background: bg, borderRadius: 2 }),
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

function KpiCard({ accentColor, icon, label, value, valueColor, sub, trend, trendSuffix, trendReverse, children }) {
  return (
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
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
const PRIORIDADES_PMA = [
  { chave: 'reserva',   btn: 'Ver reserva' },
  { chave: 'teto',      btn: 'Ver planejamento' },
  { chave: 'maiorGasto',btn: 'Ver cartões' },
  { chave: 'meta',      btn: 'Ver metas' },
  { chave: 'poupanca',  btn: 'Ver planejamento' },
];

function PMA({ acaoAgora }) {
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
      <span style={{ fontSize: 12, color: '#93C5FD', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
function GraficoSaldo({ meses }) {
  const [tooltip, setTooltip] = useState(null);
  if (!meses?.length) meses = [];

  const comDados  = meses.filter(m => m.saldo != null);
  const positivos = comDados.filter(m => m.saldo >= 0).length;
  const negativos = comDados.filter(m => m.saldo < 0).length;
  const semDados  = 12 - comDados.length;
  const acum      = comDados.reduce((s, m) => s + (m.saldo || 0), 0);
  const absMax    = Math.max(...comDados.map(m => Math.abs(m.saldo || 0)), 1);
  const maxH      = 100;

  const dadosPorMes = MESES_ABREV.map((label, i) => {
    const found = meses.find(m => m.mes === i + 1);
    return { label, ...found };
  });

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Saldo por mês · 2026</div>
        <span style={S.cardLink}>Ver fluxo →</span>
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={S.pill('#F0FDF4', '#15803D')}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86EFAC' }} />{positivos} positivos</div>
        <div style={S.pill('#FEF2F2', '#991B1B')}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FCA5A5' }} />{negativos} negativo</div>
        <div style={S.pill('#F7F8FA', '#6B7280')}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />{semDados} sem dados</div>
      </div>

      <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 22, position: 'relative', marginBottom: 6 }}>
        {dadosPorMes.map((m, i) => {
          const fut = m.saldo == null;
          const pos = !fut && m.saldo >= 0;
          const cor = fut ? '#F1F5F9' : pos ? '#86EFAC' : '#EF4444';
          const corV = fut ? '#D1D5DB' : pos ? '#16A34A' : '#EF4444';
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '0.5px solid #F3F4F6' }}>
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

function RadarFinanceiro({ insights = [] }) {
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
    <div style={S.card} onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        Radar financeiro {Ico.info}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity .4s, transform .4s' }}>
        {[i1, i2].filter(Boolean).map((ins, i) => {
          const c = COR_RADAR[ins.tipo] || COR_RADAR.info;
          return (
            <div key={i} style={{ padding: '10px 11px', borderRadius: 8, border: `0.5px solid ${c.borda}`, background: c.bg }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: c.txt, marginBottom: 4 }}>{ins.cat}</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.45, marginBottom: 4 }}>{ins.txt}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', cursor: 'pointer' }}>{ins.cta} →</div>
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
  const s = score || 0;
  const cor = s >= 75 ? '#16A34A' : s >= 55 ? '#F59E0B' : '#EF4444';
  const st = scoreStatus(s);
  const sc = STATUS_COR[st];
  const arc = Math.round((s / 100) * 126);
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Score financeiro {Ico.info}</div>
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
      <span style={S.cardLink}>Entenda seu score →</span>
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
    investimentos: { aporteMes: 800, aportePctRenda: 19, aporteVsAnterior: 200, patrimonioTotal: 42000, patrimonioVsMes: 800, patrimonioVsAno: 12 },
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
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalTeto, setModalTeto] = useState(false);
  const [valorTeto, setValorTeto] = useState(7000);

  const carregarDados = useCallback(async (m, a) => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/completo?mes=${m}&ano=${a}`);
      setDados(res.data);
      if (res.data?.tetoGastos?.teto) setValorTeto(res.data.tetoGastos.teto);
    } catch (err) {
      console.warn('API indisponivel, usando dados mock:', err.message);
      setDados(mockData(m, a));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(mes, ano); }, [mes, ano, carregarDados]);

  const trocarPeriodo = (m, a) => { setMes(m); setAno(a); };

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

        {/* ROW 1 – Investimentos + Reserva + Metas + Limite */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>

          {/* Investimentos (duplo) */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
              Investimentos {Ico.info}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{ paddingRight: 14, borderRight: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>Aporte do mês {Ico.info}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#2563EB', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(D.investimentos?.aporteMes)}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{fmtP(D.investimentos?.aportePctRenda)} da renda do mês</div>
                <ProgressBar pct={D.investimentos?.aportePctRenda || 0} color="#3B82F6" />
                <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  {Ico.up} {fmt(D.investimentos?.aporteVsAnterior)} vs Março
                </div>
              </div>
              <div style={{ paddingLeft: 14 }}>
                <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>Patrimônio investido {Ico.info}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#2563EB', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(D.investimentos?.patrimonioTotal)}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Total acumulado</div>
                <ProgressBar pct={60} color="#3B82F6" />
                <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  {Ico.up} {fmt(D.investimentos?.patrimonioVsMes)} em Abril
                </div>
                <div style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  {Ico.up} {D.investimentos?.patrimonioVsAno}% em 2026
                </div>
              </div>
            </div>
          </div>

          {/* Reserva */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0F766E"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              Reserva de Segurança {Ico.info}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0F766E', letterSpacing: '-.5px', marginBottom: 3 }}>{fmt(D.reserva?.valor)}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{D.reserva?.pctMeta}% da meta · {D.reserva?.mesesCobertos} meses</div>
            <div style={{ height: 3, background: '#E0F2F1', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(D.reserva?.pctMeta || 0, 100)}%`, background: '#0F766E', borderRadius: 2 }} />
            </div>
            <span style={S.cardLink}>Ver detalhes da reserva →</span>
          </div>

          {/* Metas */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#6D28D9"><path d="M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/></svg>
              Metas Ativas {Ico.info}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6D28D9', letterSpacing: '-.5px', marginBottom: 3 }}>{D.metasAtivas?.total} metas</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{D.metasAtivas?.resumo}</div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
              {(D.metasAtivas?.barras || []).map((b, i) => (
                <div key={i} style={{ height: 3, flex: b.pct, background: b.cor, borderRadius: 1 }} />
              ))}
            </div>
            <span style={S.cardLink}>Ver todas as metas →</span>
          </div>

          {/* Limite */}
          <div style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#B45309', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#B45309"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2zm-7 7h5v-2h-5v2z"/></svg>
              Limite Restante {Ico.info}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#B45309', letterSpacing: '-.5px', marginBottom: 3 }}>{fmt(D.limiteRestante?.valor)}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{D.limiteRestante?.pctRestante}% do teto · {fmt(D.limiteRestante?.teto)}/mês</div>
            <div style={{ height: 3, background: '#FEF3C7', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(100 - (D.limiteRestante?.pctRestante || 0), 100)}%`, background: '#F59E0B', borderRadius: 2 }} />
            </div>
            <span style={S.cardLink}>Ver planejamento →</span>
          </div>
        </div>

        {/* ROW 2 – 5 KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 10, marginBottom: 10 }}>

          <KpiCard accentColor="#3B82F6" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#16A34A"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>} label="Entradas" value={fmt(D.entradas?.valor)} sub={D.entradas?.sub} trend={D.entradas?.tendencia} trendSuffix="% vs mês anterior" />

          <KpiCard accentColor="#EF4444" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#EF4444"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>} label="Saídas" value={fmt(D.saidas?.valor)} valueColor="#DC2626" sub={D.saidas?.sub} trend={D.saidas?.tendencia} trendSuffix="% vs mês anterior" trendReverse />

          <KpiCard accentColor="#16A34A" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#16A34A"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} label="Saldo" value={fmt(D.saldo?.valor)} valueColor={D.saldo?.valor >= 0 ? '#16A34A' : '#EF4444'} sub={`${fmtP(D.saldo?.pctRenda)} da renda guardada`}>
            {D.saldo?.melhorMes && <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 500, marginTop: 3 }}>Melhor mês do ano</div>}
          </KpiCard>

          {/* Teto de gastos */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#F59E0B', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              {Ico.info} Teto de Gastos {Ico.info}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#D97706', marginBottom: 2 }}>{gaugePct}%</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>do orçamento utilizado</div>
            <div style={{ height: 4, background: '#FEF3C7', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${Math.min(gaugePct, 100)}%`, background: gaugeCor, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
              <span>Gasto: <strong style={{ color: '#DC2626' }}>{fmt(D.tetoGastos?.gasto)}</strong></span>
              <span>Teto: {fmt(D.tetoGastos?.teto)}</span>
            </div>
            <div style={S.badge(gaugeBg, gaugeTxtC)}>
              {Ico.warn} {gaugeTxt}
            </div>
            <div onClick={() => setModalTeto(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, cursor: 'pointer' }}>
              {Ico.gear} <span style={{ fontSize: 11, color: '#9CA3AF' }}>Alterar teto mensal</span>
            </div>
          </div>

          {/* Maior Gasto */}
          <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444', borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              {Ico.warn} Maior Gasto
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 3 }}>{D.maiorGasto?.nome}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(D.maiorGasto?.valor)}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>{fmtP(D.maiorGasto?.pctSaidas)} das saídas de {MESES_ABREV[mes-1]}</div>
            <div style={{ fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
              {Ico.up} {D.maiorGasto?.tendencia}% vs Março
            </div>
            <div style={S.badge('#FEE2E2', '#B91C1C')}>{Ico.warn} Alto impacto</div>
            <span style={S.cardLink}>Ver análise do cartão →</span>
          </div>
        </div>

        {/* ROW 3 – Saldo + Categorias + Saude */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr', gap: 10, marginBottom: 10 }}>

          <GraficoSaldo meses={D.saldoPorMes} />

          {/* Categorias */}
          <div style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Categorias</div>
            <div style={{ background: '#FEF2F2', borderRadius: 7, padding: '8px 10px', marginBottom: 10, border: '0.5px solid #FECACA' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>Maior impacto</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 1 }}>{D.categorias?.maiorImpacto?.nome}</div>
              <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{fmt(D.categorias?.maiorImpacto?.valor)} · {D.categorias?.maiorImpacto?.pct}% das saídas</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>+{D.categorias?.maiorImpacto?.tendencia}% vs Março — atenção</div>
            </div>
            {(D.categorias?.lista || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: i < (D.categorias.lista.length - 1) ? 8 : 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c.cor, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: '#6B7280', width: 68 }}>{c.nome}</div>
                <div style={{ flex: 1, height: 5, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', minWidth: 52, textAlign: 'right' }}>{fmt(c.valor)}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', minWidth: 28, textAlign: 'right' }}>{c.pct}%</div>
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6B7280' }}>Total saídas</span>
              <span style={{ fontWeight: 700, color: '#DC2626' }}>{fmt(D.categorias?.total)}</span>
            </div>
          </div>

          {/* Saúde financeira */}
          <div style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Saúde financeira</div>
            {(D.saudeFinanceira || []).map((sf, i) => (
              <div key={i} style={{ marginBottom: i < (D.saudeFinanceira.length - 1) ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{sf.lbl}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: sf.cor }}>{sf.val}</span>
                </div>
                <div style={{ height: 5, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sf.pct}%`, background: sf.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sf.ctx}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 4 – linha inferior */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1fr)', gap: 10, marginBottom: 10 }}>

          {/* Comparativos */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Comparativos {Ico.info}</div>
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
            <span style={S.cardLink}>Ver detalhes e métodos de cálculo →</span>
          </div>

          {/* Comparativo de perfil */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>Comparativo de perfil {Ico.info}</div>
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
            <span style={S.cardLink}>Entenda esse comparativo →</span>
          </div>

          {/* Radar */}
          <RadarFinanceiro insights={D.radarFinanceiro || []} />

          {/* Metas em andamento */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Metas em andamento</div>
              <span style={{ fontSize: 12, color: '#3B82F6', cursor: 'pointer' }}>Ver todas →</span>
            </div>
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
        <div style={{ background: '#111827', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 4 }}>
          <div style={{ minWidth: 120, marginRight: 18, borderRight: '1px solid rgba(255,255,255,.08)', paddingRight: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{R.titulo || 'Resumo'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1, marginBottom: 8 }}>{R.intervalo}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Diagnóstico</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FCD34D' }}>{R.diagnostico}</div>
          </div>
          <div style={{ display: 'flex', flex: 1, gap: 0, alignItems: 'stretch', overflow: 'hidden' }}>
            {[
              { lbl: 'Entradas',              val: fmt(R.entradasTotal),                         sub: `Média/mês: ${fmt(R.entradasMediaMes)}` },
              { lbl: 'Saídas',               val: fmt(R.saidasTotal),                            sub: `Média/mês: ${fmt(R.saidasMediaMes)}` },
              { lbl: 'Saldo',                  val: fmtS(R.saldoPeriodo || 0),                   sub: `Taxa de poupança: ${fmtP(R.taxaPoupancaPeriodo)}`, valCor: '#86EFAC' },
              { lbl: 'Do mês total',           val: fmtS(R.saldoMesSelecionado || 0),             sub: `Melhor mês: ${R.melhorMes}`, valCor: '#86EFAC' },
              { lbl: 'Saída que mais impactou', val: R.maiorImpactoNome,                         sub: `${fmt(R.maiorImpactoValor)} (${fmtP(R.maiorImpactoPercentual)})`, isCartao: true },
              { lbl: 'Investimentos',          val: fmt(R.investimentosPeriodo),                  sub: `${fmtP(R.investimentosPercentualRenda)} da renda` },
              { lbl: 'Patrimônio',             val: `+${R.patrimonioCrescimentoPercentual || 0}%`, sub: 'Crescimento no período', valCor: '#86EFAC' },
              { lbl: 'Score médio',            val: `${R.scoreMedio || 0}/100`,                   sub: null, valCor: '#FCD34D' },
              { lbl: 'Pior mês',               val: R.piorMes,                                    sub: null, valCor: '#FCA5A5', last: true },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, padding: '0 14px', borderRight: item.last ? 'none' : '1px solid rgba(255,255,255,.08)', minWidth: 0 }}>
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