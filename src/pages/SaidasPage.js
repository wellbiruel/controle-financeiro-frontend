import { useState, useEffect } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const MESES     = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_NUM = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ANO       = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth() + 1;

const fmt  = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const card = { background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' };

const CAT_COLORS = ['#EF4444','#F59E0B','#8B5CF6','#06B6D4','#EC4899','#10B981','#F97316','#3B82F6'];

function KPICard({ label, valor, sub, cor, iconBg, icon }) {
  return (
    <div style={{ ...card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: cor || '#0F172A', lineHeight: 1.2 }}>{valor}</p>
      {sub && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>{sub}</p>}
    </div>
  );
}

export default function SaidasPage() {
  const [lancamentos, setLancamentos] = useState([]);
  const [grupos,      setGrupos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtroMes,   setFiltroMes]   = useState(MES_ATUAL);
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');
  const [busca,       setBusca]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [lRes, gRes] = await Promise.all([
          api.get(`/fluxo/lancamentos/${ANO}`),
          api.get('/fluxo/grupos'),
        ]);
        setLancamentos(lRes.data || []);
        setGrupos(gRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ── Mapa item_id → {nome, grupo} ── */
  const itemMap = {};
  for (const g of grupos) {
    for (const it of (g.itens || [])) {
      itemMap[it.id] = { nome: it.nome, grupo: g.nome, grupoId: g.id };
    }
  }

  /* ── Dados do mês ── */
  const doMes = lancamentos
    .filter(l => l.mes === filtroMes)
    .map(l => ({ ...l, ...itemMap[l.item_id] }));

  const totalMes = doMes.reduce((s, l) => s + +l.valor, 0);

  /* ── Maior categoria ── */
  const porGrupo = {};
  for (const l of doMes) {
    const g = l.grupo || 'Outros';
    porGrupo[g] = (porGrupo[g] || 0) + +l.valor;
  }
  const gruposOrdenados = Object.entries(porGrupo).sort((a, b) => b[1] - a[1]);
  const maiorCategoria  = gruposOrdenados[0];

  /* ── Maior item ── */
  const maiorItem = doMes.length
    ? doMes.reduce((a, b) => +b.valor > +a.valor ? b : a, doMes[0])
    : null;

  /* ── Média mensal (meses com dados) ── */
  const mesesComDados = new Set(lancamentos.map(l => l.mes));
  const mediaMensal   = mesesComDados.size > 0
    ? lancamentos.reduce((s, l) => s + +l.valor, 0) / mesesComDados.size
    : 0;

  /* ── Filtro ── */
  const grupos_ = ['Todos', ...gruposOrdenados.map(g => g[0])];
  const linhas  = doMes.filter(l => {
    if (filtroGrupo !== 'Todos' && l.grupo !== filtroGrupo) return false;
    if (busca && !(l.nome || '').toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div style={{ padding: '20px 24px', background: '#F1F5F9', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Saídas</h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              {MESES_NUM[filtroMes - 1]} {ANO} · {linhas.length} item{linhas.length !== 1 ? 'ns' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'white', color: '#0F172A', border: '0.5px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              ↓ Exportar
            </button>
            <button style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              + Nova saída
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <KPICard
            label="Total do mês" valor={fmt(totalMes)} cor="#DC2626"
            iconBg="#FEE2E2"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M7 10l5 5 5-5z"/></svg>}
          />
          <KPICard
            label="Maior categoria" valor={maiorCategoria ? maiorCategoria[0] : '—'} cor="#D97706"
            iconBg="#FEF3C7"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7c-1.38 0-2.5-1.12-2.5-2.5S16.12 15 17.5 15s2.5 1.12 2.5 2.5S18.88 20 17.5 20zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/></svg>}
            sub={maiorCategoria ? fmt(maiorCategoria[1]) : ''}
          />
          <KPICard
            label="Maior item" valor={maiorItem ? fmt(maiorItem.valor) : 'R$ 0,00'} cor="#EF4444"
            iconBg="#FEF2F2"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>}
            sub={maiorItem?.nome ? `⚠ ${maiorItem.nome}` : 'Sem dados'}
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
          {/* Categoria */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Categoria:</span>
            {grupos_.map((g, gi) => (
              <button
                key={g}
                onClick={() => setFiltroGrupo(g)}
                style={{
                  border: `1px solid ${filtroGrupo === g ? '#3B82F6' : '#E2E8F0'}`,
                  background: filtroGrupo === g ? '#3B82F6' : 'white',
                  color: filtroGrupo === g ? 'white' : '#64748B',
                  borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                {g !== 'Todos' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: CAT_COLORS[(gi - 1) % CAT_COLORS.length], flexShrink: 0 }} />}
                {g}
              </button>
            ))}
          </div>

          {/* Mês */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', whiteSpace: 'nowrap' }}>Mês:</span>
            {MESES.map((m, i) => (
              <button
                key={i}
                onClick={() => setFiltroMes(i + 1)}
                style={{
                  border: `1px solid ${filtroMes === i + 1 ? '#3B82F6' : '#E2E8F0'}`,
                  background: filtroMes === i + 1 ? '#3B82F6' : 'white',
                  color: filtroMes === i + 1 ? 'white' : '#64748B',
                  borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: '500', cursor: 'pointer',
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
              placeholder="Buscar item…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', color: '#0F172A', width: '130px' }}
            />
          </div>
        </div>

        {/* ── Tabela ── */}
        <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Carregando…</div>
          ) : linhas.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>Nenhuma saída encontrada</p>
              <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '4px 0 0' }}>Tente outro filtro ou mês</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Descrição','Categoria','Mês','Ano','Valor','Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Valor' ? 'right' : 'left', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E2E8F0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l, i) => {
                  const ci  = gruposOrdenados.findIndex(g => g[0] === l.grupo);
                  const cor = CAT_COLORS[ci >= 0 ? ci % CAT_COLORS.length : 0];
                  return (
                    <tr key={l.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: '500', color: '#0F172A' }}>{l.nome || `Item ${l.item_id}`}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {l.grupo ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', color: '#0F172A' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
                            {l.grupo}
                          </span>
                        ) : <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '12px' }}>{MESES[l.mes - 1]}</td>
                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '12px' }}>{l.ano}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#DC2626' }}>{fmt(l.valor)}</td>
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
              <tfoot>
                <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                  <td colSpan={4} style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                    Total — {linhas.length} item{linhas.length !== 1 ? 'ns' : ''}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#DC2626' }}>
                    {fmt(linhas.reduce((s, l) => s + +l.valor, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}
