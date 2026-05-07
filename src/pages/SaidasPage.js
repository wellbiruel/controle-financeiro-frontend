import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATEGORIAS_SAIDA_DEFAULT = ['Cartões','Casa','Transporte','Alimentação','Saúde','Lazer','Outros'];

const FORMAS_PGTO   = ['Débito','Crédito','PIX','Dinheiro','Boleto','TED/DOC','Outro'];
const RECORRENCIAS  = ['Única','Mensal','Quinzenal','Semanal','Anual'];
const STATUS_OPTS   = ['Pago','Pendente','Agendado'];

const CAT_DOTS = {
  'Cartões':      '#EF4444',
  'Casa':         '#F97316',
  'Transporte':   '#3B82F6',
  'Alimentação':  '#22C55E',
  'Saúde':        '#8B5CF6',
  'Lazer':        '#EC4899',
  'Outros':       '#6B7280',
};

const STATUS_BADGE = {
  'Pago':      { bg: '#DCFCE7', color: '#16A34A' },
  'Pendente':  { bg: '#FEF3C7', color: '#D97706' },
  'Agendado':  { bg: '#F3F4F6', color: '#6B7280' },
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
  page: { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },

  topRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  pageSub:   { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  topBtns:   { display: 'flex', gap: '10px' },

  btnExport: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #E9ECEF', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnNew:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,.28)', fontFamily: 'inherit' },

  kpiRow:  { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' },
  kpiCard: { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c, borderRadius: '10px 10px 0 0' }),
  kpiLabel:  { fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px', marginBottom: '6px' },
  kpiValue:  (c) => ({ fontSize: '21px', fontWeight: 700, color: c || '#111827', lineHeight: 1.1, letterSpacing: '-.5px' }),
  kpiSub:    { fontSize: '12px', color: '#6B7280', marginTop: '2px' },

  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '12px 16px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '5px' },
  filterLabel: { fontSize: '12px', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' },
  chip: (active) => ({ padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: active ? 'none' : '1px solid #E5E7EB', background: active ? '#EF4444' : '#F9FAFB', color: active ? '#fff' : '#374151', transition: 'all .15s', fontFamily: 'inherit' }),
  monthChip: (active) => ({ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#EF4444' : 'transparent', color: active ? '#fff' : '#6B7280', transition: 'all .15s', fontFamily: 'inherit' }),
  searchInput: { flex: 1, minWidth: '160px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', background: '#fff', fontFamily: 'inherit' },
  btnFilter: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 11px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' },

  card: { background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '0.5px solid #E5E7EB' },
  cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#111827' },
  cardLink:  { fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontWeight: 500 },

  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' },

  // Gráfico barras
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
  insightTxt: { fontSize: '12px', fontWeight: 600, color: '#111827' },
  insightSub: { fontSize: '11px', color: '#6B7280', marginTop: '1px' },

  // Banner
  banner: { background: '#FEF2F2', border: '0.5px solid #FECACA', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' },
  bannerClose: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', lineHeight: 1, padding: '2px' },

  // Grid 2 colunas (tabela + form)
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'flex-start' },

  // Tabela
  tableTitle: { fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '14px' },
  table:    { width: '100%', borderCollapse: 'collapse' },
  th:       { textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.5px', padding: '7px 10px', borderBottom: '0.5px solid #F3F4F6', whiteSpace: 'nowrap' },
  td:       { padding: '11px 10px', fontSize: '13px', color: '#374151', borderBottom: '0.5px solid #F9FAFB', verticalAlign: 'middle' },
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

  // Footer
  footer:     { background: '#fff', borderRadius: '10px', padding: '16px 20px', border: '0.5px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  footerMain: { flex: 1, minWidth: '180px' },
  footerPill: (c) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: c + '12', border: `1px solid ${c}30`, fontSize: '12px', fontWeight: 500, color: c }),
};

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function DonutSaidas({ total, categorias }) {
  const CX = 65, CY = 65, R = 50, stroke = 20;
  const circ = 2 * Math.PI * R;
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

// ─── BAR CHART SAÍDAS ────────────────────────────────────────────────────────

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

// ─── FORMULÁRIO NOVA SAÍDA ───────────────────────────────────────────────────

const emptyForm = { categoria: '', descricao: '', valor: '', data: today(), fonte: '', forma_pagamento: '', recorrencia: 'Única', status: 'Pago', observacao: '' };

function FormSaida({ editData, onSuccess, onCancel, categorias }) {
  const [form, setForm]   = useState(editData ? { ...emptyForm, ...editData } : emptyForm);
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
      descricao:  form.descricao,
      valor:      parseFloat(form.valor.toString().replace(',', '.')),
      tipo:       'saida',
      data:       form.data,
      categoria:  form.categoria || 'Outros',
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
          <label style={S.formLabel}>Fonte / Origem</label>
          <input style={S.formInput} placeholder="Ex: Bradesco, Nubank..."
            value={form.fonte} onChange={e => set('fonte', e.target.value)} />
        </div>
        <div style={ig}>
          <label style={S.formLabel}>Forma de pagamento</label>
          <select style={S.formSel} value={form.forma_pagamento} onChange={e => set('forma_pagamento', e.target.value)}>
            <option value="">Selecione</option>
            {FORMAS_PGTO.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div style={S.formRow}>
        <div style={ig}>
          <label style={S.formLabel}>Recorrência</label>
          <select style={S.formSel} value={form.recorrencia} onChange={e => set('recorrencia', e.target.value)}>
            {RECORRENCIAS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={ig}>
          <label style={S.formLabel}>Status</label>
          <select style={S.formSel} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={S.formGroup}>
        <label style={S.formLabel}>Observação (opcional)</label>
        <input style={S.formInput} placeholder="Adicionar observação..."
          value={form.observacao} onChange={e => set('observacao', e.target.value)} />
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

  const [mes,         setMes]         = useState(hoje.getMonth() + 1);
  const [ano]                         = useState(hoje.getFullYear());
  const [catFiltro,   setCatFiltro]   = useState('Todos');
  const [busca,       setBusca]       = useState('');
  const [resumo,      setResumo]      = useState(null);
  const [saidas,      setSaidas]      = useState([]);
  const [loadingRes,  setLoadingRes]  = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [editData,    setEditData]    = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [banner,      setBanner]      = useState(true);
  const [pagina,      setPagina]      = useState(1);
  const [categoriasLista, setCategoriasLista] = useState(['Todos', ...CATEGORIAS_SAIDA_DEFAULT]);
  const POR_PAGINA = 10;

  useEffect(() => {
    api.get('/categorias?tipo=saida').then(r => {
      const nomes = r.data.map(c => c.nome);
      const merged = ['Todos', ...new Set([...nomes, ...CATEGORIAS_SAIDA_DEFAULT])].sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b, 'pt-BR'));
      setCategoriasLista(merged);
    }).catch(() => {});
  }, []);

  const carregarResumo = useCallback(async () => {
    try {
      setLoadingRes(true);
      const r = await api.get(`/transacoes/resumo-saidas?mes=${mes}&ano=${ano}`);
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

  useEffect(() => { carregarResumo(); },  [carregarResumo]);
  useEffect(() => { carregarSaidas(); setPagina(1); }, [carregarSaidas]);

  const saidasFiltradas = useMemo(() => {
    if (!busca.trim()) return saidas;
    const q = busca.toLowerCase();
    return saidas.filter(s =>
      (s.descricao || '').toLowerCase().includes(q) ||
      (s.categoria || '').toLowerCase().includes(q)
    );
  }, [saidas, busca]);

  const totalPages = Math.ceil(saidasFiltradas.length / POR_PAGINA);
  const saidasPag  = saidasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

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

  const onSuccess = () => { carregarSaidas(); carregarResumo(); closeModal(); };

  // Dados derivados do resumo
  const R        = resumo || {};
  const total    = R.totalMes || 0;
  const maiorCat = R.maiorCategoria || null;
  const maiorG   = R.maiorGasto || null;
  const variacao = R.variacao || { valor: 0, pct: 0 };
  const media    = R.mediaMensalAno || 0;
  const graf     = R.graficoAnual || [];
  const cats     = R.categorias || [];

  const variacaoPos = variacao.valor <= 0; // reduziu = positivo
  const variacaoCor = variacaoPos ? '#16A34A' : '#EF4444';

  // Insights dinâmicos
  const insights = [
    maiorCat
      ? { icon: '📊', color: '#EF4444', bg: '#FEF2F2', txt: `${maiorCat.nome} é sua maior categoria`, sub: `${fmt(maiorCat.total)} — ${maiorCat.pct}% do total` }
      : { icon: '📊', color: '#6B7280', bg: '#F9FAFB', txt: 'Nenhuma categoria registrada', sub: 'Adicione saídas para ver insights' },
    maiorG
      ? { icon: '⚠️', color: '#F59E0B', bg: '#FFFBEB', txt: `Maior gasto: ${maiorG.descricao}`, sub: `${fmt(maiorG.valor)} — ${maiorG.pct}% do total` }
      : { icon: '✅', color: '#16A34A', bg: '#F0FDF4', txt: 'Sem gastos registrados', sub: 'O mês ainda está limpo!' },
    variacaoPos
      ? { icon: '📉', color: '#16A34A', bg: '#F0FDF4', txt: 'Gastos reduziram vs mês anterior', sub: `${fmt(Math.abs(variacao.valor))} a menos (${Math.abs(variacao.pct)}%)` }
      : { icon: '📈', color: '#EF4444', bg: '#FEF2F2', txt: 'Gastos aumentaram vs mês anterior', sub: `${fmt(Math.abs(variacao.valor))} a mais (${Math.abs(variacao.pct)}%)` },
  ];

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
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

        {/* 5 KPIs */}
        <div style={S.kpiRow}>
          {/* Total */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#EF4444')} />
            <div style={S.kpiLabel}>Total no mês</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#DC2626')}>{fmt(total)}</div>}
            <div style={S.kpiSub}>{MESES[mes - 1]} {ano}</div>
          </div>

          {/* Maior categoria */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#F97316')} />
            <div style={S.kpiLabel}>Maior categoria</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#D97706')}>{maiorCat?.nome || '—'}</div>}
            <div style={S.kpiSub}>{maiorCat ? `${fmt(maiorCat.total)} · ${maiorCat.pct}%` : 'Sem dados'}</div>
          </div>

          {/* Maior gasto */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#EF4444')} />
            <div style={S.kpiLabel}>Maior gasto</div>
            {loadingRes ? <Skel /> : <div style={{ ...S.kpiValue('#DC2626'), fontSize: '18px' }}>{maiorG?.descricao || '—'}</div>}
            <div style={S.kpiSub}>{maiorG ? fmt(maiorG.valor) : 'Sem dados'}</div>
          </div>

          {/* Variação */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent(variacaoCor)} />
            <div style={S.kpiLabel}>Variação vs mês ant.</div>
            {loadingRes ? <Skel /> : (
              <div style={S.kpiValue(variacaoCor)}>
                {variacao.pct > 0 ? '+' : ''}{variacao.pct}%
              </div>
            )}
            <div style={S.kpiSub}>{variacaoPos ? 'Gastos reduziram ✓' : 'Gastos aumentaram ↑'}</div>
          </div>

          {/* Média mensal */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#3B82F6')} />
            <div style={S.kpiLabel}>Média mensal ({ano})</div>
            {loadingRes ? <Skel /> : <div style={S.kpiValue('#2563EB')}>{fmt(media)}</div>}
            <div style={S.kpiSub}>Base: Jan a {MESES[mes - 1]}/{ano}</div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={S.filterRow}>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Categoria:</span>
            {categoriasLista.map(c => (
              <button key={c} style={S.chip(catFiltro === c)} onClick={() => setCatFiltro(c)}>
                {c !== 'Todos' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: catDot(c), display: 'inline-block', marginRight: '4px' }} />}
                {c}
              </button>
            ))}
          </div>
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>Mês:</span>
            {MESES.map((m, i) => (
              <button key={m} style={S.monthChip(mes === i + 1)} onClick={() => setMes(i + 1)}>{m}</button>
            ))}
          </div>
          <input style={S.searchInput} placeholder="Buscar descrição ou categoria…" value={busca} onChange={e => setBusca(e.target.value)} />
          <button style={S.btnFilter}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros
          </button>
        </div>

        {/* GRÁFICOS — 3 colunas */}
        <div style={S.chartsRow}>
          {/* Barra */}
          <div style={S.card}>
            <div style={S.cardTitleRow}>
              <span style={S.cardTitle}>Evolução das saídas ({ano})</span>
              <span style={S.cardLink} onClick={() => navigate('/relatorios')}>Ver relatório →</span>
            </div>
            {loadingRes ? <Skel h={170} /> : <BarChartSaidas graficoAnual={graf} mesAtual={mes} />}
          </div>

          {/* Donut */}
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

          {/* Insights */}
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

        {/* BANNER HORIZONTAL */}
        {banner && (
          <div style={S.banner}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: '13px', color: '#991B1B', fontWeight: 500 }}>
              Classifique cada saída por categoria para obter relatórios mais precisos e insights personalizados.
            </span>
            <button style={S.bannerClose} onClick={() => setBanner(false)}>✕</button>
          </div>
        )}

        {/* GRID 2 COLUNAS: tabela + form */}
        <div style={S.mainGrid}>

          {/* TABELA */}
          <div style={S.card}>
            <div style={S.tableTitle}>Últimas saídas</div>
            {loadingList ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map(i => <Skel key={i} h={44} />)}
              </div>
            ) : saidasPag.length === 0 ? (
              <div style={S.empty}>Nenhuma saída encontrada para o período selecionado.</div>
            ) : (
              <>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Data', 'Descrição', 'Categoria', 'Fonte', 'Forma pgto.', 'Valor', 'Status', 'Ações'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {saidasPag.map(s => {
                      const badgeSt = STATUS_BADGE[s.status] || STATUS_BADGE['Pago'];
                      return (
                        <tr key={s.id}
                          onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={S.td}>{fmtDate(s.data)}</td>
                          <td style={S.td}>{s.descricao}</td>
                          <td style={S.td}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: catDot(s.categoria), flexShrink: 0 }} />
                              {s.categoria || 'Outros'}
                            </span>
                          </td>
                          <td style={S.td}>{s.fonte || '—'}</td>
                          <td style={S.td}>{s.forma_pagamento || '—'}</td>
                          <td style={{ ...S.td, ...S.tdRed }}>{fmt(s.valor)}</td>
                          <td style={S.td}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: badgeSt.bg, color: badgeSt.color }}>
                              {s.status || 'Pago'}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button style={S.actionBtn} title="Editar"   onClick={() => handleEdit(s)}>✏️</button>
                              <button style={S.actionBtn} title="Duplicar" onClick={() => handleDuplicate(s)}>📋</button>
                              <button style={S.actionBtn} title="Excluir"  onClick={() => handleDelete(s.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '14px', justifyContent: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPagina(p)} style={{
                        padding: '5px 10px', borderRadius: '7px', border: '1px solid #E5E7EB',
                        background: pagina === p ? '#EF4444' : '#fff',
                        color: pagina === p ? '#fff' : '#374151',
                        cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
                      }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginTop: '12px' }}
              onClick={() => navigate('/transacoes')}>
              Ver todas as transações →
            </span>
          </div>

          {/* FORMULÁRIO LATERAL */}
          <div style={S.formCard}>
            <div style={S.formTitle}>Adicionar nova saída</div>
            <FormSaida onSuccess={onSuccess} categorias={categoriasLista} />
          </div>
        </div>

        {/* FOOTER */}
        <div style={S.footer}>
          <div style={S.footerMain}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Tenha controle e clareza sobre seus gastos</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>
              Classificar suas saídas ajuda a identificar padrões e tomar decisões melhores.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Classifique por categoria', color: '#EF4444' },
              { label: 'Acompanhe tendências',      color: '#F59E0B' },
              { label: 'Tome decisões melhores',    color: '#3B82F6' },
            ].map(p => (
              <div key={p.label} style={S.footerPill(p.color)}>
                {p.label}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL — edição / duplicação */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{editData?.id ? 'Editar saída' : 'Nova saída'}</span>
              <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }} onClick={closeModal}>✕</button>
            </div>
            <FormSaida editData={editData} onSuccess={onSuccess} onCancel={closeModal} categorias={categoriasLista} />
          </div>
        </div>
      )}
    </Layout>
  );
}
