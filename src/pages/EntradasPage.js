import { useState, useEffect } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const MESES     = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_NUM = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ANO       = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth() + 1; // 1-indexed

const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const card = { background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' };

const tiposChip = ['Todos', 'Salário', 'Renda Extra', 'Outros'];
const TIPO_COLORS = {
  'salário':    { bg: '#DCFCE7', color: '#166534' },
  'salario':    { bg: '#DCFCE7', color: '#166534' },
  'renda extra':{ bg: '#FEF3C7', color: '#92400E' },
  'outros':     { bg: '#EEF2FF', color: '#3730A3' },
};
const getTipoColor = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('salário') || d.includes('salario')) return TIPO_COLORS['salário'];
  if (d.includes('renda extra')) return TIPO_COLORS['renda extra'];
  return TIPO_COLORS['outros'];
};
const getTipoLabel = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('salário') || d.includes('salario')) return 'Salário';
  if (d.includes('renda extra')) return 'Renda Extra';
  return 'Outros';
};

function KPICard({ label, valor, sub, cor, iconBg, icon }) {
  return (
    <div style={{ ...card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: cor || '#0F172A' }}>{valor}</p>
      {sub && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>{sub}</p>}
    </div>
  );
}

export default function EntradasPage() {
  const [transacoes,  setTransacoes]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtroTipo,  setFiltroTipo]  = useState('Todos');
  const [filtroMes,   setFiltroMes]   = useState(MES_ATUAL);
  const [busca,       setBusca]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [salvando,    setSalvando]    = useState(false);
  const [form, setForm] = useState({ descricao: 'Salário', valor: '', mes: MES_ATUAL, ano: ANO });

  const carregar = async () => {
    try {
      const r = await api.get('/transacoes');
      setTransacoes((r.data || []).filter(t => t.tipo === 'receita'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  /* ── Cálculos ── */
  const doMes = transacoes.filter(t => {
    const d = new Date(t.data);
    return d.getUTCMonth() + 1 === filtroMes && d.getUTCFullYear() === ANO;
  });

  const totalMes   = doMes.reduce((s, t) => s + +t.valor, 0);
  const salarioMes = doMes.filter(t => getTipoLabel(t.descricao) === 'Salário').reduce((s, t) => s + +t.valor, 0);
  const extraMes   = doMes.filter(t => getTipoLabel(t.descricao) === 'Renda Extra').reduce((s, t) => s + +t.valor, 0);

  const mesesComDados = new Set(transacoes.map(t => {
    const d = new Date(t.data); return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
  }));
  const mediaMensal = mesesComDados.size > 0
    ? transacoes.reduce((s, t) => s + +t.valor, 0) / mesesComDados.size
    : 0;

  /* ── Filtro da tabela ── */
  const linhas = doMes.filter(t => {
    if (filtroTipo !== 'Todos' && getTipoLabel(t.descricao) !== filtroTipo) return false;
    if (busca && !t.descricao?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  /* ── Salvar nova entrada ── */
  const handleSalvar = async () => {
    if (!form.descricao || !form.valor) return;
    setSalvando(true);
    try {
      const dataStr = `${form.ano}-${String(form.mes).padStart(2, '0')}-01`;
      await api.post('/transacoes', { descricao: form.descricao, valor: +form.valor, tipo: 'receita', data: dataStr });
      setShowModal(false);
      setForm({ descricao: 'Salário', valor: '', mes: MES_ATUAL, ano: ANO });
      await carregar();
    } catch (e) { console.error(e); }
    finally { setSalvando(false); }
  };

  return (
    <Layout>
      <div style={{ padding: '20px 24px', background: '#F1F5F9', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Entradas</h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              {MESES_NUM[filtroMes - 1]} {ANO} · {linhas.length} registro{linhas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'white', color: '#0F172A', border: '0.5px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              ↓ Exportar
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
            >
              + Nova entrada
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <KPICard
            label="Total do mês" valor={fmt(totalMes)} cor="#6366F1"
            iconBg="#EEF2FF"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#6366F1"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
          />
          <KPICard
            label="Salário" valor={fmt(salarioMes)} cor="#16A34A"
            iconBg="#DCFCE7"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.93 0 13.36 0c-1.46 0-2.75.67-3.63 1.7L9 3 7.27 1.7C6.39.67 5.1 0 3.64 0 1.07 0 -1 2.06-1 4.64c0 .48.09.92.18 1.36H-1v2h22V6zM3.64 6c-1.16 0-2.13-.89-2.13-2.09 0-1.16.97-2.13 2.13-2.13.86 0 1.59.64 2.13 1.31L7.64 5.52c-.73.31-1.6.48-4 .48zm9.72 0c-2.4 0-3.27-.17-4-.48l1.87-2.34c.55-.67 1.29-1.31 2.13-1.31 1.16 0 2.13.97 2.13 2.13C15.49 5.11 14.52 6 13.36 6zM1 18h22v2H1v-2zm0-8.5h22V11H1V9.5z"/></svg>}
            sub={`${doMes.filter(t => getTipoLabel(t.descricao) === 'Salário').length} lançamento(s)`}
          />
          <KPICard
            label="Renda Extra" valor={fmt(extraMes)} cor="#D97706"
            iconBg="#FEF3C7"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>}
            sub={`${doMes.filter(t => getTipoLabel(t.descricao) === 'Renda Extra').length} lançamento(s)`}
          />
          <KPICard
            label="Média mensal" valor={fmt(mediaMensal)} cor="#64748B"
            iconBg="#F1F5F9"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>}
            sub={`base: ${mesesComDados.size} mês${mesesComDados.size !== 1 ? 'es' : ''}`}
          />
        </div>

        {/* ── Filtros ── */}
        <div style={{ ...card, marginBottom: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px' }}>
          {/* Tipo */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Tipo:</span>
            {tiposChip.map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                style={{
                  border: `1px solid ${filtroTipo === t ? '#6366F1' : '#E2E8F0'}`,
                  background: filtroTipo === t ? '#6366F1' : 'white',
                  color: filtroTipo === t ? 'white' : '#64748B',
                  borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mês */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', overflowX: 'auto' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Mês:</span>
            {MESES.map((m, i) => (
              <button
                key={i}
                onClick={() => setFiltroMes(i + 1)}
                style={{
                  border: `1px solid ${filtroMes === i + 1 ? '#6366F1' : '#E2E8F0'}`,
                  background: filtroMes === i + 1 ? '#6366F1' : 'white',
                  color: filtroMes === i + 1 ? 'white' : '#64748B',
                  borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 10px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#94A3B8"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar descrição…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', color: '#0F172A', width: '140px' }}
            />
          </div>
        </div>

        {/* ── Tabela ── */}
        <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Carregando…</div>
          ) : linhas.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>Nenhuma entrada encontrada</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Descrição','Tipo','Mês','Ano','Valor','Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Valor' ? 'right' : 'left', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((t, i) => {
                  const d   = new Date(t.data);
                  const mes = d.getUTCMonth();
                  const ano = d.getUTCFullYear();
                  const tc  = getTipoColor(t.descricao);
                  const tl  = getTipoLabel(t.descricao);
                  return (
                    <tr key={t.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: '500', color: '#0F172A' }}>{t.descricao || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: tc.bg, color: tc.color, fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>{tl}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '12px' }}>{MESES[mes]}</td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '12px' }}>{ano}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#16A34A' }}>{fmt(t.valor)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '12px', padding: '2px 6px', borderRadius: '4px' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Modal: Nova entrada ── */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Nova entrada</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Descrição / Tipo</label>
                  <select
                    value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Salário">Salário</option>
                    <option value="Renda Extra">Renda Extra</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Valor (R$)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0,00"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Mês</label>
                    <select
                      value={form.mes}
                      onChange={e => setForm(f => ({ ...f, mes: +e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
                    >
                      {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Ano</label>
                    <input
                      type="number"
                      value={form.ano}
                      onChange={e => setForm(f => ({ ...f, ano: +e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setShowModal(false)} style={{ background: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSalvar} disabled={salvando || !form.valor} style={{ background: salvando || !form.valor ? '#CBD5E1' : '#6366F1', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', fontWeight: '500', cursor: salvando || !form.valor ? 'not-allowed' : 'pointer' }}>
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
