import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CATS = ['Renda Fixa','Renda Variável','Fundos Imobiliários','Cripto','Internacional','Outros'];

const CAT_CORES = {
  'Renda Fixa':         '#2563EB',
  'Renda Variável':     '#7C3AED',
  'Fundos Imobiliários':'#059669',
  'Cripto':             '#F59E0B',
  'Internacional':      '#0891B2',
  'Outros':             '#6B7280',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR');
};

const today = () => new Date().toISOString().split('T')[0];

const catCor = (nome) => CAT_CORES[nome] || '#6B7280';

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const S = {
  page:    { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  title:   { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  sub:     { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  btnNew:  { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,.3)', fontFamily: 'inherit' },

  kpiRow:   { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', margin: '14px 0' },
  kpiCard:  { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent:(c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  kpiLabel: { fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', color: '#6B7280', textTransform: 'uppercase', marginTop: '8px', marginBottom: '6px' },
  kpiValue: (c) => ({ fontSize: '22px', fontWeight: 700, color: c || '#111827', letterSpacing: '-.5px' }),
  kpiSub:   { fontSize: '12px', color: '#6B7280', marginTop: '3px' },

  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '12px 16px', marginBottom: '14px' },
  navBtn:      { padding: '4px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: '13px', fontFamily: 'inherit' },
  monthChip:   (a) => ({ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', background: a ? '#7C3AED' : 'transparent', color: a ? '#fff' : '#6B7280', transition: 'all .15s', fontFamily: 'inherit' }),
  chip:        (a, c='#7C3AED') => ({ padding: '5px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: a ? 'none' : '1px solid #E5E7EB', background: a ? c : '#F9FAFB', color: a ? '#fff' : '#374151', transition: 'all .15s', fontFamily: 'inherit' }),
  filterLabel: { fontSize: '12px', color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' },
  divider:     { width: '1px', height: '20px', background: '#E5E7EB' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', alignItems: 'start' },

  card:  { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th:    { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' },
  td:    { padding: '12px 14px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #F9FAFB' },

  catCard:  { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', padding: '16px 18px' },
  catTitle: { fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '14px' },
  catRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  catBar:   { height: '5px', borderRadius: '3px', background: '#F3F4F6', margin: '4px 0 8px', overflow: 'hidden' },
  catFill:  (pct, c) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: c, borderRadius: '3px' }),
  catName:  { fontSize: '13px', color: '#374151', fontWeight: 500 },
  catVal:   { fontSize: '13px', color: '#111827', fontWeight: 600 },
  catPct:   { fontSize: '11px', color: '#6B7280' },

  badge: (cor) => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: `${cor}18`, color: cor }),
  dot:   (cor) => ({ width: '6px', height: '6px', borderRadius: '50%', background: cor, flexShrink: 0 }),
  btnAction: (c) => ({ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${c}20`, background: `${c}10`, color: c, fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }),
  empty: { padding: '48px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' },

  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal:     { background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 16px 48px rgba(0,0,0,.18)' },
  modalTitle:{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '20px' },
  label:     { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' },
  input:     { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  select:    { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' },
  fgroup:    { marginBottom: '14px' },
  row2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' },
  errMsg:    { fontSize: '12px', color: '#DC2626', marginTop: '10px' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' },
  btnCancel: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnSave:   { padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

const emptyForm = { data: today(), categoria: 'Renda Fixa', descricao: '', valor: '' };

// ─── MODAL ───────────────────────────────────────────────────────────────────

function FormModal({ form, setForm, onClose, onSave, saving, editId, error }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{editId ? 'Editar Aporte' : 'Registrar Aporte'}</div>

        <div style={S.row2}>
          <div>
            <label style={S.label}>Data</label>
            <input style={S.input} type="date" value={form.data} onChange={e => set('data', e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Valor (R$)</label>
            <input style={S.input} type="number" step="0.01" min="0.01" value={form.valor}
              onChange={e => set('valor', e.target.value)} placeholder="0,00" />
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
            onChange={e => set('descricao', e.target.value)} placeholder="Ex: Tesouro Selic 2029" />
        </div>

        {error && <div style={S.errMsg}>{error}</div>}

        <div style={S.modalBtns}>
          <button style={S.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={S.btnSave} onClick={onSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function InvestimentosPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [catFiltro, setCatFiltro] = useState('Todos');

  const [dados, setDados]     = useState({ patrimonioTotal: 0, aporteMes: 0, totalAno: 0, categorias: [], historico: [] });
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editId,   setEditId]    = useState(null);
  const [form,     setForm]      = useState(emptyForm);
  const [saving,   setSaving]    = useState(false);
  const [error,    setError]     = useState('');

  // ─── Carga ──────────────────────────────────────────────────────────────────

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

  useEffect(() => { carregar(); }, [carregar]);

  // ─── Navegação mês ──────────────────────────────────────────────────────────

  const navMes = (delta) => {
    let m = mes + delta, a = ano;
    if (m > 12) { m = 1;  a += 1; }
    if (m < 1)  { m = 12; a -= 1; }
    setMes(m); setAno(a);
  };

  // ─── Histórico filtrado ─────────────────────────────────────────────────────

  const historico = useMemo(() => {
    if (catFiltro === 'Todos') return dados.historico;
    return dados.historico.filter(t => t.categoria === catFiltro);
  }, [dados.historico, catFiltro]);

  // ─── Modal ──────────────────────────────────────────────────────────────────

  const openNew = () => { setEditId(null); setForm(emptyForm); setError(''); setShowModal(true); };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      data:      t.data ? t.data.split('T')[0] : today(),
      categoria: t.categoria || 'Renda Fixa',
      descricao: t.descricao || '',
      valor:     String(Math.abs(parseFloat(t.valor)) || ''),
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    const v = parseFloat(form.valor.toString().replace(',', '.'));
    if (!v || v <= 0) return setError('Informe um valor válido.');
    if (!form.data) return setError('Informe a data.');
    setSaving(true);
    setError('');
    try {
      const payload = { descricao: form.descricao.trim(), valor: v, tipo: 'investimento', categoria: form.categoria, data: form.data };
      if (editId) { await api.put(`/transacoes/${editId}`, payload); }
      else        { await api.post('/transacoes', payload); }
      closeModal();
      carregar();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este aporte?')) return;
    try { await api.delete(`/transacoes/${id}`); carregar(); }
    catch (e) { console.error('Erro ao deletar:', e); }
  };

  // ─── Categorias ativas ──────────────────────────────────────────────────────

  const catsAtivas = dados.categorias.length;

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div style={S.page}>

        {/* Cabeçalho */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Investimentos</h1>
            <p style={S.sub}>Aportes em renda fixa, variável e outros ativos</p>
          </div>
          <button style={S.btnNew} onClick={openNew}>+ Registrar Aporte</button>
        </div>

        {/* KPIs */}
        <div style={S.kpiRow}>
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#7C3AED')} />
            <div style={S.kpiLabel}>Patrimônio Total</div>
            <div style={S.kpiValue('#7C3AED')}>{fmt(dados.patrimonioTotal)}</div>
            <div style={S.kpiSub}>acumulado</div>
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

        {/* Conteúdo: tabela + breakdown */}
        <div style={S.grid}>

          {/* Histórico do mês */}
          <div style={S.card}>
            {loading ? (
              <div style={S.empty}>Carregando…</div>
            ) : historico.length === 0 ? (
              <div style={S.empty}>Nenhum aporte em {MESES[mes - 1]}/{ano}{catFiltro !== 'Todos' ? ` · ${catFiltro}` : ''}.</div>
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
                            <span style={S.dot(cor)} />
                            {t.categoria}
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

          {/* Breakdown por categoria */}
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
                  <div style={S.catBar}>
                    <div style={S.catFill(c.pct, cor)} />
                  </div>
                  <div style={{ ...S.catPct, marginBottom: '10px' }}>{c.pct}% do patrimônio</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {showModal && (
        <FormModal
          form={form} setForm={setForm}
          onClose={closeModal} onSave={handleSave}
          saving={saving} editId={editId} error={error}
        />
      )}
    </Layout>
  );
}
