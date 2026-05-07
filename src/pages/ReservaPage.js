import { useState, useEffect, useCallback } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR');
};

const today = () => new Date().toISOString().split('T')[0];

const META_KEY = 'reserva_meta';
const getMeta  = () => parseFloat(localStorage.getItem(META_KEY) || '0') || 0;
const saveMeta = (v) => localStorage.setItem(META_KEY, String(v));

const barColor = (pct) => pct >= 100 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';

const S = {
  page:    { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  title:   { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  sub:     { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  topBtns: { display: 'flex', gap: '10px' },
  btnAporte:   { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,.28)', fontFamily: 'inherit' },
  btnRetirada: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },

  kpiRow:   { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' },
  kpiCard:  { background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' },
  kpiAccent:(c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  kpiLabel: { fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', color: '#6B7280', textTransform: 'uppercase', marginTop: '8px', marginBottom: '6px' },
  kpiValue: { fontSize: '22px', fontWeight: 700, color: '#111827', letterSpacing: '-.5px' },
  kpiSub:   { fontSize: '12px', color: '#6B7280', marginTop: '3px' },

  progressCard: { background: '#fff', borderRadius: '10px', padding: '16px 20px', border: '0.5px solid #E5E7EB' },
  progressBar:  { height: '12px', borderRadius: '6px', background: '#F3F4F6', overflow: 'hidden', margin: '10px 0 6px' },
  progressFill: (pct, c) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: c, borderRadius: '6px', transition: 'width .6s ease' }),

  tableCard:  { background: '#fff', borderRadius: '10px', border: '0.5px solid #E5E7EB', overflow: 'hidden' },
  tableHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' },
  tableTitle: { fontSize: '14px', fontWeight: 600, color: '#111827' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'left', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' },
  td:         { padding: '12px 16px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #F9FAFB' },
  pos:        { color: '#16A34A', fontWeight: 600 },
  neg:        { color: '#DC2626', fontWeight: 600 },
  empty:      { textAlign: 'center', padding: '40px', color: '#9CA3AF', fontSize: '14px' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal:   { background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  mTitle:  { fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
  mSub:    { fontSize: '13px', color: '#6B7280', marginBottom: '16px' },
  toggleRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  toggleBtn: (active, c) => ({ flex: 1, padding: '8px', borderRadius: '8px', border: `1.5px solid ${active ? c : '#E5E7EB'}`, background: active ? c + '18' : '#fff', color: active ? c : '#6B7280', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }),
  label:    { fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px', marginTop: '12px' },
  input:    { width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  errMsg:   { fontSize: '12px', color: '#DC2626', marginTop: '8px' },
  mRow:     { display: 'flex', gap: '8px', marginTop: '16px' },
  btnCancel:{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnSave:  { flex: 1, padding: '9px', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

export default function ReservaPage() {
  const [resumo,     setResumo]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [meta,       setMeta]       = useState(getMeta);
  const [editMeta,   setEditMeta]   = useState(false);
  const [metaInput,  setMetaInput]  = useState('');
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({ descricao: '', valor: '', data: today() });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/reserva/resumo');
      setResumo(r.data);
    } catch { setResumo(null); }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const saldo = resumo?.saldo || 0;
  const pct   = meta > 0 ? (saldo / meta) * 100 : 0;
  const cor   = barColor(pct);

  const openModal = (tipo) => {
    setModal(tipo);
    setForm({ descricao: '', valor: '', data: today() });
    setError('');
  };

  const handleSave = async () => {
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    const v = parseFloat(form.valor.toString().replace(',', '.'));
    if (!v || v <= 0) return setError('Informe um valor válido e positivo.');
    if (!form.data) return setError('Informe a data.');
    setSaving(true);
    setError('');
    try {
      await api.post('/transacoes', {
        descricao: form.descricao,
        valor:     modal === 'retirada' ? -v : v,
        tipo:      'investimento',
        categoria: 'Reserva de Segurança',
        data:      form.data,
      });
      setModal(null);
      carregar();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar.');
    }
    setSaving(false);
  };

  const salvarMeta = () => {
    const v = parseFloat(metaInput.toString().replace(',', '.'));
    if (v > 0) { setMeta(v); saveMeta(v); }
    setEditMeta(false);
  };

  return (
    <Layout>
      <div style={S.page}>

        {/* TOPO */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Reserva de Segurança</h1>
            <p style={S.sub}>Sua proteção financeira para imprevistos</p>
          </div>
          <div style={S.topBtns}>
            <button style={S.btnRetirada} onClick={() => openModal('retirada')}>− Retirada</button>
            <button style={S.btnAporte}   onClick={() => openModal('aporte')}>+ Aporte</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={S.kpiRow}>
          {/* Saldo */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent(cor)} />
            <div style={S.kpiLabel}>Saldo atual</div>
            <div style={S.kpiValue}>{loading ? '…' : fmt(saldo)}</div>
            <div style={S.kpiSub}>Total acumulado</div>
          </div>

          {/* Meta (editável) */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#2563EB')} />
            <div style={S.kpiLabel}>Meta</div>
            <div style={S.kpiValue}>{fmt(meta)}</div>
            {editMeta ? (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <input
                  style={{ ...S.input, fontSize: '12px', padding: '4px 6px' }}
                  value={metaInput}
                  onChange={e => setMetaInput(e.target.value)}
                  placeholder="Ex: 18000"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && salvarMeta()}
                />
                <button onClick={salvarMeta}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  OK
                </button>
              </div>
            ) : (
              <div style={{ ...S.kpiSub, color: '#2563EB', cursor: 'pointer' }}
                onClick={() => { setMetaInput(meta > 0 ? String(meta) : ''); setEditMeta(true); }}>
                ✏️ editar meta
              </div>
            )}
          </div>

          {/* Progresso */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent(cor)} />
            <div style={S.kpiLabel}>Progresso</div>
            <div style={{ ...S.kpiValue, color: cor }}>{pct.toFixed(1)}%</div>
            <div style={S.kpiSub}>{(100 - Math.min(pct, 100)).toFixed(1)}% restante</div>
          </div>

          {/* Meses cobertos */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#8B5CF6')} />
            <div style={S.kpiLabel}>Meses cobertos</div>
            <div style={S.kpiValue}>
              {loading ? '…' : resumo?.mesesCobertos != null ? `${resumo.mesesCobertos}m` : '—'}
            </div>
            <div style={S.kpiSub}>Base: média de saídas</div>
          </div>

          {/* Aportes / Retiradas */}
          <div style={S.kpiCard}>
            <div style={S.kpiAccent('#22C55E')} />
            <div style={S.kpiLabel}>Total aportes</div>
            <div style={S.kpiValue}>{loading ? '…' : fmt(resumo?.aportes)}</div>
            <div style={S.kpiSub}>Retiradas: {fmt(resumo?.retiradas)}</div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div style={S.progressCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Progresso em direção à meta</span>
            <span style={{ fontSize: '13px', color: cor, fontWeight: 700 }}>{fmt(saldo)} / {fmt(meta)}</span>
          </div>
          <div style={S.progressBar}>
            <div style={S.progressFill(pct, cor)} />
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {pct >= 100
              ? '✅ Meta atingida! Sua reserva de emergência está completa.'
              : pct >= 50
              ? `⚡ Na metade do caminho — faltam ${fmt(meta - saldo)} para a meta.`
              : `🎯 Recomendado: 6 meses de despesas. Faltam ${fmt(Math.max(0, meta - saldo))}.`}
          </div>
        </div>

        {/* HISTÓRICO */}
        <div style={S.tableCard}>
          <div style={S.tableHead}>
            <span style={S.tableTitle}>Histórico de movimentações</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{resumo?.movimentacoes?.length || 0} registros</span>
          </div>

          {loading ? (
            <div style={S.empty}>Carregando…</div>
          ) : !resumo?.movimentacoes?.length ? (
            <div style={S.empty}>
              Nenhum aporte registrado ainda.{' '}
              <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => openModal('aporte')}>
                Registre seu primeiro aporte →
              </span>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Data', 'Descrição', 'Tipo', 'Valor', 'Saldo acum.'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumo.movimentacoes.map(m => {
                  const isAporte = m.valor >= 0;
                  return (
                    <tr key={m.id}>
                      <td style={S.td}>{fmtDate(m.data)}</td>
                      <td style={S.td}>{m.descricao}</td>
                      <td style={S.td}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          background: isAporte ? '#DCFCE7' : '#FEE2E2',
                          color:      isAporte ? '#16A34A' : '#DC2626',
                        }}>
                          {isAporte ? 'Aporte' : 'Retirada'}
                        </span>
                      </td>
                      <td style={{ ...S.td, ...(isAporte ? S.pos : S.neg) }}>
                        {isAporte ? '+' : ''}{fmt(m.valor)}
                      </td>
                      <td style={S.td}>{fmt(m.saldo_acum)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL */}
        {modal && (
          <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <div style={S.modal}>
              <div style={S.mTitle}>
                {modal === 'aporte' ? 'Registrar aporte' : 'Registrar retirada'}
              </div>
              <div style={S.mSub}>
                {modal === 'aporte'
                  ? 'Adicionar valor à reserva de emergência'
                  : 'Retirar valor da reserva de emergência'}
              </div>

              <div style={S.toggleRow}>
                <button style={S.toggleBtn(modal === 'aporte',    '#22C55E')} onClick={() => { setModal('aporte');    setError(''); }}>+ Aporte</button>
                <button style={S.toggleBtn(modal === 'retirada',  '#EF4444')} onClick={() => { setModal('retirada');  setError(''); }}>− Retirada</button>
              </div>

              <label style={S.label}>Descrição</label>
              <input style={S.input} value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder={modal === 'aporte' ? 'Ex: Aporte mensal, 13º salário…' : 'Ex: Emergência médica, Reparo…'} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={S.label}>Valor (R$)</label>
                  <input style={S.input} type="number" min="0.01" step="0.01"
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00" />
                </div>
                <div>
                  <label style={S.label}>Data</label>
                  <input style={S.input} type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
              </div>

              {error && <div style={S.errMsg}>{error}</div>}

              <div style={S.mRow}>
                <button style={S.btnCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button
                  style={{ ...S.btnSave, background: modal === 'aporte' ? '#22C55E' : '#EF4444', opacity: saving ? .7 : 1 }}
                  onClick={handleSave}
                  disabled={saving}>
                  {saving ? 'Salvando…' : modal === 'aporte' ? 'Registrar aporte' : 'Registrar retirada'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
