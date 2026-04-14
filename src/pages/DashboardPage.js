import { useState, useEffect, useRef } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';

const MESES      = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ANO        = new Date().getFullYear();
const MES_IDX    = new Date().getMonth();

const fmt  = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v) => { const n = Math.abs(v); return (v < 0 ? '-' : '') + (n >= 1000 ? 'R$ ' + (n / 1000).toFixed(1) + 'k' : fmt(n)); };
const pct  = (part, total) => total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

const card = { background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' };

const METAS = [
  { nome: 'Viagem',  meta: 5000,  atual: 3400, icone: '✈️' },
  { nome: 'Carro',   meta: 15000, atual: 4800, icone: '🚗' },
  { nome: 'Reserva', meta: 12000, atual: 1800, icone: '🏦' },
];

const TRANS_MOCK = [
  { nome: 'Mercado Extra', cat: 'Alimentação', data: '12/04', valor: -320.50, icone: '🛒' },
  { nome: 'Salário',       cat: 'Receita',     data: '05/04', valor: 5200,    icone: '💼' },
  { nome: 'Netflix',       cat: 'Lazer',       data: '03/04', valor: -55.90,  icone: '🎬' },
  { nome: 'Conta de Luz',  cat: 'Casa',        data: '01/04', valor: -187.40, icone: '💡' },
  { nome: 'Uber',          cat: 'Transporte',  data: '28/03', valor: -32.00,  icone: '🚕' },
];

/* ── KPI Card ─────────────────────────────────────────────────── */
function KPICard({ label, valor, valorColor, iconBg, icon, badge, sub, barPct, barColor }) {
  return (
    <div style={{ ...card }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
          {badge.txt}
        </span>
      </div>
      <p style={{ margin: '0 0 1px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '700', color: valorColor || '#0F172A', lineHeight: 1.2 }}>{valor}</p>
      {sub && <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748B' }}>{sub}</p>}
      <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
        <div style={{ height: '100%', width: `${Math.min(100, barPct || 0)}%`, background: barColor, borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [mesAtivo,    setMesAtivo]    = useState(MES_IDX);
  const [lancamentos, setLancamentos] = useState([]);
  const [grupos,      setGrupos]      = useState([]);
  const [transacoes,  setTransacoes]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [chartLoaded, setChartLoaded] = useState(false);

  const usuario   = getCurrentUser();
  const barRef    = useRef(null);
  const donutRef  = useRef(null);
  const barInst   = useRef(null);
  const donutInst = useRef(null);

  /* ── Carrega Chart.js via CDN ── */
  useEffect(() => {
    if (window.Chart) { setChartLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    s.onload = () => setChartLoaded(true);
    document.head.appendChild(s);
  }, []);

  /* ── Cleanup ao desmontar ── */
  useEffect(() => {
    return () => {
      if (barInst.current)   { barInst.current.destroy();   barInst.current   = null; }
      if (donutInst.current) { donutInst.current.destroy(); donutInst.current = null; }
    };
  }, []);

  /* ── Carrega dados ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [lRes, gRes, tRes] = await Promise.all([
          api.get(`/fluxo/lancamentos/${ANO}`),
          api.get('/fluxo/grupos'),
          api.get('/transacoes'),
        ]);
        setLancamentos(lRes.data || []);
        setGrupos(gRes.data || []);
        setTransacoes(tRes.data || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Funções de cálculo ── */
  const getSaidas = (idx) =>
    lancamentos.filter(l => l.mes === idx + 1).reduce((s, l) => s + +l.valor, 0);

  const getEntradas = (idx) =>
    transacoes
      .filter(t => t.tipo === 'receita'
        && new Date(t.data).getUTCMonth() === idx
        && new Date(t.data).getUTCFullYear() === ANO)
      .reduce((s, t) => s + +t.valor, 0);

  const getSaldo = (idx) => getEntradas(idx) - getSaidas(idx);

  const getMaiorItem = (idx) => {
    const lsMes = lancamentos.filter(l => l.mes === idx + 1);
    if (!lsMes.length) return null;
    const top = lsMes.reduce((a, b) => +b.valor > +a.valor ? b : a);
    let nome = `Item ${top.item_id}`;
    for (const g of grupos) {
      const it = (g.itens || []).find(i => i.id === top.item_id);
      if (it) { nome = it.nome; break; }
    }
    return { nome, valor: +top.valor };
  };

  const getCatsMes = (idx) => {
    const mes = idx + 1;
    const itemGrupo = {};
    for (const g of grupos) for (const it of (g.itens || [])) itemGrupo[it.id] = g.nome;
    const map = {};
    for (const l of lancamentos.filter(l => l.mes === mes)) {
      const cat = itemGrupo[l.item_id] || 'Outros';
      map[cat] = (map[cat] || 0) + +l.valor;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  };

  /* ── Dados derivados ── */
  const dadosMeses = Array.from({ length: 12 }, (_, i) => ({
    e: getEntradas(i), s: getSaidas(i), sd: getSaldo(i),
  }));
  const comDados  = dadosMeses.map((d, i) => ({ ...d, i })).filter(d => d.e > 0 || d.s > 0);
  const melhorIdx = comDados.length ? comDados.reduce((a, b) => b.sd > a.sd ? b : a).i : -1;
  const piorIdx   = comDados.length ? comDados.reduce((a, b) => b.sd < a.sd ? b : a).i : -1;

  const e         = getEntradas(mesAtivo);
  const s         = getSaidas(mesAtivo);
  const sd        = getSaldo(mesAtivo);
  const maiorItem = getMaiorItem(mesAtivo);
  const ePrev     = mesAtivo > 0 ? getEntradas(mesAtivo - 1) : 0;
  const sPrev     = mesAtivo > 0 ? getSaidas(mesAtivo - 1)   : 0;

  const maxE      = Math.max(...dadosMeses.map(d => d.e), 1);
  const maxS      = Math.max(...dadosMeses.map(d => d.s), 1);
  const maxAbsSd  = Math.max(...dadosMeses.map(d => Math.abs(d.sd)), 1);

  const mediaSaldo   = comDados.length ? comDados.reduce((acc, d) => acc + d.sd, 0) / comDados.length : 0;
  const projecao     = mediaSaldo * 12;
  const taxaPoupanca = e > 0 ? Math.max(0, pct(sd, e)) : 0;

  const varBadge = (now, prev) => {
    if (prev === 0) return null;
    const p = Math.abs(Math.round(((now - prev) / prev) * 100));
    return { pct: p, up: now >= prev };
  };
  const vE = varBadge(e, ePrev);
  const vS = varBadge(s, sPrev);

  /* ── Bar chart ── */
  useEffect(() => {
    if (!chartLoaded || loading) return;
    if (barInst.current) { barInst.current.destroy(); barInst.current = null; }
    if (!barRef.current) return;
    barInst.current = new window.Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Saídas'],
        datasets: [{
          data: [e, s],
          backgroundColor: ['#93C5FD', '#FCA5A5'],
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `R$ ${Number(ctx.raw).toFixed(2)}` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: '#F8FAFC' }, ticks: { callback: v => `R$${(v / 1000).toFixed(0)}k`, font: { size: 10 } } },
        },
      },
    });
  }, [chartLoaded, loading, mesAtivo, lancamentos, transacoes]); // eslint-disable-line

  /* ── Donut chart ── */
  useEffect(() => {
    if (!chartLoaded || loading) return;
    if (donutInst.current) { donutInst.current.destroy(); donutInst.current = null; }
    if (!donutRef.current) return;
    const cats = getCatsMes(mesAtivo);
    if (!cats.length) return;
    donutInst.current = new window.Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c[0]),
        datasets: [{ data: cats.map(c => c[1]), backgroundColor: ['#EF4444','#60A5FA','#34D399','#CBD5E1'], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false } },
      },
    });
  }, [chartLoaded, loading, mesAtivo, lancamentos, grupos]); // eslint-disable-line

  /* ════════════ RENDER ════════════ */
  return (
    <Layout>
      <div style={{ padding: '18px 22px', background: '#F1F5F9', minHeight: '100vh' }}>

        {/* ── Linha 1: Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Painel financeiro</h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              Olá, {usuario?.nome || 'Usuário'} · {MESES_FULL[mesAtivo]} {ANO}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'white', color: '#0F172A', border: '0.5px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              ↓ Exportar
            </button>
            <button style={{ background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              + Lançamento
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* ── Linha 2: 4 KPIs ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <KPICard
              label="Entradas" valor={fmt(e)} iconBg="#EFF6FF"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#2563EB"><path d="M7 14l5-5 5 5z"/></svg>}
              badge={vE ? { txt: `${vE.up ? '↑' : '↓'} ${vE.pct}% vs anterior`, color: vE.up ? '#166534' : '#991B1B', bg: vE.up ? '#DCFCE7' : '#FEE2E2' } : { txt: 'sem comparativo', color: '#64748B', bg: '#F1F5F9' }}
              barPct={pct(e, maxE)} barColor="#3B82F6"
            />
            <KPICard
              label="Saídas" valor={fmt(s)} iconBg="#FEF2F2"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M7 10l5 5 5-5z"/></svg>}
              badge={vS ? { txt: `${vS.up ? '↑' : '↓'} ${vS.pct}% vs anterior`, color: vS.up ? '#991B1B' : '#166534', bg: vS.up ? '#FEE2E2' : '#DCFCE7' } : { txt: 'sem comparativo', color: '#64748B', bg: '#F1F5F9' }}
              barPct={pct(s, maxS)} barColor="#EF4444"
            />
            <KPICard
              label="Saldo" valor={fmt(sd)} valorColor={sd >= 0 ? '#16A34A' : '#DC2626'}
              iconBg={sd >= 0 ? '#DCFCE7' : '#FEE2E2'}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill={sd >= 0 ? '#16A34A' : '#DC2626'}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
              badge={
                mesAtivo === melhorIdx ? { txt: 'melhor mês ★', color: '#166534', bg: '#DCFCE7' } :
                mesAtivo === piorIdx   ? { txt: 'pior mês',     color: '#991B1B', bg: '#FEE2E2' } :
                sd >= 0               ? { txt: 'positivo',      color: '#166534', bg: '#DCFCE7' } :
                                        { txt: 'negativo',      color: '#991B1B', bg: '#FEE2E2' }
              }
              barPct={pct(Math.abs(sd), maxAbsSd)} barColor={sd >= 0 ? '#22C55E' : '#EF4444'}
            />
            <KPICard
              label="Maior gasto" valor={maiorItem ? fmt(maiorItem.valor) : 'R$ 0,00'} iconBg="#FEF2F2"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>}
              badge={{ txt: 'maior gasto', color: '#991B1B', bg: '#FEE2E2' }}
              sub={maiorItem ? `⚠ ${maiorItem.nome}` : 'Sem dados no mês'}
              barPct={maiorItem && s > 0 ? pct(maiorItem.valor, s) : 0} barColor="#EF4444"
            />
          </div>

          {/* ── Linha 3: Seletor de meses ── */}
          <div style={{ ...card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{ANO} — selecione o mês</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { cor: '#22C55E', label: 'Positivo', dash: false },
                  { cor: '#EF4444', label: 'Negativo', dash: false },
                  { cor: '#F59E0B', label: 'Melhor ★', dash: false },
                  { cor: '#F1F5F9', label: 'Sem dados', dash: true  },
                ].map(leg => (
                  <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: leg.cor, border: leg.dash ? '1.5px dashed #94A3B8' : 'none' }} />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '5px' }}>
              {dadosMeses.map((d, i) => {
                const isFuture = i > MES_IDX;
                const hasData  = d.e > 0 || d.s > 0;
                const isBest   = i === melhorIdx;
                const ativo    = i === mesAtivo;
                const borderC  = !hasData ? '#E2E8F0' : isBest ? '#F59E0B' : d.sd >= 0 ? '#22C55E' : '#EF4444';
                const barH     = hasData ? Math.max(4, Math.round((Math.abs(d.sd) / maxAbsSd) * 22)) : 0;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div
                      onClick={() => !isFuture && hasData && setMesAtivo(i)}
                      style={{
                        width: '100%', borderRadius: '7px', padding: '6px 3px 5px',
                        textAlign: 'center',
                        cursor: isFuture || !hasData ? 'default' : 'pointer',
                        opacity: isFuture ? 0.45 : 1,
                        border: `1.5px ${isFuture || !hasData ? 'dashed' : 'solid'} ${ativo ? '#1B3A6B' : borderC}`,
                        background: ativo ? '#1B3A6B' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: ativo ? 'white' : isBest ? '#D97706' : '#64748B', lineHeight: 1.2 }}>
                        {isBest ? '★' : MESES[i]}
                      </p>
                      {isBest && <p style={{ margin: 0, fontSize: '8px', color: ativo ? 'rgba(255,255,255,0.7)' : '#94A3B8', lineHeight: 1 }}>{MESES[i]}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', marginTop: '3px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: !hasData ? '#CBD5E1' : isBest ? '#F59E0B' : d.sd >= 0 ? '#22C55E' : '#EF4444' }} />
                        {hasData && (
                          <span style={{ fontSize: '8px', fontWeight: '700', color: ativo ? 'white' : (d.sd >= 0 ? '#16A34A' : '#DC2626'), lineHeight: 1 }}>
                            {fmtK(d.sd)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: '60%', height: `${barH}px`, background: isBest ? '#F59E0B' : d.sd >= 0 ? '#22C55E' : '#EF4444', borderRadius: '2px', opacity: 0.55, transition: 'height 0.3s' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Linha 4: 4 resumos anuais ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Melhor mês</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>{melhorIdx >= 0 ? MESES[melhorIdx] : '—'}</span>
                <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                  {melhorIdx >= 0 ? fmtK(dadosMeses[melhorIdx].sd) : '—'}
                </span>
              </div>
            </div>
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Pior mês</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>{piorIdx >= 0 ? MESES[piorIdx] : '—'}</span>
                <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
                  {piorIdx >= 0 ? fmtK(dadosMeses[piorIdx].sd) : '—'}
                </span>
              </div>
            </div>
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Média guardada/mês</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: mediaSaldo >= 0 ? '#16A34A' : '#DC2626' }}>{fmt(mediaSaldo)}</p>
            </div>
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Projeção anual</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: projecao >= 0 ? '#16A34A' : '#DC2626' }}>{fmt(projecao)}</p>
            </div>
          </div>

          {/* ── Linha 5: 3 gráficos ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>

            {/* Fluxo do mês */}
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Fluxo — {MESES[mesAtivo]}</p>
              <div style={{ height: '148px' }}>
                {loading
                  ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '12px', color: '#94A3B8' }}>Carregando…</span></div>
                  : <canvas ref={barRef} />
                }
              </div>
            </div>

            {/* Gastos por categoria */}
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Gastos por categoria</p>
              {(() => {
                const cats      = getCatsMes(mesAtivo);
                const totalCats = cats.reduce((sum, c) => sum + c[1], 0);
                const colors    = ['#EF4444','#60A5FA','#34D399','#CBD5E1'];
                return (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '110px', height: '110px', flexShrink: 0 }}>
                      {!loading && <canvas ref={donutRef} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {cats.length === 0 && <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Sem dados para este mês</p>}
                      {cats.map((cat, ci) => (
                        <div key={cat[0]} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[ci] || '#E2E8F0', flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', color: '#64748B', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat[0]}</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A', flexShrink: 0 }}>{pct(cat[1], totalCats)}%</span>
                          <span style={{ fontSize: '10px', color: '#94A3B8', flexShrink: 0 }}>{fmtK(cat[1])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Saúde financeira */}
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Saúde financeira</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {[
                  { label: 'Taxa de poupança',   val: taxaPoupanca, color: '#3B82F6' },
                  { label: 'Controle de gastos', val: 68,           color: '#10B981' },
                  { label: 'Progresso de metas', val: 38,           color: '#8B5CF6' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{bar.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A' }}>{bar.val}%</span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, bar.val)}%`, background: bar.color, borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: sd >= 0 ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${sd >= 0 ? '#BBF7D0' : '#FECACA'}`, borderRadius: '8px', padding: '10px 12px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: sd >= 0 ? '#14532D' : '#991B1B' }}>
                  {sd >= 0 ? '✅ Mês no positivo!' : '⚠️ Mês no negativo'}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: sd >= 0 ? '#166534' : '#B91C1C' }}>
                  {sd >= 0 ? `Você guardou ${fmt(sd)} em ${MESES[mesAtivo]}` : `Déficit de ${fmt(Math.abs(sd))} em ${MESES[mesAtivo]}`}
                </p>
              </div>
            </div>
          </div>

          {/* ── Linha 6: 3 insights ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              {
                titulo: 'Atenção nos gastos',
                desc:   s > 0 ? `Suas saídas somam ${fmt(s)} em ${MESES[mesAtivo]}.` : 'Nenhuma saída registrada neste mês.',
                iconBg: '#FEF2F2',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
              },
              {
                titulo: sd >= 0 ? 'Tendência positiva' : 'Revise seus gastos',
                desc:   sd >= 0 ? `Saldo positivo de ${fmt(sd)}. Continue assim!` : `Reduza gastos em ${fmt(Math.abs(sd))} para equilibrar.`,
                iconBg: sd >= 0 ? '#F0FDF4' : '#FEF3C7',
                icon: sd >= 0
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
              },
              {
                titulo: 'Meta mais próxima',
                desc:   `Viagem: ${pct(METAS[0].atual, METAS[0].meta)}% concluída. Faltam ${fmt(METAS[0].meta - METAS[0].atual)}.`,
                iconBg: '#EFF6FF',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
              },
            ].map(ins => (
              <div key={ins.titulo} style={{ ...card, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: ins.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ins.icon}
                </div>
                <div>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{ins.titulo}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Linha 7: Metas + Transações ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>

            {/* Metas */}
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Metas em andamento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {METAS.map(meta => {
                  const p    = pct(meta.atual, meta.meta);
                  const corB = p >= 80 ? '#22C55E' : p >= 50 ? '#3B82F6' : '#F59E0B';
                  return (
                    <div key={meta.nome} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{meta.icone}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{meta.nome}</span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{p}% · falta {fmt(meta.meta - meta.atual)}</span>
                        </div>
                        <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p}%`, background: corB, borderRadius: '4px', transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Últimas transações */}
            <div style={{ ...card }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Últimas transações</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {TRANS_MOCK.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '0.5px solid #E2E8F0' }}>
                      {t.icone}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nome}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>{t.cat} · {t.data}</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: t.valor >= 0 ? '#16A34A' : '#DC2626', flexShrink: 0 }}>
                      {t.valor >= 0 ? '+' : ''}R$ {Math.abs(t.valor).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
