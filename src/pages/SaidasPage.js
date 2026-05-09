import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const CAT_CORES = {
  'Cartões':     '#EF4444',
  'Casa':        '#F97316',
  'Transporte':  '#3B82F6',
  'Alimentação': '#22C55E',
  'Saúde':       '#8B5CF6',
  'Lazer':       '#EC4899',
  'Outros':      '#6B7280',
};

const FORMAS_PGTO  = ['Débito','Crédito','PIX','Dinheiro','Boleto','TED/DOC','Outro'];
const RECORRENCIAS = ['Única','Mensal','Quinzenal','Semanal','Anual'];
const CATS_DEFAULT = ['Cartões','Casa','Transporte','Alimentação','Saúde','Lazer','Outros'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt      = v  => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const fmtDate  = d  => d ? new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR') : '';
const today    = () => new Date().toISOString().split('T')[0];
const cor      = n  => CAT_CORES[n] || '#6B7280';

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────

const S = {
  page:    { padding: '0 20px 40px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  card:    { background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '0.5px solid #E5E7EB' },
  skel:    { background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' },
  empty:   { textAlign: 'center', color: '#9CA3AF', padding: '32px 0', fontSize: '13px' },

  // Header
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 8px' },
  title:   { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  sub:     { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  btnExp:  { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnNew:  { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,.25)', fontFamily: 'inherit' },

  // KPI
  kpiGrid:  { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 },
  kpiCard:  { background: '#fff', borderRadius: 10, padding: '13px 15px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiBar:   c => ({ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c, borderRadius: '10px 10px 0 0' }),
  kpiLbl:   { fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4, marginBottom: 5 },
  kpiVal:   c => ({ fontSize: '18px', fontWeight: 700, color: c || '#111827', lineHeight: 1.1, letterSpacing: '-.4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
  kpiSub:   { fontSize: '11px', color: '#9CA3AF', marginTop: 3 },

  // Filtros
  filterRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, border: '0.5px solid #E5E7EB', padding: '9px 14px', flexWrap: 'wrap' },
  mChip:   a => ({ padding: '3px 8px', borderRadius: 20, fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: a ? '#EF4444' : 'transparent', color: a ? '#fff' : '#6B7280', fontFamily: 'inherit' }),
  search:  { flex: 1, minWidth: 140, padding: '6px 11px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit' },

  // Gráficos
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },

  // Tabela
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { textAlign: 'left', fontSize: '10px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', padding: '6px 10px', borderBottom: '0.5px solid #F3F4F6', whiteSpace: 'nowrap' },
  td:      { padding: '10px 10px', fontSize: '13px', color: '#374151', borderBottom: '0.5px solid #F9FAFB', verticalAlign: 'middle' },
  tdRed:   { color: '#DC2626', fontWeight: 600 },
  actBtn:  { background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 3, borderRadius: 5, fontSize: '13px', lineHeight: 1 },

  // Main grid
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 296px', gap: 14, alignItems: 'flex-start' },

  // Formulário
  fLabel: { fontSize: '10px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '.04em' },
  fInput: { padding: '8px 10px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' },
  fSel:   { padding: '8px 10px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', width: '100%', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
  fErr:   { color: '#DC2626', fontSize: '12px', padding: '8px 10px', background: '#FEF2F2', borderRadius: 7, marginBottom: 10 },
  fOk:    { color: '#16A34A', fontSize: '12px', padding: '8px 10px', background: '#F0FDF4', borderRadius: 7, marginBottom: 10 },
  btnSave:{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(239,68,68,.2)' },
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function Skel({ h = 24, mb = 0 }) {
  return <div style={{ ...S.skel, height: h, marginBottom: mb }} />;
}

// ─── DONUT ────────────────────────────────────────────────────────────────────

function Donut({ total, cats }) {
  const CX = 65, CY = 65, R = 50, sw = 20;
  const circ   = 2 * Math.PI * R;
  const slices = (cats || []).filter(c => c.total > 0).slice(0, 6);
  if (!total || !slices.length) return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
    </svg>
  );
  let off = 0;
  const segs = slices.map(s => {
    const dash = (s.total / total) * circ;
    const seg  = { ...s, dash, gap: circ - dash, off, c: cor(s.nome) };
    off += dash; return seg;
  });
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
      {segs.map((s, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={s.c} strokeWidth={sw}
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.off} />
      ))}
    </svg>
  );
}

// ─── BAR CHART ANUAL ─────────────────────────────────────────────────────────

function BarAnual({ graf, mes }) {
  if (!graf?.length) return <Skel h={160} />;
  const max = Math.max(...graf.map(m => m.total || 0), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 140, gap: 5 }}>
        {graf.map((m, i) => {
          const fut = i + 1 > mes;
          const h = Math.max(Math.round(((m.total || 0) / max) * 140), m.total ? 2 : 1);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }} title={`${MESES[i]}: ${fmt(m.total)}`}>
              <div style={{ width: '100%', maxWidth: 18, height: h, borderRadius: '3px 3px 0 0', background: fut ? '#FEE2E2' : m.total ? '#EF4444' : '#F3F4F6', transition: 'height .35s' }} />
              <div style={{ fontSize: 9, color: '#D1D5DB' }}>{MESES[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #F3F4F6' }}>
        <span style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />Realizado</span>
        <span style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FEE2E2', border: '1px dashed #FCA5A5' }} />Previsto</span>
      </div>
    </div>
  );
}

// ─── RADAR ────────────────────────────────────────────────────────────────────

function Radar({ cats }) {
  const N = cats.length;
  const CX = 100, CY = 100, R = 75;
  const MAX = Math.max(...cats.map(c => c.pct || 0), 40);
  const ang = i => (i / N) * 2 * Math.PI - Math.PI / 2;
  const ring = f => cats.map((_, i) => `${(CX + f * R * Math.cos(ang(i))).toFixed(1)},${(CY + f * R * Math.sin(ang(i))).toFixed(1)}`).join(' ');
  const data = cats.map((c, i) => { const r = (Math.min(c.pct || 0, MAX) / MAX) * R; return `${(CX + r * Math.cos(ang(i))).toFixed(1)},${(CY + r * Math.sin(ang(i))).toFixed(1)}`; }).join(' ');
  const ref  = cats.map((_, i) => { const r = (30 / MAX) * R; return `${(CX + r * Math.cos(ang(i))).toFixed(1)},${(CY + r * Math.sin(ang(i))).toFixed(1)}`; }).join(' ');
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {[.25,.5,.75,1].map((f,i) => <polygon key={i} points={ring(f)} fill="none" stroke="#F3F4F6" strokeWidth="1" />)}
      {cats.map((_,i) => <line key={i} x1={CX} y1={CY} x2={CX+R*Math.cos(ang(i))} y2={CY+R*Math.sin(ang(i))} stroke="#F3F4F6" strokeWidth="1" />)}
      <polygon points={ref}  fill="none" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="4 3" />
      <polygon points={data} fill="rgba(239,68,68,.1)" stroke="#EF4444" strokeWidth="1.5" />
      {cats.map((c,i) => {
        const r = (Math.min(c.pct||0,MAX)/MAX)*R;
        return (
          <g key={i}>
            <circle cx={CX+r*Math.cos(ang(i))} cy={CY+r*Math.sin(ang(i))} r="3" fill="#EF4444" />
            <text x={CX+(R+17)*Math.cos(ang(i))} y={CY+(R+17)*Math.sin(ang(i))} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">
              {c.nome.length > 9 ? c.nome.slice(0,8)+'…' : c.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Barras({ cats }) {
  const max = Math.max(...cats.map(c => c.total || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {cats.map((c, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor(c.nome), flexShrink: 0 }} />
              {c.nome}
            </span>
            <span style={{ fontWeight: 600, color: '#DC2626' }}>{c.pct}% · {fmt(c.total)}</span>
          </div>
          <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${Math.round((c.total/max)*100)}%`, background: cor(c.nome), borderRadius: 3, transition: 'width .4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RADAR CARROSSEL 10s ──────────────────────────────────────────────────────

const SLIDES  = ['Radar','Barras'];
const TICK_MS = 10000;

function RadarCarrossel({ cats }) {
  const valid   = (cats || []).filter(c => (c.total||0) > 0).slice(0, 6);
  const [slide,  setSlide]  = useState(0);
  const [prog,   setProg]   = useState(0);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef(null);
  const progRef  = useRef(null);
  const t0Ref    = useRef(Date.now());
  const pausedRef = useRef(false);

  const stopAll = () => { clearInterval(timerRef.current); clearInterval(progRef.current); };

  const start = useCallback(() => {
    stopAll();
    t0Ref.current = Date.now();
    setProg(0);
    progRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setProg(Math.min(((Date.now() - t0Ref.current) / TICK_MS) * 100, 100));
    }, 80);
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setSlide(s => (s + 1) % SLIDES.length);
      t0Ref.current = Date.now();
      setProg(0);
    }, TICK_MS);
  }, []);

  useEffect(() => {
    if (valid.length < 3) return;
    start();
    return stopAll;
  }, [valid.length, start]);

  const goSlide = i => { setSlide(i); t0Ref.current = Date.now(); setProg(0); };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
    if (!pausedRef.current) t0Ref.current = Date.now() - (prog / 100) * TICK_MS;
  };

  if (valid.length < 3) return (
    <div style={{ ...S.card, textAlign: 'center', color: '#9CA3AF', fontSize: 12, padding: '20px 0' }}>
      Registre ao menos 3 categorias para ver o radar.
    </div>
  );

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Radar de Gastos</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Distribuição por categoria</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {SLIDES.map((lbl, i) => (
              <button key={i} onClick={() => goSlide(i)} style={{ padding: '3px 10px', borderRadius: 20, border: 'none', fontFamily: 'inherit', fontSize: 11, background: slide === i ? '#EF4444' : '#F3F4F6', color: slide === i ? '#fff' : '#6B7280', cursor: 'pointer' }}>{lbl}</button>
            ))}
            <button onClick={togglePause} title={paused ? 'Retomar' : 'Pausar'} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
              {paused ? '▶' : '⏸'}
            </button>
          </div>
          <div style={{ width: 80, height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${prog}%`, background: paused ? '#D1D5DB' : '#EF4444', borderRadius: 2, transition: 'width .08s linear' }} />
          </div>
        </div>
      </div>
      {slide === 0 ? (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Radar cats={valid} />
          <div style={{ flex: 1 }}>
            {valid.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor(c.nome), flexShrink: 0 }} />{c.nome}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{c.pct}%</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{fmt(c.total)}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#D1D5DB', marginTop: 6, paddingTop: 6, borderTop: '1px solid #F9FAFB' }}>
              — ref: 30% por categoria
            </div>
          </div>
        </div>
      ) : (
        <Barras cats={valid} />
      )}
    </div>
  );
}

// ─── FORMULÁRIO ───────────────────────────────────────────────────────────────

const EMPTY = { categoria: '', descricao: '', valor: '', data: today(), forma_pagamento: '', recorrencia: 'Única' };

function FormSaida({ editData, onSuccess, onCancel, categoriasLista }) {
  const [form,    setForm]    = useState(editData ? { ...EMPTY, ...editData } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [ok,      setOk]      = useState('');

  useEffect(() => setForm(editData ? { ...EMPTY, ...editData } : EMPTY), [editData]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setOk('');
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    const val = parseFloat(form.valor.toString().replace(',', '.'));
    if (!val || isNaN(val)) return setError('Informe um valor válido.');
    if (!form.data) return setError('Informe a data.');
    try {
      setLoading(true);
      const payload = { descricao: form.descricao, valor: val, tipo: 'saida', data: form.data, categoria: form.categoria || 'Outros' };
      if (editData?.id) await api.put(`/transacoes/${editData.id}`, payload);
      else              await api.post('/transacoes', payload);
      setOk(editData?.id ? 'Saída atualizada!' : 'Saída salva!');
      if (!editData?.id) setForm(EMPTY);
      setTimeout(() => { setOk(''); onSuccess?.(); }, 1200);
    } catch(e) {
      setError(e?.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  };

  const cats = (categoriasLista || []).filter(c => c !== 'Todos');

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <label style={S.fLabel}>Categoria</label>
        <select style={S.fSel} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
          <option value="">Selecione</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <label style={S.fLabel}>Descrição *</label>
        <input style={S.fInput} placeholder="Ex: Conta de luz, Mercado…" value={form.descricao} onChange={e => set('descricao', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={S.fLabel}>Valor (R$) *</label>
          <input style={S.fInput} type="number" min="0" step="0.01" placeholder="0,00" value={form.valor} onChange={e => set('valor', e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={S.fLabel}>Data *</label>
          <input style={S.fInput} type="date" value={form.data} onChange={e => set('data', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={S.fLabel}>Forma de pgto.</label>
          <select style={S.fSel} value={form.forma_pagamento} onChange={e => set('forma_pagamento', e.target.value)}>
            <option value="">Selecione</option>
            {FORMAS_PGTO.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={S.fLabel}>Recorrência</label>
          <select style={S.fSel} value={form.recorrencia} onChange={e => set('recorrencia', e.target.value)}>
            {RECORRENCIAS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      {error && <div style={S.fErr}>{error}</div>}
      {ok    && <div style={S.fOk}>✓ {ok}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && <button onClick={onCancel} style={{ ...S.btnSave, background: '#F3F4F6', color: '#374151', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '10px 14px' }}>Cancelar</button>}
        <button onClick={submit} disabled={loading} style={{ ...S.btnSave, flex: 1, opacity: loading ? .7 : 1 }}>
          {loading ? 'Salvando…' : editData?.id ? 'Atualizar' : 'Salvar saída'}
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar({ proximas, cats, faturas, loadingFat, mes }) {
  const [fatOpen, setFatOpen] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Próximas saídas */}
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
          Próximas saídas
        </div>
        {!proximas.length ? (
          <div style={{ ...S.empty, padding: '14px 0' }}>Sem saídas futuras.</div>
        ) : proximas.map(s => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid #F9FAFB' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{s.descricao}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor(s.categoria), display: 'inline-block', marginRight: 4 }} />
                {fmtDate(s.data)}
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>{fmt(s.valor)}</div>
          </div>
        ))}
      </div>

      {/* Comparativo por categoria */}
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3 }}>Comparativo</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>{MESES_FULL[mes - 1]} vs mês anterior</div>
        {!cats.length ? (
          <div style={{ ...S.empty, padding: '14px 0' }}>Nenhum dado.</div>
        ) : cats.slice(0, 7).map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < cats.length - 1 ? '0.5px solid #F9FAFB' : 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor(c.nome), flexShrink: 0 }} />{c.nome}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>{fmt(c.total)}</div>
              {c.variacaoPct !== null && (
                <div style={{ fontSize: 10, fontWeight: 500, color: c.variacaoPct > 0 ? '#EF4444' : '#16A34A' }}>
                  {c.variacaoPct > 0 ? '+' : ''}{c.variacaoPct}%
                </div>
              )}
              {c.variacaoPct === null && <div style={{ fontSize: 10, color: '#9CA3AF' }}>novo</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Faturas recorrentes — recolhível */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <div
          onClick={() => setFatOpen(o => !o)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Faturas recorrentes</div>
            {faturas.length > 0 && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{faturas.length} conta{faturas.length !== 1 ? 's' : ''} fixas detectadas</div>}
          </div>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fatOpen ? '▲' : '▼'}</span>
        </div>
        {fatOpen && (
          <div style={{ borderTop: '0.5px solid #F3F4F6', padding: '0 16px 12px' }}>
            {loadingFat ? (
              <div style={{ paddingTop: 10 }}><Skel h={32} mb={6} /><Skel h={32} /></div>
            ) : !faturas.length ? (
              <div style={{ ...S.empty, padding: '14px 0' }}>Nenhuma recorrência detectada.</div>
            ) : faturas.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < faturas.length - 1 ? '0.5px solid #F9FAFB' : 'none' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{f.descricao}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cor(f.categoria), display: 'inline-block', marginRight: 4 }} />
                    {f.mesesCount}x · próxima {fmtDate(f.proximaData)}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>{fmt(f.valor)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────

export default function SaidasPage() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [mes,          setMes]          = useState(hoje.getMonth() + 1);
  const [ano]                           = useState(hoje.getFullYear());
  const [catFiltro,    setCatFiltro]    = useState('Todos');
  const [busca,        setBusca]        = useState('');
  const [resumo,       setResumo]       = useState(null);
  const [saidas,       setSaidas]       = useState([]);
  const [faturas,      setFaturas]      = useState([]);
  const [loadingRes,   setLoadingRes]   = useState(true);
  const [loadingList,  setLoadingList]  = useState(true);
  const [loadingFat,   setLoadingFat]   = useState(true);
  const [editData,     setEditData]     = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [pagina,       setPagina]       = useState(1);
  const [porPagina,    setPorPagina]    = useState(10);
  const [agrupado,     setAgrupado]     = useState(false);
  const [expanded,     setExpanded]     = useState(new Set());
  const [categoriasLista, setCategoriasLista] = useState(['Todos', ...CATS_DEFAULT]);

  // Carregar lista de categorias
  useEffect(() => {
    api.get('/categorias?tipo=saida').then(r => {
      const nomes  = r.data.map(c => c.nome);
      const merged = ['Todos', ...new Set([...nomes, ...CATS_DEFAULT])]
        .sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b, 'pt-BR'));
      setCategoriasLista(merged);
    }).catch(() => {});
  }, []);

  // Carregar faturas recorrentes (por ano, sem depender do mês)
  useEffect(() => {
    setLoadingFat(true);
    api.get(`/saidas/faturas?ano=${ano}`)
      .then(r => setFaturas(r.data?.faturas || []))
      .catch(() => setFaturas([]))
      .finally(() => setLoadingFat(false));
  }, [ano]);

  const carregarResumo = useCallback(async () => {
    try {
      setLoadingRes(true);
      const r = await api.get(`/saidas/resumo-completo?mes=${mes}&ano=${ano}`);
      setResumo(r.data);
    } catch { setResumo(null); }
    finally   { setLoadingRes(false); }
  }, [mes, ano]);

  const carregarSaidas = useCallback(async () => {
    try {
      setLoadingList(true);
      let url = `/transacoes?mes=${mes}&ano=${ano}&tipo=saida`;
      if (catFiltro !== 'Todos') url += `&categoria=${encodeURIComponent(catFiltro)}`;
      const r = await api.get(url);
      setSaidas(Array.isArray(r.data) ? r.data : []);
    } catch { setSaidas([]); }
    finally   { setLoadingList(false); }
  }, [mes, ano, catFiltro]);

  useEffect(() => { carregarResumo(); },                [carregarResumo]);
  useEffect(() => { carregarSaidas(); setPagina(1); }, [carregarSaidas]);

  // Filtro de busca
  const filtradas = useMemo(() => {
    if (!busca.trim()) return saidas;
    const q = busca.toLowerCase();
    return saidas.filter(s => (s.descricao||'').toLowerCase().includes(q) || (s.categoria||'').toLowerCase().includes(q));
  }, [saidas, busca]);

  // Paginação
  const totalPags = Math.ceil(filtradas.length / porPagina);
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Agrupamento
  const agrupadas = useMemo(() => {
    const g = {};
    filtradas.forEach(s => {
      const c = s.categoria || 'Outros';
      if (!g[c]) g[c] = { nome: c, total: 0, itens: [] };
      g[c].total += Math.abs(parseFloat(s.valor) || 0);
      g[c].itens.push(s);
    });
    return Object.values(g).sort((a, b) => b.total - a.total);
  }, [filtradas]);

  const toggleGroup = n => setExpanded(p => { const nx = new Set(p); nx.has(n) ? nx.delete(n) : nx.add(n); return nx; });

  const excluir = async id => {
    if (!window.confirm('Excluir esta saída?')) return;
    try { await api.delete(`/transacoes/${id}`); carregarSaidas(); carregarResumo(); }
    catch { alert('Erro ao excluir.'); }
  };

  const editar     = s => { setEditData({ ...s, valor: s.valor?.toString(), data: (s.data||'').split('T')[0] }); setModalOpen(true); };
  const duplicar   = s => { setEditData({ ...s, id: undefined, data: today(), valor: s.valor?.toString() }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditData(null); };
  const onSuccess  = () => { carregarSaidas(); carregarResumo(); closeModal(); };

  // Derivados do resumo
  const R       = resumo || {};
  const total   = R.totalMes    || 0;
  const totalA  = R.totalAnt    || 0;
  const varPct  = R.variacao    || 0;
  const media   = R.mediaMensal || 0;
  const dias    = R.diasComGasto || 0;
  const maiorG  = R.maiorGasto  || null;
  const cats    = R.categorias  || [];
  const graf    = R.graficoAnual || [];
  const proxs   = R.proximasSaidas || [];

  const varPos  = varPct <= 0;
  const varCor  = varPos ? '#16A34A' : '#EF4444';
  const maiorC  = cats[0] || null;

  const insights = [
    maiorC
      ? { icon: '📊', bg: '#FEF2F2', c: '#EF4444', txt: `${maiorC.nome} é a maior categoria`, sub: `${fmt(maiorC.total)} — ${maiorC.pct}% do total` }
      : { icon: '📊', bg: '#F9FAFB', c: '#6B7280', txt: 'Nenhuma categoria registrada', sub: 'Adicione saídas para ver insights' },
    maiorG
      ? { icon: '⚠️', bg: '#FFFBEB', c: '#F59E0B', txt: `Maior gasto: ${maiorG.descricao}`, sub: `${fmt(maiorG.valor)} — ${maiorG.pct}% do total` }
      : { icon: '✅', bg: '#F0FDF4', c: '#16A34A', txt: 'Sem gastos no período', sub: 'O mês ainda está limpo!' },
    varPos
      ? { icon: '📉', bg: '#F0FDF4', c: '#16A34A', txt: 'Gastos reduziram vs mês anterior', sub: `${fmt(Math.abs(total - totalA))} a menos (${Math.abs(varPct)}%)` }
      : { icon: '📈', bg: '#FEF2F2', c: '#EF4444', txt: 'Gastos aumentaram vs mês anterior', sub: `${fmt(Math.abs(total - totalA))} a mais (${varPct}%)` },
  ];

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      <div style={S.page}>

        {/* HEADER */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Saídas</h1>
            <p style={S.sub}>Controle e classifique todos os seus gastos.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btnExp}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
            <button style={S.btnNew} onClick={() => { setEditData(null); setModalOpen(true); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova saída
            </button>
          </div>
        </div>

        {/* MENU DE CATEGORIAS — neutro, só maior em vermelho */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '6px 0 10px', scrollbarWidth: 'none' }}>
          {/* Chip "Todos" */}
          {[{ key: 'Todos', label: 'Todos', pct: 100, isTop: false }].concat(
            cats.map((c, i) => ({ key: c.nome, label: c.nome, pct: c.pct, isTop: i === 0 }))
          ).map(({ key, label, pct, isTop }) => {
            const active = catFiltro === key;
            return (
              <button key={key} onClick={() => setCatFiltro(key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 13px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 600 : 500, transition: 'all .15s',
                border:      active ? 'none'          : isTop ? '1px solid #FECACA' : '1px solid #E5E7EB',
                background:  active ? '#EF4444'       : isTop ? '#FEF2F2'           : '#fff',
                color:       active ? '#fff'           : isTop ? '#DC2626'           : '#374151',
              }}>
                {key !== 'Todos' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'rgba(255,255,255,.65)' : cor(key) }} />}
                {label}
                <span style={{ fontSize: 10, fontWeight: 400, opacity: active ? .85 : .65 }}>{pct}%</span>
              </button>
            );
          })}
        </div>

        {/* 6 KPIs */}
        <div style={S.kpiGrid}>
          {[
            { lbl: 'Total no mês',    val: fmt(total),   sub: `${MESES[mes-1]} ${ano}`,                             c: '#EF4444', vc: '#DC2626' },
            { lbl: 'Mês anterior',    val: fmt(totalA),  sub: MESES[mes === 1 ? 11 : mes - 2],                      c: '#9CA3AF', vc: '#374151' },
            { lbl: 'Variação',        val: `${varPct > 0 ? '+' : ''}${varPct}%`, sub: varPos ? 'Reduziu ✓' : 'Aumentou ↑', c: varCor, vc: varCor },
            { lbl: 'Maior gasto',     val: maiorG?.descricao || '—', sub: maiorG ? fmt(maiorG.valor) : 'Sem dados', c: '#F59E0B', vc: '#D97706', sm: true },
            { lbl: 'Dias com gasto',  val: String(dias),  sub: `em ${MESES[mes-1]}`,                                c: '#8B5CF6', vc: '#7C3AED' },
            { lbl: 'Média mensal',    val: fmt(media),   sub: `Jan–${MESES[mes-1]}`,                                c: '#3B82F6', vc: '#2563EB' },
          ].map(({ lbl, val, sub, c, vc, sm }) => (
            <div key={lbl} style={S.kpiCard}>
              <div style={S.kpiBar(c)} />
              <div style={S.kpiLbl}>{lbl}</div>
              {loadingRes ? <Skel h={22} /> : <div style={{ ...S.kpiVal(vc), fontSize: sm ? 15 : 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>}
              <div style={S.kpiSub}>{sub}</div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={S.filterRow}>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap' }}>Mês:</span>
          {MESES.map((m, i) => <button key={m} style={S.mChip(mes === i+1)} onClick={() => setMes(i+1)}>{m}</button>)}
          <input style={S.search} placeholder="Buscar descrição ou categoria…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {/* GRÁFICOS */}
        <div style={S.chartGrid}>
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Evolução {ano}</span>
              <span style={{ fontSize: 11, color: '#EF4444', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/relatorios')}>Ver relatório →</span>
            </div>
            {loadingRes ? <Skel h={160} /> : <BarAnual graf={graf} mes={mes} />}
          </div>

          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Gastos por categoria</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{MESES[mes-1]}</span>
            </div>
            {loadingRes ? <Skel h={150} /> : (
              <>
                <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 12px' }}>
                  <Donut total={total} cats={cats} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{fmt(total)}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF' }}>Total</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cats.slice(0,5).map(c => (
                    <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#374151' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor(c.nome) }} />{c.nome}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>{c.pct}%</span>
                        <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 5 }}>{fmt(c.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Insights</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: 9, borderRadius: 8, background: ins.bg, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: ins.c + '18', color: ins.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15 }}>{ins.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{ins.txt}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{ins.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RADAR CARROSSEL */}
        {!loadingRes && cats.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <RadarCarrossel cats={cats} />
          </div>
        )}

        {/* GRID: tabela + sidebar */}
        <div style={S.mainGrid}>

          {/* TABELA */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                Saídas de {MESES_FULL[mes - 1]}
                {filtradas.length > 0 && <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginLeft: 7 }}>{filtradas.length} lançamento{filtradas.length !== 1 ? 's' : ''}</span>}
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[5,10,20].map(n => (
                    <button key={n} onClick={() => { setPorPagina(n); setPagina(1); }} style={{ padding: '3px 7px', borderRadius: 5, border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: 11, background: porPagina === n ? '#EF4444' : '#fff', color: porPagina === n ? '#fff' : '#6B7280', cursor: 'pointer' }}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setAgrupado(a => !a)} style={{ padding: '3px 10px', borderRadius: 5, border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: 11, background: agrupado ? '#111827' : '#fff', color: agrupado ? '#fff' : '#6B7280', cursor: 'pointer' }}>
                  {agrupado ? 'Agrupar ✓' : 'Agrupar'}
                </button>
              </div>
            </div>

            {loadingList ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3].map(i => <Skel key={i} h={42} />)}</div>
            ) : agrupado ? (
              agrupadas.length === 0 ? <div style={S.empty}>Nenhuma saída encontrada.</div> : (
                agrupadas.map(g => (
                  <div key={g.nome} style={{ marginBottom: 8, border: '1px solid #F3F4F6', borderRadius: 8, overflow: 'hidden' }}>
                    <div onClick={() => toggleGroup(g.nome)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: '#FAFAFA', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cor(g.nome), flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{g.nome}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{g.itens.length} lançamento{g.itens.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{fmt(g.total)}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{expanded.has(g.nome) ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded.has(g.nome) && (
                      <table style={S.table}>
                        <tbody>
                          {g.itens.map(s => (
                            <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                              <td style={S.td}>{fmtDate(s.data)}</td>
                              <td style={S.td}>{s.descricao}</td>
                              <td style={{ ...S.td, ...S.tdRed }}>{fmt(s.valor)}</td>
                              <td style={S.td}>
                                <div style={{ display: 'flex', gap: 2 }}>
                                  <button style={S.actBtn} onClick={() => editar(s)}>✏️</button>
                                  <button style={S.actBtn} onClick={() => excluir(s.id)}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))
              )
            ) : paginadas.length === 0 ? (
              <div style={S.empty}>Nenhuma saída para o período selecionado.</div>
            ) : (
              <>
                <table style={S.table}>
                  <thead>
                    <tr>{['Data','Descrição','Categoria','Valor','Ações'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginadas.map(s => (
                      <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={S.td}>{fmtDate(s.data)}</td>
                        <td style={S.td}>{s.descricao}</td>
                        <td style={S.td}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cor(s.categoria), flexShrink: 0 }} />
                            {s.categoria || 'Outros'}
                          </span>
                        </td>
                        <td style={{ ...S.td, ...S.tdRed }}>{fmt(s.valor)}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button style={S.actBtn} title="Editar"   onClick={() => editar(s)}>✏️</button>
                            <button style={S.actBtn} title="Duplicar" onClick={() => duplicar(s)}>📋</button>
                            <button style={S.actBtn} title="Excluir"  onClick={() => excluir(s.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPags > 1 && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 12, justifyContent: 'center' }}>
                    {Array.from({ length: totalPags }, (_, i) => i+1).map(p => (
                      <button key={p} onClick={() => setPagina(p)} style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid #E5E7EB', background: pagina === p ? '#EF4444' : '#fff', color: pagina === p ? '#fff' : '#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 10 }} onClick={() => navigate('/transacoes')}>
              Ver todas as transações →
            </span>
          </div>

          {/* SIDEBAR */}
          <Sidebar proximas={proxs} cats={cats} faturas={faturas} loadingFat={loadingFat} mes={mes} />
        </div>

        {/* FORMULÁRIO NOVA SAÍDA */}
        <div style={{ ...S.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Adicionar nova saída</div>
          <div style={{ maxWidth: 580 }}>
            <FormSaida onSuccess={onSuccess} categoriasLista={categoriasLista} />
          </div>
        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.16)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{editData?.id ? 'Editar saída' : 'Nova saída'}</span>
              <button style={{ background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', color: '#9CA3AF' }} onClick={closeModal}>✕</button>
            </div>
            <FormSaida editData={editData} onSuccess={onSuccess} onCancel={closeModal} categoriasLista={categoriasLista} />
          </div>
        </div>
      )}
    </Layout>
  );
}
