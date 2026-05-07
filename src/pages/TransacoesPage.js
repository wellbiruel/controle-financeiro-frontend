import { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const TIPO_BADGE = {
  entrada:     { bg: '#DCFCE7', color: '#16A34A', label: 'Entrada' },
  saida:       { bg: '#FEE2E2', color: '#DC2626', label: 'Saída' },
  investimento:{ bg: '#EDE9FE', color: '#7C3AED', label: 'Investimento' },
};

const TIPOS_FILTRO = ['Todos','entrada','saida','investimento'];
const TIPO_LABEL   = { Todos:'Todos', entrada:'Entradas', saida:'Saídas', investimento:'Investimentos' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR');
};

const today = () => new Date().toISOString().split('T')[0];

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const S = {
  page: { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },

  topRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  pageTitle: { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  pageSub:   { fontSize: '13px', color: '#6B7280', marginTop: '2px' },

  btnNew: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,.28)', fontFamily: 'inherit' },

  kpiRow:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', margin: '14px 0' },
  kpiCard: { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c, borderRadius: '10px 10px 0 0' }),
  kpiLabel: { fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px', marginBottom: '6px' },
  kpiValue: (c) => ({ fontSize: '21px', fontWeight: 700, color: c || '#111827', lineHeight: 1.1, letterSpacing: '-.5px' }),
  kpiSub:   { fontSize: '12px', color: '#6B7280', marginTop: '2px' },

  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '12px 16px', marginBottom: '14px' },
  filterLabel: { fontSize: '12px', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' },
  chip: (active, color='#2563EB') => ({ padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: active ? 'none' : '1px solid #E5E7EB', background: active ? color : '#F9FAFB', color: active ? '#fff' : '#374151', transition: 'all .15s', fontFamily: 'inherit' }),
  monthChip: (active) => ({ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#2563EB' : 'transparent', color: active ? '#fff' : '#6B7280', transition: 'all .15s', fontFamily: 'inherit' }),
  navBtn: { padding: '4px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: '13px', fontFamily: 'inherit' },
  searchInput: { flex: 1, minWidth: '160px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', background: '#fff', fontFamily: 'inherit' },

  card: { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', overflow: 'hidden' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th:    { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' },
  td:    { padding: '12px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #F9FAFB' },
  trHover: { background: '#FAFAFA' },

  badge: (tipo) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    background: (TIPO_BADGE[tipo] || {}).bg || '#F3F4F6',
    color: (TIPO_BADGE[tipo] || {}).color || '#374151',
  }),

  btnAction: (color) => ({ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${color}20`, background: `${color}10`, color, fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }),

  empty: { padding: '48px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal:   { background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 16px 48px rgba(0,0,0,.18)' },
  modalTitle: { fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '20px' },
  label:   { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' },
  input:   { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:  { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' },
  fgroup:  { marginBottom: '14px' },
  row2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' },
  btnCancel: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnSave:   { padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

// ─── FORM VAZIO ───────────────────────────────────────────────────────────────

const emptyForm = {
  data: today(),
  tipo: 'saida',
  categoria: '',
  descricao: '',
  valor: '',
};

// ─── COMPONENTE MODAL ─────────────────────────────────────────────────────────

function FormModal({ form, setForm, categorias, onClose, onSave, saving, editId }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const catOpts = categorias[form.tipo] || [];

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{editId ? 'Editar Transação' : 'Nova Transação'}</div>

        <div style={S.row2}>
          <div>
            <label style={S.label}>Data</label>
            <input style={S.input} type="date" value={form.data} onChange={e => set('data', e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Tipo</label>
            <select style={S.select} value={form.tipo} onChange={e => {
              const t = e.target.value;
              set('tipo', t);
              setForm(f => ({ ...f, tipo: t, categoria: '' }));
            }}>
              <option value="saida">Saída</option>
              <option value="entrada">Entrada</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>
        </div>

        <div style={S.fgroup}>
          <label style={S.label}>Categoria</label>
          {catOpts.length > 0 ? (
            <select style={S.select} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
              <option value="">— selecione —</option>
              {catOpts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input style={S.input} type="text" value={form.categoria}
              onChange={e => set('categoria', e.target.value)} placeholder="Ex: Alimentação" />
          )}
        </div>

        <div style={S.fgroup}>
          <label style={S.label}>Descrição</label>
          <input style={S.input} type="text" value={form.descricao}
            onChange={e => set('descricao', e.target.value)} placeholder="Ex: Mercado" />
        </div>

        <div style={S.fgroup}>
          <label style={S.label}>Valor (R$)</label>
          <input style={S.input} type="number" step="0.01" min="0" value={form.valor}
            onChange={e => set('valor', e.target.value)} placeholder="0,00" />
        </div>

        <div style={S.modalBtns}>
          <button style={S.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={S.btnSave} onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function TransacoesPage() {
  const now = new Date();
  const [mes,  setMes]  = useState(now.getMonth() + 1);
  const [ano,  setAno]  = useState(now.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [search, setSearch] = useState('');

  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState({ saida: [], entrada: [], investimento: [] });
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);

  // ─── Carga ────────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { mes, ano };
      if (tipoFiltro !== 'Todos') params.tipo = tipoFiltro;
      const { data } = await api.get('/transacoes', { params });
      setTransacoes(data);
    } catch (e) {
      console.error('Erro ao carregar transações:', e);
    } finally {
      setLoading(false);
    }
  }, [mes, ano, tipoFiltro]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    async function loadCats() {
      try {
        const [s, e] = await Promise.all([
          api.get('/categorias', { params: { tipo: 'saida' } }),
          api.get('/categorias', { params: { tipo: 'entrada' } }),
        ]);
        const saida   = s.data.map(c => c.nome);
        const entrada = e.data.map(c => c.nome);
        setCategorias({ saida, entrada, investimento: ['Aporte','Retirada','Rendimento'] });
      } catch {
        setCategorias({
          saida:        ['Cartões','Casa','Transporte','Alimentação','Saúde','Lazer','Outros'],
          entrada:      ['Salário principal','Adiantamento','Comissão CLT','Bônus','Freelance','Outros'],
          investimento: ['Aporte','Retirada','Rendimento'],
        });
      }
    }
    loadCats();
  }, []);

  // ─── KPIs derivados ───────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    let entradas = 0, saidas = 0, investimentos = 0;
    for (const t of transacoes) {
      const v = parseFloat(t.valor) || 0;
      if (t.tipo === 'entrada')      entradas      += v;
      else if (t.tipo === 'saida')   saidas        += v;
      else if (t.tipo === 'investimento') investimentos += v;
    }
    return { entradas, saidas, saldo: entradas - saidas, investimentos, total: transacoes.length };
  }, [transacoes]);

  // ─── Filtro local por texto ───────────────────────────────────────────────

  const lista = useMemo(() => {
    if (!search.trim()) return transacoes;
    const q = search.toLowerCase();
    return transacoes.filter(t =>
      t.descricao?.toLowerCase().includes(q) ||
      t.categoria?.toLowerCase().includes(q)
    );
  }, [transacoes, search]);

  // ─── Navegação de mês ─────────────────────────────────────────────────────

  const navMes = (delta) => {
    let m = mes + delta, a = ano;
    if (m > 12) { m = 1;  a += 1; }
    if (m < 1)  { m = 12; a -= 1; }
    setMes(m); setAno(a);
  };

  // ─── Modal helpers ────────────────────────────────────────────────────────

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      data:      t.data ? t.data.split('T')[0] : today(),
      tipo:      t.tipo || 'saida',
      categoria: t.categoria || '',
      descricao: t.descricao || '',
      valor:     String(parseFloat(t.valor) || ''),
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.descricao.trim() || !form.valor || !form.data) return;
    setSaving(true);
    try {
      const payload = {
        descricao: form.descricao.trim(),
        valor:     parseFloat(form.valor),
        tipo:      form.tipo,
        data:      form.data,
        categoria: form.categoria || undefined,
      };
      if (editId) {
        await api.put(`/transacoes/${editId}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      closeModal();
      carregar();
    } catch (e) {
      console.error('Erro ao salvar:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover esta transação?')) return;
    try {
      await api.delete(`/transacoes/${id}`);
      carregar();
    } catch (e) {
      console.error('Erro ao deletar:', e);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div style={S.page}>

        {/* Cabeçalho */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.pageTitle}>Transações</h1>
            <p style={S.pageSub}>Todas as movimentações do período</p>
          </div>
          <button style={S.btnNew} onClick={openNew}>+ Nova Transação</button>
        </div>

        {/* KPIs */}
        <div style={S.kpiRow}>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#22C55E')} />
            <div style={S.kpiLabel}>Entradas</div>
            <div style={S.kpiValue('#16A34A')}>{fmt(kpis.entradas)}</div>
            <div style={S.kpiSub}>no mês</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#EF4444')} />
            <div style={S.kpiLabel}>Saídas</div>
            <div style={S.kpiValue('#DC2626')}>{fmt(kpis.saidas)}</div>
            <div style={S.kpiSub}>no mês</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent(kpis.saldo >= 0 ? '#2563EB' : '#F97316')} />
            <div style={S.kpiLabel}>Saldo</div>
            <div style={S.kpiValue(kpis.saldo >= 0 ? '#1D4ED8' : '#EA580C')}>{fmt(kpis.saldo)}</div>
            <div style={S.kpiSub}>entradas − saídas</div>
          </div>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#7C3AED')} />
            <div style={S.kpiLabel}>Investimentos</div>
            <div style={S.kpiValue('#7C3AED')}>{fmt(kpis.investimentos)}</div>
            <div style={S.kpiSub}>{kpis.total} transaç{kpis.total === 1 ? 'ão' : 'ões'}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={S.filterRow}>

          {/* Navegação mês */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button style={S.navBtn} onClick={() => navMes(-1)}>‹</button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MESES.map((m, i) => (
                <button key={m} style={S.monthChip(mes === i + 1)} onClick={() => setMes(i + 1)}>
                  {m}
                </button>
              ))}
            </div>
            <button style={S.navBtn} onClick={() => navMes(1)}>›</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginLeft: '4px' }}>{ano}</span>
          </div>

          <div style={{ width: '1px', height: '20px', background: '#E5E7EB' }} />

          {/* Tipo */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={S.filterLabel}>Tipo:</span>
            {TIPOS_FILTRO.map(t => (
              <button key={t} style={S.chip(tipoFiltro === t)} onClick={() => setTipoFiltro(t)}>
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: '#E5E7EB' }} />

          {/* Search */}
          <input
            style={S.searchInput}
            type="text"
            placeholder="Buscar descrição ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div style={S.card}>
          {loading ? (
            <div style={S.empty}>Carregando...</div>
          ) : lista.length === 0 ? (
            <div style={S.empty}>Nenhuma transação encontrada para o período.</div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Data</th>
                  <th style={S.th}>Descrição</th>
                  <th style={S.th}>Categoria</th>
                  <th style={S.th}>Tipo</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Valor</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(t => {
                  const v     = parseFloat(t.valor) || 0;
                  const cor   = t.tipo === 'entrada' ? '#16A34A' : t.tipo === 'investimento' ? '#7C3AED' : '#DC2626';
                  const sinal = t.tipo === 'entrada' ? '+' : t.tipo === 'investimento' ? '±' : '-';
                  return (
                    <tr key={t.id} style={{ cursor: 'default' }}>
                      <td style={S.td}>{fmtDate(t.data)}</td>
                      <td style={{ ...S.td, fontWeight: 500, color: '#111827' }}>{t.descricao}</td>
                      <td style={S.td}>{t.categoria || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                      <td style={S.td}>
                        <span style={S.badge(t.tipo)}>
                          {(TIPO_BADGE[t.tipo] || {}).label || t.tipo}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, color: cor, fontVariantNumeric: 'tabular-nums' }}>
                        {sinal} {fmt(v)}
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

      </div>

      {showModal && (
        <FormModal
          form={form}
          setForm={setForm}
          categorias={categorias}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          editId={editId}
        />
      )}
    </Layout>
  );
}
