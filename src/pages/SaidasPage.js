import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATEGORIAS_SAIDA_DEFAULT = ['Cartões','Casa','Transporte','Alimentação','Saúde','Lazer','Outros'];

const FORMAS_PGTO  = ['Débito','Crédito','PIX','Dinheiro','Boleto','TED/DOC','Outro'];
const RECORRENCIAS = ['Única','Mensal','Quinzenal','Semanal','Anual'];

const CAT_DOTS = {
  'Cartões':     '#EF4444',
  'Casa':        '#F97316',
  'Transporte':  '#3B82F6',
  'Alimentação': '#22C55E',
  'Saúde':       '#8B5CF6',
  'Lazer':       '#EC4899',
  'Outros':      '#6B7280',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR');
};

const today = () => new Date().toISOString().split('T')[0];
const catDot = (nome) => CAT_DOTS[nome] || '#6B7280';

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const S = {
  page:      { padding: '0 20px 32px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  topRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  pageSub:   { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  topBtns:   { display: 'flex', gap: '10px' },
  btnExport: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #E9ECEF', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnNew:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,.28)', fontFamily: 'inherit' },

  // Category menu
  catMenu:   { display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0', alignItems: 'center', scrollbarWidth: 'none' },
  catChip:   (active, isTop) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
    border: active ? 'none' : isTop ? '1px solid #FECACA' : '1px solid #E5E7EB',
    background: active ? '#EF4444' : isTop ? '#FEF2F2' : '#fff',
    color: active ? '#fff' : isTop ? '#DC2626' : '#374151',
    fontSize: '12px', fontWeight: active ? 600 : 500,
    whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit',
    transition: 'all .15s',
  }),

  // KPIs — 6 colunas
  kpiRow:  { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px' },
  kpiCard: { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c, borderRadius: '10px 10px 0 0' }),
  kpiLabel:  { fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px', marginBottom: '6px' },
  kpiValue:  (c) => ({ fontSize: '19px', fontWeight: 700, color: c || '#111827', lineHeight: 1.1, letterSpacing: '-.4px' }),
  kpiSub:    { fontSize: '11px', color: '#6B7280', marginTop: '3px' },

  // Filtros
  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '10px 16px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '5px' },
  filterLabel: { fontSize: '12px', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' },
  monthChip:   (active) => ({ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#EF4444' : 'transparent', color: active ? '#fff' : '#6B7280', transition: 'all .15s', fontFamily: 'inherit' }),
  searchInput: { flex: 1, minWidth: '160px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', background: '#fff', fontFamily: 'inherit' },

  // Cards genéricos
  card:       { background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '0.5px solid #E5E7EB' },
  cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardTitle:  { fontSize: '14px', fontWeight: 600, color: '#111827' },
  cardLink:   { fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontWeight: 500 },

  // Barras
  barsWrap: { display: 'flex', alignItems: 'flex-end', height: '150px', gap: '5px', paddingTop: '22px', position: 'relative' },
  barWrap:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' },
  barLabel: { fontSize: '10px', color: '#9CA3AF', marginTop: '5px' },
  barLegend:{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '0.5px solid #F3F4F6' },
  legendDot: (c) => ({ width: '7px', height: '7px', borderRadius: '50%', background: c, display: 'inline-block', marginRight: '4px', flexShrink: 0 }),
  legendTxt: { fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center' },

  // Donut
  donutWrap: { position: 'relative', width: '130px', height: '130px', margin: '0 auto 14px' },
  donutCtr:  { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  donutLeg:  { display: 'flex', flexDirection: 'column', gap: '7px' },
  donutRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  donutLeft: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' },

  // Insights
  insightItem: { display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', marginBottom: '8px' },
  insightIcon: (c) => ({ width: '32px', height: '32px', borderRadius: '8px', background: c + '18', color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }),
  insightTxt:  { fontSize: '12px', fontWeight: 600, color: '#111827' },
  insightSub:  { fontSize: '11px', color: '#6B7280', marginTop: '1px' },

  // Grid 2 colunas
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', alignItems: 'flex-start' },

  // Tabela
  table:    { width: '100%', borderCollapse: 'collapse' },
  th:       { textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', padding: '7px 10px', borderBottom: '0.5px solid #F3F4F6', whiteSpace: 'nowrap' },
  td:       { padding: '10px 10px', fontSize: '13px', color: '#374151', borderBottom: '0.5px solid #F9FAFB', verticalAlign: 'middle' },
  tdRed:    { color: '#DC2626', fontWeight: 600, fontSize: '13px' },
  actionBtn:{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '3px', borderRadius: '5px', fontSize: '14px' },
  skeleton: { background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' },
  empty:    { textAlign: 'center', color: '#9CA3AF', padding: '32px', fontSize: '13px' },

  // Formulário
  formCard:  { background: '#fff', borderRadius: '10px', padding: '18px', border: '0.5px solid #E5E7EB', position: 'sticky', top: '24px' },
  formTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' },
  formRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' },
  formInner: { display: 'flex', flexDirection: 'column', gap: '4px' },
  formLabel: { fontSize: '11px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '.04em' },
  formInput: { padding: '8px 10px', borderRadius: '7px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' },
  formSel:   { padding: '8px 10px', borderRadius: '7px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', width: '100%', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
  formErr:   { color: '#DC2626', fontSize: '12px', padding: '9px 10px', background: '#FEF2F2', borderRadius: '7px', marginBottom: '10px' },
  formOk:    { color: '#16A34A', fontSize: '12px', padding: '9px 10px', background: '#F0FDF4', borderRadius: '7px', marginBottom: '10px' },
  btnSave:   { width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,.22)', fontFamily: 'inherit' },
};

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function DonutSaidas({ total, categorias }) {
  const CX = 65, CY = 65, R = 50, stroke = 20;
  const circ  = 2 * Math.PI * R;
  const slices = (categorias || []).filter(c => c.total > 0).slice(0, 6);

  if (!total || slices.length === 0) {
    return (
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      </svg>
    );
  }

  let offset = 0;
  const segments = slices.map(s => {
    const pct  = s.total / total;
    const dash = pct * circ;
    const seg  = { ...s, dash, gap: circ - dash, offset, color: catDot(s.nome) };
    offset += dash;
    return seg;
  });

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
      {segments.map((seg, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none"
          stroke={seg.color} strokeWidth={stroke}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={-seg.offset} />
      ))}
    </svg>
  );
}

// ─── BAR CHART ANUAL ─────────────────────────────────────────────────────────

function BarChartSaidas({ graficoAnual, mesAtual }) {
  if (!graficoAnual?.length) return null;
  const maxVal = Math.max(...graficoAnual.map(m => m.total || 0), 1);
  return (
    <div>
      <div style={S.barsWrap}>
        {graficoAnual.map((m, i) => {
          const isFuture = i + 1 > mesAtual;
          const h = Math.max(Math.round(((m.total || 0) / maxVal) * 130), m.total ? 2 : 1);
          return (
            <div key={i} style={S.barWrap} title={`${MESES[i]}: ${fmt(m.total || 0)}`}>
              <div style={{ width: '16px', height: `${h}px`, borderRadius: '3px 3px 0 0', background: isFuture ? '#FEE2E2' : m.total ? '#EF4444' : '#F3F4F6', transition: 'height .4s' }} />
              <div style={S.barLabel}>{MESES[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={S.barLegend}>
        <span style={S.legendTxt}><span style={S.legendDot('#EF4444')} />Realizado</span>
        <span style={S.legendTxt}><span style={{ ...S.legendDot('#FEE2E2'), border: '1px dashed #FCA5A5' }} />Previsto</span>
      </div>
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Skel({ h = 28 }) {
  return <div style={{ ...S.skeleton, height: h }} />;
}

// ─── RADAR ───────────────────────────────────────────────────────────────────

function SpiderRadar({ cats }) {
  const N  = cats.length;
  const CX = 100, CY = 100, R = 78;
  const MAX = Math.max(...cats.map(c => parseFloat(c.pct)), 40);

  const angle  = (i) => (i / N) * 2 * Math.PI - Math.PI / 2;
  const ringPts = (f) => cats.map((_, i) => {
    const r = f * R;
    return `${(CX + r * Math.cos(angle(i))).toFixed(1)},${(CY + r * Math.sin(angle(i))).toFixed(1)}`;
  }).join(' ');

  const dataPts = cats.map((c, i) => {
    const r = (Math.min(parseFloat(c.pct), MAX) / MAX) * R;
    return `${(CX + r * Math.cos(angle(i))).toFixed(1)},${(CY + r * Math.sin(angle(i))).toFixed(1)}`;
  }).join(' ');

  const refPts = cats.map((_, i) => {
    const r = (30 / MAX) * R;
    return `${(CX + r * Math.cos(angle(i))).toFixed(1)},${(CY + r * Math.sin(angle(i))).toFixed(1)}`;
  }).join(' ');

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {[0.25, 0.5, 0.75, 1].map((f, i) => <polygon key={i} points={ringPts(f)} fill="none" stroke="#F3F4F6" strokeWidth="1" />)}
      {cats.map((_, i) => <line key={i} x1={CX} y1={CY} x2={CX + R * Math.cos(angle(i))} y2={CY + R * Math.sin(angle(i))} stroke="#F3F4F6" strokeWidth="1" />)}
      <polygon points={refPts}  fill="none" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points={dataPts} fill="rgba(239,68,68,.12)" stroke="#EF4444" strokeWidth="1.5" />
      {cats.map((c, i) => {
        const r  = (Math.min(parseFloat(c.pct), MAX) / MAX) * R;
        const px = CX + r * Math.cos(angle(i));
        const py = CY + r * Math.sin(angle(i));
        const lx = CX + (R + 18) * Math.cos(angle(i));
        const ly = CY + (R + 18) * Math.sin(angle(i));
        return (
          <g key={i}>
            <circle cx={px} cy={py} r="3.5" fill="#EF4444" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#374151" fontFamily="Inter,sans-serif">
              {c.nome.length > 9 ? c.nome.slice(0, 8) + '…' : c.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ComparativoBarras({ cats }) {
  const maxTotal = Math.max(...cats.map(c => parseFloat(c.total)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {cats.map((c, i) => {
        const pct = Math.round((parseFloat(c.total) / maxTotal) * 100);
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#374151', marginBottom: 3 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: catDot(c.nome) }} />
                {c.nome}
              </span>
              <span style={{ fontWeight: 600, color: '#DC2626' }}>{c.pct}% · {fmt(c.total)}</span>
            </div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: catDot(c.nome), borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RADAR CARROSSEL COM TIMER 10s ───────────────────────────────────────────

const SLIDES = ['Radar', 'Barras'];
const TIMER_MS = 10000;

function RadarCarrossel({ categorias }) {
  const [slide,    setSlide]    = useState(0);
  const [progress, setProgress] = useState(0);
  const cats = (categorias || []).filter(c => parseFloat(c.total) > 0).slice(0, 6);

  const intervalRef  = useRef(null);
  const progressRef  = useRef(null);
  const startTimeRef = useRef(Date.now());

  const resetTimer = (nextSlide) => {
    clearInterval(intervalRef.current);
    clearInterval(progressRef.current);
    startTimeRef.current = Date.now();
    setProgress(0);

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / TIMER_MS) * 100, 100));
    }, 80);

    intervalRef.current = setInterval(() => {
      setSlide(s => {
        const next = (s + 1) % SLIDES.length;
        startTimeRef.current = Date.now();
        setProgress(0);
        return next;
      });
    }, TIMER_MS);
  };

  useEffect(() => {
    if (cats.length < 3) return;
    resetTimer(slide);
    return () => { clearInterval(intervalRef.current); clearInterval(progressRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats.length]);

  const handleSlide = (i) => {
    setSlide(i);
    resetTimer(i);
  };

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Radar de Gastos</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
            Distribuição por categoria · {MESES[new Date().getMonth()]}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {SLIDES.map((lbl, i) => (
              <button key={i} onClick={() => handleSlide(i)} style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', fontFamily: 'inherit', fontSize: 11,
                background: slide === i ? '#EF4444' : '#F3F4F6',
                color: slide === i ? '#fff' : '#6B7280', cursor: 'pointer',
              }}>{lbl}</button>
            ))}
          </div>
          {cats.length >= 3 && (
            <div style={{ width: 80, height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#EF4444', borderRadius: 2, transition: 'width .08s linear' }} />
            </div>
          )}
        </div>
      </div>

      {cats.length < 3 ? (
        <div style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
          Registre ao menos 3 categorias para ver o radar.
        </div>
      ) : slide === 0 ? (
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <SpiderRadar cats={cats} />
          <div style={{ flex: 1 }}>
            {cats.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: catDot(c.nome), flexShrink: 0 }} />
                  {c.nome}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{c.pct}%</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{fmt(c.total)}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 6, borderTop: '1px solid #F3F4F6', paddingTop: 6 }}>
              — Referência: 30% por categoria
            </div>
          </div>
        </div>
      ) : (
        <ComparativoBarras cats={cats} />
      )}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar({ proximasSaidas, categorias, mes, ano }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Próximas saídas */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
          Próximas saídas
        </div>
        {!proximasSaidas?.length ? (
          <div style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
            Nenhuma saída futura registrada.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {proximasSaidas.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #F9FAFB' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                    {s.descricao}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: catDot(s.categoria), display: 'inline-block', marginRight: 4 }} />
                    {fmtDate(s.data)}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>
                  {fmt(s.valor)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparativo por categoria */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
          Comparativo
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
          {MESES[mes - 1]} vs mês anterior
        </div>
        {!categorias?.length ? (
          <div style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
            Nenhum dado disponível.
          </div>
        ) : (
          <div>
            {categorias.slice(0, 7).map((c, i) => (
              <div key={i} style={{ padding: '7px 0', borderBottom: i < categorias.length - 1 ? '0.5px solid #F9FAFB' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: catDot(c.nome), flexShrink: 0 }} />
                    {c.nome}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>{fmt(c.total)}</div>
                    {c.variacaoPct !== null && (
                      <div style={{ fontSize: 10, color: c.variacaoPct > 0 ? '#EF4444' : '#16A34A', fontWeight: 500 }}>
                        {c.variacaoPct > 0 ? '+' : ''}{c.variacaoPct}%
                      </div>
                    )}
                    {c.variacaoPct === null && c.totalAnt === 0 && (
                      <div style={{ fontSize: 10, color: '#9CA3AF' }}>novo</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── FORMULÁRIO NOVA SAÍDA ───────────────────────────────────────────────────

const emptyForm = { categoria: '', descricao: '', valor: '', data: today(), forma_pagamento: '', recorrencia: 'Única' };

function FormSaida({ editData, onSuccess, onCancel, categorias }) {
  const [form,    setForm]    = useState(editData ? { ...emptyForm, ...editData } : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setForm(editData ? { ...emptyForm, ...editData } : emptyForm); }, [editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    if (!form.valor || isNaN(parseFloat(form.valor.toString().replace(',', '.')))) return setError('Informe um valor válido.');
    if (!form.data) return setError('Informe a data.');

    const payload = {
      descricao: form.descricao,
      valor:     parseFloat(form.valor.toString().replace(',', '.')),
      tipo:      'saida',
      data:      form.data,
      categoria: form.categoria || 'Outros',
    };

    try {
      setLoading(true);
      if (editData?.id) {
        await api.put(`/transacoes/${editData.id}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      setSuccess(editData?.id ? 'Saída atualizada!' : 'Saída salva com sucesso!');
      if (!editData?.id) setForm(emptyForm);
      setTimeout(() => { setSuccess(''); onSuccess?.(); }, 1200);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const ig = S.formInner;

  return (
    <div>
      <div style={S.formGroup}>
        <label style={S.formLabel}>Categoria</label>
        <select style={S.formSel} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
          <option value="">Selecione a categoria</option>
          {(categorias || CATEGORIAS_SAIDA_DEFAULT).filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={S.formGroup}>
        <label style={S.formLabel}>Descrição *</label>
        <input style={S.formInput} placeholder="Ex: Conta de luz, Mercado..."
          value={form.descricao} onChange={e => set('descricao', e.target.value)} />
      </div>

      <div style={S.formRow}>
        <div style={ig}>
          <label style={S.formLabel}>Valor (R$) *</label>
          <input style={S.formInput} type="number" min="0" step="0.01" placeholder="0,00"
            value={form.valor} onChange={e => set('valor', e.target.value)} />
        </div>
        <div style={ig}>
          <label style={S.formLabel}>Data *</label>
          <input style={S.formInput} type="date" value={form.data} onChange={e => set('data', e.target.value)} />
        </div>
      </div>

      <div style={S.formRow}>
        <div style={ig}>
          <label style={S.formLabel}>Forma de pagamento</label>
          <select style={S.formSel} value={form.forma_pagamento} onChange={e => set('forma_pagamento', e.target.value)}>
            <option value="">Selecione</option>
            {FORMAS_PGTO.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div style={ig}>
          <label style={S.formLabel}>Recorrência</label>
          <select style={S.formSel} value={form.recorrencia} onChange={e => set('recorrencia', e.target.value)}>
            {RECORRENCIAS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {error   && <div style={S.formErr}>{error}</div>}
      {success && <div style={S.formOk}>✓ {success}</div>}

      <div style={{ display: 'flex', gap: '8px' }}>
        {onCancel && (
          <button onClick={onCancel}
            style={{ ...S.btnSave, background: '#F3F4F6', color: '#374151', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '11px 16px' }}>
            Cancelar
          </button>
        )}
        <button onClick={handleSubmit} disabled={loading}
          style={{ ...S.btnSave, flex: 1, opacity: loading ? .75 : 1 }}>
          {loading ? 'Salvando...' : editData?.id ? 'Atualizar saída' : 'Salvar saída'}
        </button>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────

export default function SaidasPage() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [mes,           setMes]           = useState(hoje.getMonth() + 1);
  const [ano]                             = useState(hoje.getFullYear());
  const [catFiltro,     setCatFiltro]     = useState('Todos');
  const [busca,         setBusca]         = useState('');
  const [resumo,        setResumo]        = useState(null);
  const [saidas,        setSaidas]        = useState([]);
  const [loadingRes,    setLoadingRes]    = useState(true);
  const [loadingList,   setLoadingList]   = useState(true);
  const [editData,      setEditData]      = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [pagina,        setPagina]        = useState(1);
  const [porPagina,     setPorPagina]     = useState(10);
  const [agrupado,      setAgrupado]      = useState(false);
  const [expandedCats,  setExpandedCats]  = useState(new Set());
  const [categoriasLista, setCategoriasLista] = useState(['Todos', ...CATEGORIAS_SAIDA_DEFAULT]);

  useEffect(() => {
    api.get('/categorias?tipo=saida').then(r => {
      const nomes  = r.data.map(c => c.nome);
      const merged = ['Todos', ...new Set([...nomes, ...CATEGORIAS_SAIDA_DEFAULT])]
        .sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b, 'pt-BR'));
      setCategoriasLista(merged);
    }).catch(() => {});
  }, []);

  const carregarResumo = useCallback(async () => {
    try {
      setLoadingRes(true);
      const r = await api.get(`/saidas/resumo-completo?mes=${mes}&ano=${ano}`);
      setResumo(r.data);
    } catch {
      setResumo(null);
    } finally {
      setLoadingRes(false);
    }
  }, [mes, ano]);

  const carregarSaidas = useCallback(async () => {
    try {
      setLoadingList(true);
      let url = `/transacoes?mes=${mes}&ano=${ano}&tipo=saida`;
      if (catFiltro !== 'Todos') url += `&categoria=${encodeURIComponent(catFiltro)}`;
      const r = await api.get(url);
      setSaidas(Array.isArray(r.data) ? r.data : []);
    } catch {
      setSaidas([]);
    } finally {
      setLoadingList(false);
    }
  }, [mes, ano, catFiltro]);

  useEffect(() => { carregarResumo(); },               [carregarResumo]);
  useEffect(() => { carregarSaidas(); setPagina(1); }, [carregarSaidas]);

  const saidasFiltradas = useMemo(() => {
    if (!busca.trim()) return saidas;
    const q = busca.toLowerCase();
    return saidas.filter(s =>
      (s.descricao || '').toLowerCase().includes(q) ||
      (s.categoria  || '').toLowerCase().includes(q)
    );
  }, [saidas, busca]);

  const totalPages = Math.ceil(saidasFiltradas.length / porPagina);
  const saidasPag  = saidasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const saidasAgrupadas = useMemo(() => {
    const groups = {};
    saidasFiltradas.forEach(s => {
      const cat = s.categoria || 'Outros';
      if (!groups[cat]) groups[cat] = { nome: cat, total: 0, itens: [] };
      groups[cat].total += Math.abs(parseFloat(s.valor) || 0);
      groups[cat].itens.push(s);
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [saidasFiltradas]);

  const toggleCat = (nome) => setExpandedCats(prev => {
    const next = new Set(prev);
    next.has(nome) ? next.delete(nome) : next.add(nome);
    return next;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta saída?')) return;
    try {
      await api.delete(`/transacoes/${id}`);
      carregarSaidas();
      carregarResumo();
    } catch { alert('Erro ao excluir.'); }
  };

  const handleEdit = (s) => {
    setEditData({ ...s, valor: s.valor?.toString(), data: (s.data || '').split('T')[0] });
    setModalOpen(true);
  };

  const handleDuplicate = (s) => {
    setEditData({ ...s, id: undefined, data: today(), valor: s.valor?.toString() });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditData(null); };
  const onSuccess  = () => { carregarSaidas(); carregarResumo(); closeModal(); };

  // Derivados do resumo
  const R          = resumo || {};
  const total      = R.totalMes    || 0;
  const totalAnt   = R.totalAnt    || 0;
  const variacao   = R.variacao    || 0;
  const media      = R.mediaMensal || 0;
  const diasGasto  = R.diasComGasto || 0;
  const maiorG     = R.maiorGasto  || null;
  const cats       = R.categorias  || [];
  const graf       = R.graficoAnual || [];
  const proximas   = R.proximasSaidas || [];

  const variacaoPos = variacao <= 0;
  const variacaoCor = variacaoPos ? '#16A34A' : '#EF4444';
  const maiorCat    = cats[0] || null;

  const insights = [
    maiorCat
      ? { icon: '📊', color: '#EF4444', bg: '#FEF2F2', txt: `${maiorCat.nome} é sua maior categoria`, sub: `${fmt(maiorCat.total)} — ${maiorCat.pct}% do total` }
      : { icon: '📊', color: '#6B7280', bg: '#F9FAFB', txt: 'Nenhuma categoria registrada', sub: 'Adicione saídas para ver insights' },
    maiorG
      ? { icon: '⚠️', color: '#F59E0B', bg: '#FFFBEB', txt: `Maior gasto: ${maiorG.descricao}`, sub: `${fmt(maiorG.valor)} — ${maiorG.pct}% do total` }
      : { icon: '✅', color: '#16A34A', bg: '#F0FDF4', txt: 'Sem gastos registrados', sub: 'O mês ainda está limpo!' },
    variacaoPos
      ? { icon: '📉', color: '#16A34A', bg: '#F0FDF4', txt: 'Gastos reduziram vs mês anterior', sub: `${fmt(Math.abs(total - totalAnt))} a menos (${Math.abs(variacao)}%)` }
      : { icon: '📈', color: '#EF4444', bg: '#FEF2F2', txt: 'Gastos aumentaram vs mês anterior', sub: `${fmt(Math.abs(total - totalAnt))} a mais (${Math.abs(variacao)}%)` },
  ];

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} .catmenu::-webkit-scrollbar{display:none}`}</style>
      <div style={S.page}>

        {/* HEADER */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.pageTitle}>Saídas</h1>
            <p style={S.pageSub}>Controle e classifique todos os seus gastos com clareza.</p>
          </div>
          <div style={S.topBtns}>
            <button style={S.btnExport}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
            <button style={S.btnNew} onClick={() => { setEditData(null); setModalOpen(true); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova saída
            </button>
          </div>
        </div>

        {/* MENU HORIZONTAL DE CATEGORIAS */}
        <div className="catmenu" style={S.catMenu}>
          <button style={S.catChip(catFiltro === 'Todos', false)} onClick={() => setCatFiltro('Todos')}>
            Todos
            <span style={{ fontWeight: 400, fontSize: 10, opacity: .7 }}>100%</span>
          </button>
          {cats.map((c, i) => {
            const isTop    = i === 0;
            const isActive = catFiltro === c.nome;
            return (
              <button key={c.nome} style={S.catChip(isActive, isTop && !isActive)} onClick={() => setCatFiltro(c.nome)}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? 'rgba(255,255,255,.7)' : catDot(c.nome), flexShrink: 0 }} />
                {c.nome}
                <span style={{ fontWeight: 400, fontSize: 10 }}>{c.pct}%</span>
              </button>
            );
          })}
        </div>

        {/* 6 KPIs */}
        <div style={S.kpiRow}>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#EF4444')} />
            <div style={S.kpiLabel}>Total no mês</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#DC2626')}>{fmt(total)}</div>}
            <div style={S.kpiSub}>{MESES[mes - 1]} {ano}</div>
          </div>

          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#9CA3AF')} />
            <div style={S.kpiLabel}>Mês anterior</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#374151')}>{fmt(totalAnt)}</div>}
            <div style={S.kpiSub}>{MESES[mes === 1 ? 11 : mes - 2]}</div>
          </div>

          <div style={S.kpiCard}>
            <div style={S.kpiAccent(variacaoCor)} />
            <div style={S.kpiLabel}>Variação</div>
            {loadingRes ? <Skel /> : (
              <div style={S.kpiValue(variacaoCor)}>
                {variacao > 0 ? '+' : ''}{variacao}%
              </div>
            )}
            <div style={S.kpiSub}>{variacaoPos ? 'Reduziu ✓' : 'Aumentou ↑'}</div>
          </div>

          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#F59E0B')} />
            <div style={S.kpiLabel}>Maior gasto</div>
            {loadingRes ? <Skel /> : <div style={{ ...S.kpiValue('#D97706'), fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{maiorG?.descricao || '—'}</div>}
            <div style={S.kpiSub}>{maiorG ? fmt(maiorG.valor) : 'Sem dados'}</div>
          </div>

          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#8B5CF6')} />
            <div style={S.kpiLabel}>Dias com gasto</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#7C3AED')}>{diasGasto}</div>}
            <div style={S.kpiSub}>de {MESES[mes - 1]}</div>
          </div>

          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#3B82F6')} />
            <div style={S.kpiLabel}>Média mensal</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#2563EB')}>{fmt(media)}</div>}
            <div style={S.kpiSub}>Base: Jan–{MESES[mes - 1]}</div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={S.filterRow}>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Mês:</span>
            {MESES.map((m, i) => (
              <button key={m} style={S.monthChip(mes === i + 1)} onClick={() => setMes(i + 1)}>{m}</button>
            ))}
          </div>
          <input style={S.searchInput} placeholder="Buscar descrição ou categoria…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {/* GRÁFICOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div style={S.card}>
            <div style={S.cardTitleRow}>
              <span style={S.cardTitle}>Evolução das saídas ({ano})</span>
              <span style={S.cardLink} onClick={() => navigate('/relatorios')}>Ver relatório →</span>
            </div>
            {loadingRes ? <Skel h={170} /> : <BarChartSaidas graficoAnual={graf} mesAtual={mes} />}
          </div>

          <div style={S.card}>
            <div style={S.cardTitleRow}>
              <span style={S.cardTitle}>Gastos por categoria</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{MESES[mes - 1]}</span>
            </div>
            {loadingRes ? <Skel h={160} /> : (
              <>
                <div style={S.donutWrap}>
                  <DonutSaidas total={total} categorias={cats} />
                  <div style={S.donutCtr}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{fmt(total)}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Total</div>
                  </div>
                </div>
                <div style={S.donutLeg}>
                  {cats.slice(0, 5).map(c => (
                    <div key={c.nome} style={S.donutRow}>
                      <div style={S.donutLeft}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: catDot(c.nome), flexShrink: 0 }} />
                        {c.nome}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>{c.pct}%</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{fmt(c.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={S.card}>
            <div style={{ ...S.cardTitle, marginBottom: '14px' }}>Insights rápidos</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ ...S.insightItem, background: ins.bg }}>
                <div style={S.insightIcon(ins.color)}>{ins.icon}</div>
                <div>
                  <div style={S.insightTxt}>{ins.txt}</div>
                  <div style={S.insightSub}>{ins.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RADAR CARROSSEL */}
        {!loadingRes && cats.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <RadarCarrossel categorias={cats} />
          </div>
        )}

        {/* GRID: tabela (esquerda) + sidebar (direita) */}
        <div style={S.mainGrid}>

          {/* TABELA */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                Saídas de {MESES[mes - 1]}
                {saidasFiltradas.length > 0 && (
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 400, marginLeft: 8 }}>
                    {saidasFiltradas.length} lançamento{saidasFiltradas.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[5, 10, 20].map(n => (
                    <button key={n} onClick={() => { setPorPagina(n); setPagina(1); }} style={{
                      padding: '3px 8px', borderRadius: 5, border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: 11,
                      background: porPagina === n ? '#EF4444' : '#fff',
                      color: porPagina === n ? '#fff' : '#6B7280', cursor: 'pointer',
                    }}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setAgrupado(a => !a)} style={{
                  padding: '3px 10px', borderRadius: 5, border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: 11,
                  background: agrupado ? '#111827' : '#fff', color: agrupado ? '#fff' : '#6B7280', cursor: 'pointer',
                }}>
                  {agrupado ? 'Agrupar ✓' : 'Agrupar'}
                </button>
              </div>
            </div>

            {loadingList ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1, 2, 3].map(i => <Skel key={i} h={44} />)}
              </div>
            ) : agrupado ? (
              saidasAgrupadas.length === 0 ? (
                <div style={S.empty}>Nenhuma saída encontrada.</div>
              ) : (
                <div>
                  {saidasAgrupadas.map(g => (
                    <div key={g.nome} style={{ marginBottom: 8, border: '1px solid #F3F4F6', borderRadius: 8, overflow: 'hidden' }}>
                      <div onClick={() => toggleCat(g.nome)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FAFAFA', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: catDot(g.nome), flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{g.nome}</span>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{g.itens.length} lançamento{g.itens.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{fmt(g.total)}</span>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{expandedCats.has(g.nome) ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {expandedCats.has(g.nome) && (
                        <table style={S.table}>
                          <tbody>
                            {g.itens.map(s => (
                              <tr key={s.id}
                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={S.td}>{fmtDate(s.data)}</td>
                                <td style={S.td}>{s.descricao}</td>
                                <td style={{ ...S.td, ...S.tdRed }}>{fmt(s.valor)}</td>
                                <td style={S.td}>
                                  <div style={{ display: 'flex', gap: 2 }}>
                                    <button style={S.actionBtn} onClick={() => handleEdit(s)}>✏️</button>
                                    <button style={S.actionBtn} onClick={() => handleDelete(s.id)}>🗑️</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : saidasPag.length === 0 ? (
              <div style={S.empty}>Nenhuma saída encontrada para o período selecionado.</div>
            ) : (
              <>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Data', 'Descrição', 'Categoria', 'Valor', 'Ações'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {saidasPag.map(s => (
                      <tr key={s.id}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={S.td}>{fmtDate(s.data)}</td>
                        <td style={S.td}>{s.descricao}</td>
                        <td style={S.td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: catDot(s.categoria), flexShrink: 0 }} />
                            {s.categoria || 'Outros'}
                          </span>
                        </td>
                        <td style={{ ...S.td, ...S.tdRed }}>{fmt(s.valor)}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button style={S.actionBtn} title="Editar"   onClick={() => handleEdit(s)}>✏️</button>
                            <button style={S.actionBtn} title="Duplicar" onClick={() => handleDuplicate(s)}>📋</button>
                            <button style={S.actionBtn} title="Excluir"  onClick={() => handleDelete(s.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPagina(p)} style={{
                        padding: '5px 10px', borderRadius: 7, border: '1px solid #E5E7EB',
                        background: pagina === p ? '#EF4444' : '#fff',
                        color: pagina === p ? '#fff' : '#374151',
                        cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                      }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 12 }}
              onClick={() => navigate('/transacoes')}>
              Ver todas as transações →
            </span>
          </div>

          {/* SIDEBAR */}
          <Sidebar proximasSaidas={proximas} categorias={cats} mes={mes} ano={ano} />
        </div>

        {/* FORMULÁRIO — nova saída (abaixo da tabela em tela cheia) */}
        <div style={{ ...S.card, marginTop: 14 }}>
          <div style={S.formTitle}>Adicionar nova saída</div>
          <div style={{ maxWidth: 600 }}>
            <FormSaida onSuccess={onSuccess} categorias={categoriasLista} />
          </div>
        </div>

      </div>

      {/* MODAL — edição / duplicação */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 500, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{editData?.id ? 'Editar saída' : 'Nova saída'}</span>
              <button style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }} onClick={closeModal}>✕</button>
            </div>
            <FormSaida editData={editData} onSuccess={onSuccess} onCancel={closeModal} categorias={categoriasLista} />
          </div>
        </div>
      )}
    </Layout>
  );
}
