import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_F = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CATS    = ['Renda Fixa','Renda Variável','Fundos Imobiliários','Cripto','Internacional','Outros'];

const CAT_CORES = {
  'Renda Fixa':          '#2563EB',
  'Renda Variável':      '#7C3AED',
  'Fundos Imobiliários': '#059669',
  'Cripto':              '#F59E0B',
  'Internacional':       '#0891B2',
  'Outros':              '#6B7280',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt     = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR') : '';
const today   = () => new Date().toISOString().split('T')[0];
const catCor  = (nome) => CAT_CORES[nome] || '#6B7280';

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const S = {
  page:      { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  topRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  title:     { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  sub:       { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  btnNew:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,.3)', fontFamily: 'inherit' },

  kpiRow:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', margin: '14px 0' },
  kpiCard:   { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  kpiLabel:  { fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', color: '#6B7280', textTransform: 'uppercase', marginTop: '8px', marginBottom: '6px' },
  kpiValue:  (c) => ({ fontSize: '22px', fontWeight: 700, color: c || '#111827', letterSpacing: '-.5px' }),
  kpiSub:    { fontSize: '12px', color: '#6B7280', marginTop: '3px' },

  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '12px 16px', marginBottom: '14px' },
  navBtn:      { padding: '4px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: '13px', fontFamily: 'inherit' },
  monthChip:   (a) => ({ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: a ? '#7C3AED' : 'transparent', color: a ? '#fff' : '#6B7280', transition: 'all .15s', fontFamily: 'inherit' }),
  chip:        (a, c = '#7C3AED') => ({ padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: a ? 'none' : '1px solid #E5E7EB', background: a ? c : '#F9FAFB', color: a ? '#fff' : '#374151', transition: 'all .15s', fontFamily: 'inherit' }),
  filterLabel: { fontSize: '12px', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' },
  divider:     { width: '1px', height: '20px', background: '#E5E7EB' },

  grid:      { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', alignItems: 'start' },
  card:      { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th:        { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' },
  td:        { padding: '12px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #F9FAFB' },

  catCard:   { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '16px 18px' },
  catTitle:  { fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '14px' },
  catRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  catBar:    { height: '5px', borderRadius: '3px', background: '#F3F4F6', margin: '4px 0 8px', overflow: 'hidden' },
  catFill:   (pct, c) => ({ height: '100%', width: `${Math.min(Math.max(isFinite(pct) ? pct : 0, 0), 100)}%`, background: c, borderRadius: '3px' }),
  catName:   { fontSize: '13px', color: '#374151', fontWeight: 500 },
  catVal:    { fontSize: '13px', color: '#111827', fontWeight: 600 },
  catPct:    { fontSize: '11px', color: '#6B7280' },

  badge:     (cor) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: `${cor}18`, color: cor }),
  dot:       (cor) => ({ width: '6px', height: '6px', borderRadius: '50%', background: cor, flexShrink: 0 }),
  btnAction: (c)   => ({ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${c}20`, background: `${c}10`, color: c, fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }),
  empty:     { padding: '48px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal:      { background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 16px 48px rgba(0,0,0,.18)' },
  modalTitle: { fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '20px' },
  label:      { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' },
  input:      { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:     { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' },
  fgroup:     { marginBottom: '14px' },
  row2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' },
  errMsg:     { fontSize: '12px', color: '#DC2626', marginTop: '10px' },
  modalBtns:  { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' },
  btnCancel:  { padding: '9px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnSave:    { padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

const emptyForm = { data: today(), categoria: 'Renda Fixa', descricao: '', valor: '' };

// ─── SVG LINE CHART ───────────────────────────────────────────────────────────

function PatrimonioChart({ data }) {
  const valid = data.filter(d => d.valor !== null);
  if (valid.length === 0) return (
    <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12 }}>
      Nenhum dado registrado — clique em um mês abaixo para começar
    </div>
  );
  const vals  = valid.map(d => d.valor);
  const maxV  = Math.max(...vals);
  const minV  = Math.min(...vals);
  const range = maxV - minV || maxV || 1;
  const W = 620, H = 80, PX = 4, PY = 8, labelH = 16;
  const iH = H - 2 * PY;
  const pts = data.map((d, i) => ({
    x: PX + (i / 11) * (W - 2 * PX),
    y: d.valor !== null ? PY + (1 - (d.valor - minV) / range) * iH : null,
    ...d,
  }));
  const segs = [];
  let cur = [];
  pts.forEach(p => {
    if (p.y !== null) cur.push(p);
    else { if (cur.length) { segs.push(cur); cur = []; } }
  });
  if (cur.length) segs.push(cur);
  const base = PY + iH;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + labelH}`} style={{ display: 'block' }}>
      {segs.map((seg, si) => {
        if (seg.length < 2) return null;
        const line = seg.map(p => `${p.x},${p.y}`).join(' ');
        const area = `${seg[0].x},${base} ${line} ${seg[seg.length - 1].x},${base}`;
        return (
          <g key={si}>
            <polygon points={area} fill="rgba(124,58,237,0.07)" />
            <polyline points={line} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {pts.filter(p => p.y !== null).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.manual ? 5 : 3.5}
          fill={p.manual ? '#7C3AED' : '#A78BFA'} stroke="#fff" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H + labelH - 2} textAnchor="middle" fontSize="9" fill="#9CA3AF">{MESES[i]}</text>
      ))}
    </svg>
  );
}

// ─── MODAL UNIFICADO ─────────────────────────────────────────────────────────
// Modos: 'aporte' | 'retirada' | 'patrimonio'

const MODAL_TYPES = [
  { id: 'aporte',     label: 'Aporte',       cor: '#7C3AED', sub: 'Compra / aplicação' },
  { id: 'retirada',   label: 'Retirada',      cor: '#DC2626', sub: 'Resgate / venda' },
  { id: 'patrimonio', label: 'Atualizar PL',  cor: '#059669', sub: 'Definir / ajustar' },
];

const TIPO_PL = [
  { id: 'valor_total', label: 'Definir valor total', cor: '#059669', hint: 'Informe o saldo total atual de todos os seus ativos.' },
  { id: 'adicionar',   label: 'Adicionar',           cor: '#2563EB', hint: 'Aporte, rendimento ou ganho a somar ao PL atual.' },
  { id: 'retirada',    label: 'Retirar',              cor: '#DC2626', hint: 'Resgate, perda ou saída a subtrair do PL atual.' },
];

const TIPO_PL_LABEL = { valor_total: 'total', adicionar: 'adição', retirada: 'retirada' };

function UnifiedModal({
  mode, onModeChange, editId,
  form, onFormChange, error, onSave, saving,
  patMes, patAno, onPatMesChange, onPatAnoChange,
  patVal, onPatValChange, patTipo, onPatTipoChange,
  patMovs, onDeleteMov,
  patError, onSavePat, savingPat,
  onClose,
}) {
  const set = (k, v) => onFormChange(f => ({ ...f, [k]: v }));
  const isMovimento = mode === 'aporte' || mode === 'retirada';
  const tipoAtual   = TIPO_PL.find(t => t.id === patTipo) || TIPO_PL[0];
  const mesSel      = patMes || new Date().getMonth() + 1;

  const title = editId
    ? 'Editar Aporte'
    : mode === 'aporte'
      ? 'Registrar Aporte'
      : mode === 'retirada'
        ? 'Registrar Retirada'
        : 'Atualizar Patrimônio Líquido';

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {/* Seletor de tipo — escondido ao editar transação existente */}
        {!editId && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: '#F3F4F6', borderRadius: 10 }}>
            {MODAL_TYPES.map(t => (
              <button key={t.id} onClick={() => onModeChange(t.id)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 7, border: 'none', fontFamily: 'inherit',
                background:  mode === t.id ? '#fff' : 'transparent',
                color:       mode === t.id ? t.cor : '#9CA3AF',
                fontWeight:  mode === t.id ? 700 : 400,
                fontSize: 12, cursor: 'pointer',
                boxShadow:   mode === t.id ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s',
              }}>
                <div>{t.label}</div>
                <div style={{ fontSize: 9, fontWeight: 400, color: mode === t.id ? '#9CA3AF' : '#CBD5E1', marginTop: 1 }}>{t.sub}</div>
              </button>
            ))}
          </div>
        )}

        <div style={S.modalTitle}>{title}</div>

        {isMovimento ? (
          <>
            <div style={S.row2}>
              <div>
                <label style={S.label}>Data</label>
                <input style={S.input} type="date" value={form.data} onChange={e => set('data', e.target.value)} />
              </div>
              <div>
                <label style={S.label}>Valor (R$)</label>
                <input style={S.input} type="number" step="0.01" min="0.01" value={form.valor}
                  onChange={e => set('valor', e.target.value)} placeholder="0,00" />
                {mode === 'retirada' && (
                  <div style={{ fontSize: 10, color: '#DC2626', marginTop: 3 }}>Salvo como valor negativo</div>
                )}
              </div>
            </div>
            <div style={S.fgroup}>
              <label style={S.label}>Categoria</label>
              <select style={S.select} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={S.fgroup}>
              <label style={S.label}>Descrição</label>
              <input style={S.input} type="text" value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
                placeholder={mode === 'retirada' ? 'Ex: Resgate IPCA+' : 'Ex: Tesouro Selic 2029'} />
            </div>
            {error && <div style={S.errMsg}>{error}</div>}
            <div style={S.modalBtns}>
              <button style={S.btnCancel} onClick={onClose}>Cancelar</button>
              <button style={{ ...S.btnSave, background: mode === 'retirada' ? '#DC2626' : '#7C3AED' }}
                onClick={onSave} disabled={saving}>
                {saving ? 'Salvando…' : mode === 'retirada' ? 'Salvar Retirada' : 'Salvar Aporte'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Período de referência — sempre visível, pré-preenchido ao clicar na grade */}
            <div style={S.row2}>
              <div>
                <label style={S.label}>Mês de referência</label>
                <select style={S.select} value={mesSel} onChange={e => onPatMesChange(parseInt(e.target.value))}>
                  {MESES_F.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Ano</label>
                <input style={S.input} type="number" value={patAno} min="2020" max="2099"
                  onChange={e => onPatAnoChange(parseInt(e.target.value))} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', background: '#F9FAFB', borderRadius: 6, padding: '6px 10px', marginBottom: 12 }}>
              O valor registrado em <strong>{MESES_F[mesSel - 1]}/{patAno}</strong> será herdado pelos meses seguintes que não tiverem registro próprio.
            </div>

            {/* Seletor de tipo de movimento PL */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {TIPO_PL.map(t => (
                <button key={t.id} onClick={() => onPatTipoChange(t.id)} style={{
                  flex: 1, padding: '7px 6px', borderRadius: 7, fontFamily: 'inherit', fontSize: 11,
                  border: patTipo === t.id ? `1.5px solid ${t.cor}` : '1.5px solid #E5E7EB',
                  background: patTipo === t.id ? `${t.cor}15` : '#F9FAFB',
                  color: patTipo === t.id ? t.cor : '#6B7280',
                  fontWeight: patTipo === t.id ? 700 : 400, cursor: 'pointer',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={S.fgroup}>
              <label style={S.label}>
                {patTipo === 'valor_total' ? 'Valor total atual (R$)' : patTipo === 'adicionar' ? 'Valor a adicionar (R$)' : 'Valor a retirar (R$)'}
              </label>
              <input style={S.input} type="number" step="0.01" min="0" autoFocus
                value={patVal} onChange={e => onPatValChange(e.target.value)} placeholder="0,00" />
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>{tipoAtual.hint}</div>
            </div>

            {patError && <div style={S.errMsg}>{patError}</div>}

            <div style={S.modalBtns}>
              <button style={S.btnCancel} onClick={onClose}>Cancelar</button>
              <button style={{ ...S.btnSave, background: tipoAtual.cor }} onClick={onSavePat} disabled={savingPat}>
                {savingPat ? 'Salvando…' : `Salvar ${TIPO_PL_LABEL[patTipo] || 'PL'}`}
              </button>
            </div>

            {/* Histórico de movimentos do mês */}
            {patMovs && patMovs.length > 0 && (
              <div style={{ marginTop: 16, borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                  Movimentos deste mês
                </div>
                {patMovs.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F9FAFB' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4, marginRight: 6,
                        background: m.tipo === 'valor_total' ? '#D1FAE5' : m.tipo === 'adicionar' ? '#DBEAFE' : '#FEE2E2',
                        color:      m.tipo === 'valor_total' ? '#059669' : m.tipo === 'adicionar' ? '#2563EB' : '#DC2626',
                      }}>{m.tipo === 'valor_total' ? 'total' : m.tipo === 'adicionar' ? '+' : '−'}</span>
                      <span style={{ fontSize: 12, color: '#374151' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.valor)}
                      </span>
                      {m.descricao && <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{m.descricao}</span>}
                    </div>
                    <button onClick={() => onDeleteMov(m.id)} style={{ fontSize: 11, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function InvestimentosPage() {
  const now = new Date();
  const [mes,      setMes]      = useState(now.getMonth() + 1);
  const [ano,      setAno]      = useState(now.getFullYear());
  const [catFiltro, setCatFiltro] = useState('Todos');

  const [dados,   setDados]   = useState({ patrimonioTotal: 0, aporteMes: 0, totalAno: 0, categorias: [], historico: [] });
  const [loading, setLoading] = useState(false);

  // ── Estado modal unificado ──────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false);
  const [modalMode,   setModalMode]   = useState('aporte'); // 'aporte' | 'retirada' | 'patrimonio'
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  // patrimônio
  const [patModalMes, setPatModalMes] = useState(null);     // null = user escolhe via select
  const [patModalAno, setPatModalAno] = useState(now.getFullYear());
  const [patVal,      setPatVal]      = useState('');
  const [patTipo,     setPatTipo]     = useState('valor_total'); // 'valor_total'|'adicionar'|'retirada'
  const [patMovs,     setPatMovs]     = useState([]);            // movimentos do mês aberto no modal
  const [savingPatr,  setSavingPatr]  = useState(false);
  const [patError,    setPatError]    = useState('');

  // ── Estado patrimônio histórico ─────────────────────────────────────────────
  const [anoPatr,     setAnoPatr]     = useState(now.getFullYear());
  const [patrimonio,  setPatrimonio]  = useState(
    Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, valor: null, manual: false }))
  );
  const [loadingPatr, setLoadingPatr] = useState(false);

  // ── Carga ───────────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/investimentos/resumo', { params: { mes, ano } });
      setDados(data);
    } catch (e) {
      console.error('Erro ao carregar investimentos:', e);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const carregarPatrimonio = useCallback(async () => {
    setLoadingPatr(true);
    try {
      const { data } = await api.get('/patrimonio', { params: { ano: anoPatr } });
      setPatrimonio(data);
    } catch (e) {
      console.error('Erro ao carregar patrimônio:', e);
    } finally {
      setLoadingPatr(false);
    }
  }, [anoPatr]);

  useEffect(() => { carregar(); },           [carregar]);
  useEffect(() => { carregarPatrimonio(); }, [carregarPatrimonio]);

  // ── Navegação mês ───────────────────────────────────────────────────────────

  const navMes = (delta) => {
    let m = mes + delta, a = ano;
    if (m > 12) { m = 1;  a += 1; }
    if (m < 1)  { m = 12; a -= 1; }
    setMes(m); setAno(a);
  };

  // ── Histórico filtrado ──────────────────────────────────────────────────────

  const historico = useMemo(() => {
    if (catFiltro === 'Todos') return dados.historico;
    return dados.historico.filter(t => t.categoria === catFiltro);
  }, [dados.historico, catFiltro]);

  // ── Handlers do modal ───────────────────────────────────────────────────────

  const closeModal = () => {
    setShowModal(false); setEditId(null); setPatModalMes(null); setPatMovs([]);
  };

  const changeModalMode = (m) => {
    setModalMode(m); setError(''); setPatError('');
    if (m === 'patrimonio' && !patModalMes) {
      setPatModalMes(now.getMonth() + 1);
      setPatModalAno(now.getFullYear());
      setPatTipo('valor_total');
    }
  };

  const openNew = () => {
    setModalMode('aporte'); setEditId(null); setForm(emptyForm);
    setError(''); setPatVal(''); setShowModal(true);
  };

  const openEdit = (t) => {
    setModalMode('aporte'); setEditId(t.id);
    setForm({
      data:      t.data ? t.data.split('T')[0] : today(),
      categoria: t.categoria || 'Renda Fixa',
      descricao: t.descricao || '',
      valor:     String(Math.abs(parseFloat(t.valor)) || ''),
    });
    setError(''); setShowModal(true);
  };

  const openPatrimonio = (p) => {
    setModalMode('patrimonio'); setEditId(null);
    setPatModalMes(p.mes); setPatModalAno(anoPatr);
    setPatVal(''); setPatTipo('valor_total');
    setPatMovs(p.movimentacoes || []);
    setPatError(''); setShowModal(true);
  };

  // ── Salvar aporte / retirada ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    const v = parseFloat(form.valor.toString().replace(',', '.'));
    if (!v || v <= 0) return setError('Informe um valor válido.');
    if (!form.data)   return setError('Informe a data.');
    setSaving(true); setError('');
    try {
      const valor   = modalMode === 'retirada' ? -v : v;
      const payload = { descricao: form.descricao.trim(), valor, tipo: 'investimento', categoria: form.categoria, data: form.data };
      if (editId) await api.put(`/transacoes/${editId}`, payload);
      else        await api.post('/transacoes', payload);
      closeModal(); carregar();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // ── Salvar / limpar patrimônio ──────────────────────────────────────────────

  const salvarPatr = async () => {
    const v   = parseFloat(patVal.toString().replace(',', '.'));
    if (isNaN(v) || v < 0) return setPatError('Informe um valor válido (≥ 0).');
    const mes = patModalMes || (now.getMonth() + 1);
    const ano = patModalAno;
    // 'retirada' no seletor de tipo PL mapeia para tipo 'retirar' na API
    const tipo = patTipo === 'retirada' ? 'retirar' : patTipo;
    setSavingPatr(true); setPatError('');
    try {
      const { data: novo } = await api.post('/patrimonio', { mes, ano, tipo, valor: v });
      setPatMovs(prev => [...prev, { ...novo, valor: v }]);
      setPatVal('');
      if (ano === anoPatr) carregarPatrimonio();
    } catch (e) {
      setPatError(e?.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSavingPatr(false);
    }
  };

  const deleteMov = async (id) => {
    try {
      await api.delete(`/patrimonio/movimentacoes/${id}`);
      setPatMovs(prev => prev.filter(m => m.id !== id));
      carregarPatrimonio();
    } catch (e) { console.error(e); }
  };

  const limparPatr = async (mesNum) => {
    if (!window.confirm('Remover todos os movimentos deste mês? O mês voltará a herdar o valor anterior.')) return;
    try { await api.delete(`/patrimonio/${mesNum}/${anoPatr}`); carregarPatrimonio(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este aporte?')) return;
    try { await api.delete(`/transacoes/${id}`); carregar(); }
    catch (e) { console.error(e); }
  };

  // ── KPIs ────────────────────────────────────────────────────────────────────

  // Só considera meses já passados — não herda de meses futuros
  const anoHoje = now.getFullYear(), mesHoje = now.getMonth() + 1;
  const limiteMes = anoPatr < anoHoje ? 12 : anoPatr > anoHoje ? 0 : Math.min(mes, mesHoje);
  const ultimoManual  = patrimonio.slice(0, limiteMes).reverse().find(p => p.manual);
  const patrimonioKPI = ultimoManual?.valor ?? dados.patrimonioTotal;
  const catsAtivas    = dados.categorias.length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div style={S.page}>

        {/* Cabeçalho */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Investimentos</h1>
            <p style={S.sub}>Aportes, retiradas e acompanhamento do patrimônio líquido</p>
          </div>
          <button style={S.btnNew} onClick={openNew}>+ Novo lançamento</button>
        </div>

        {/* KPIs */}
        <div style={S.kpiRow}>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#7C3AED')} />
            <div style={S.kpiLabel}>Patrimônio Total</div>
            <div style={S.kpiValue('#7C3AED')}>{fmt(patrimonioKPI)}</div>
            <div style={S.kpiSub}>{ultimoManual ? `${MESES[ultimoManual.mes - 1]}/${anoPatr} · manual` : 'soma dos aportes'}</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#2563EB')} />
            <div style={S.kpiLabel}>Aporte do Mês</div>
            <div style={S.kpiValue('#1D4ED8')}>{fmt(dados.aporteMes)}</div>
            <div style={S.kpiSub}>{MESES[mes - 1]}/{ano}</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#059669')} />
            <div style={S.kpiLabel}>Total no Ano</div>
            <div style={S.kpiValue('#047857')}>{fmt(dados.totalAno)}</div>
            <div style={S.kpiSub}>Jan – {MESES[mes - 1]}</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#F59E0B')} />
            <div style={S.kpiLabel}>Categorias</div>
            <div style={S.kpiValue('#B45309')}>{catsAtivas}</div>
            <div style={S.kpiSub}>{catsAtivas === 1 ? 'ativo' : 'ativos'} com aportes</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={S.filterRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button style={S.navBtn} onClick={() => navMes(-1)}>‹</button>
            {MESES.map((m, i) => (
              <button key={m} style={S.monthChip(mes === i + 1)} onClick={() => setMes(i + 1)}>{m}</button>
            ))}
            <button style={S.navBtn} onClick={() => navMes(1)}>›</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginLeft: '4px' }}>{ano}</span>
          </div>
          <div style={S.divider} />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={S.filterLabel}>Categoria:</span>
            <button style={S.chip(catFiltro === 'Todos')} onClick={() => setCatFiltro('Todos')}>Todos</button>
            {CATS.map(c => (
              <button key={c} style={S.chip(catFiltro === c, catCor(c))} onClick={() => setCatFiltro(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Tabela + breakdown */}
        <div style={S.grid}>
          <div style={S.card}>
            {loading ? (
              <div style={S.empty}>Carregando…</div>
            ) : historico.length === 0 ? (
              <div style={S.empty}>Nenhum lançamento em {MESES[mes - 1]}/{ano}{catFiltro !== 'Todos' ? ` · ${catFiltro}` : ''}.</div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Data</th>
                    <th style={S.th}>Descrição</th>
                    <th style={S.th}>Categoria</th>
                    <th style={{ ...S.th, textAlign: 'right' }}>Valor</th>
                    <th style={{ ...S.th, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map(t => {
                    const v   = parseFloat(t.valor) || 0;
                    const cor = catCor(t.categoria);
                    return (
                      <tr key={t.id}>
                        <td style={S.td}>{fmtDate(t.data)}</td>
                        <td style={{ ...S.td, fontWeight: 500, color: '#111827' }}>{t.descricao}</td>
                        <td style={S.td}>
                          <span style={S.badge(cor)}>
                            <span style={S.dot(cor)} />{t.categoria}
                          </span>
                        </td>
                        <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: v >= 0 ? '#7C3AED' : '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                          {v >= 0 ? '+' : ''}{fmt(v)}
                        </td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button style={S.btnAction('#2563EB')} onClick={() => openEdit(t)}>Editar</button>
                            <button style={S.btnAction('#DC2626')} onClick={() => handleDelete(t.id)}>Remover</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={S.catCard}>
            <div style={S.catTitle}>Distribuição do Patrimônio</div>
            {dados.categorias.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Sem aportes registrados.</p>
            ) : dados.categorias.map(c => {
              const cor = catCor(c.nome);
              return (
                <div key={c.nome}>
                  <div style={S.catRow}>
                    <span style={S.catName}>{c.nome}</span>
                    <span style={S.catVal}>{fmt(c.total)}</span>
                  </div>
                  <div style={S.catBar}><div style={S.catFill(c.pct, cor)} /></div>
                  <div style={{ ...S.catPct, marginBottom: '10px' }}>{c.pct}% do patrimônio</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Patrimônio Líquido — Histórico ───────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E5E7EB', padding: '18px 20px', marginTop: 14 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Patrimônio Líquido — Histórico</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                Valor total registrado manualmente · meses sem registro herdam o valor anterior
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={S.navBtn} onClick={() => setAnoPatr(a => a - 1)}>‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 40, textAlign: 'center' }}>{anoPatr}</span>
              <button style={S.navBtn} onClick={() => setAnoPatr(a => a + 1)}>›</button>
            </div>
          </div>

          {loadingPatr ? (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12 }}>Carregando…</div>
          ) : (
            <PatrimonioChart data={patrimonio} />
          )}

          {/* Grid 12 meses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 10 }}>
            {patrimonio.map((p) => {
              const isManual = p.manual;
              const hasVal   = p.valor !== null;
              return (
                <div key={p.mes} style={{
                  background:   isManual ? '#F5F3FF' : '#FAFAFA',
                  border:       `1px solid ${isManual ? '#7C3AED40' : '#E5E7EB'}`,
                  borderRadius: 8,
                  padding:      '10px 10px 8px',
                }}>
                  <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginBottom: 3 }}>{MESES[p.mes - 1]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isManual ? '#7C3AED' : hasVal ? '#9CA3AF' : '#D1D5DB', marginBottom: 6 }}>
                    {hasVal ? fmt(p.valor) : '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4, color: isManual ? '#7C3AED' : '#9CA3AF', background: isManual ? '#EDE9FE' : '#F3F4F6' }}>
                      {isManual ? `${p.movimentacoes?.length || 1} mov.` : hasVal ? 'herdado' : 'vazio'}
                    </span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button style={{ fontSize: 10, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: 'inherit' }}
                        onClick={() => openPatrimonio(p)}>
                        + mov.
                      </button>
                      {isManual && (
                        <button style={{ fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontFamily: 'inherit' }}
                          onClick={() => limparPatr(p.mes)}>
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }} />
              <span style={{ fontSize: 11, color: '#6B7280' }}>Manual — valor registrado por você</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA' }} />
              <span style={{ fontSize: 11, color: '#6B7280' }}>Herdado — copiado do último mês com registro</span>
            </div>
          </div>
        </div>

      </div>

      {showModal && (
        <UnifiedModal
          mode={modalMode}        onModeChange={changeModalMode}
          editId={editId}
          form={form}             onFormChange={setForm}
          error={error}           onSave={handleSave}          saving={saving}
          patMes={patModalMes}    patAno={patModalAno}
          onPatMesChange={setPatModalMes} onPatAnoChange={setPatModalAno}
          patVal={patVal}         onPatValChange={setPatVal}
          patTipo={patTipo}       onPatTipoChange={setPatTipo}
          patMovs={patMovs}       onDeleteMov={deleteMov}
          patError={patError}     onSavePat={salvarPatr}       savingPat={savingPatr}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}
