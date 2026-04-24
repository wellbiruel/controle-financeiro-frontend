import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import Chart from 'chart.js/auto';
import Layout from '../Components/Layout/Layout';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const fmt = (v) => v?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0,00';
const fmtK = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${Math.round(v)}`;

const CAT_COLORS = ['#EF4444','#60A5FA','#34D399','#A78BFA','#FBB824','#94A3B8','#F472B6','#FB923C'];

const S = {
  page: {
    color: '#E2E8F0',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    paddingBottom: 40,
  },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
  },
  monthChip: (active, tipo) => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: tipo === 'empty'
      ? '0.5px dashed rgba(129,140,248,0.3)'
      : tipo === 'pos'
        ? '0.5px solid rgba(52,211,153,0.4)'
        : tipo === 'neg'
          ? '0.5px solid rgba(248,113,113,0.4)'
          : '0.5px solid rgba(129,140,248,0.2)',
    color: active ? '#fff' : tipo === 'pos' ? '#34D399' : tipo === 'neg' ? '#F87171' : '#94A3B8',
    background: active ? '#6366F1' : 'transparent',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s',
    userSelect: 'none',
  }),
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 },
  card: (extra = {}) => ({
    background: '#1A1740',
    border: '0.5px solid rgba(129,140,248,0.15)',
    borderRadius: 12,
    padding: 14,
    ...extra,
  }),
  cardAccent: (grad, borderColor) => ({
    background: grad,
    border: `0.5px solid ${borderColor}`,
    borderRadius: 12,
    padding: 14,
  }),
  kpiLabel: (color = '#94A3B8') => ({
    fontSize: 11,
    color,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }),
  kpiValue: (color) => ({ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }),
  badge: (up) => ({
    fontSize: 11,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 8px',
    borderRadius: 20,
    background: up ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
    color: up ? '#34D399' : '#F87171',
  }),
  progressBar: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressFill: (pct, color) => ({ height: '100%', width: `${Math.min(pct,100)}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }),
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 10px' },
  chartWrap: (h = 160) => ({ position: 'relative', height: h, width: '100%' }),
  legendRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94A3B8' },
  legendDot: (color) => ({ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }),
};

function SparkBar({ data, color, height = 60 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.map((_,i) => i),
        datasets: [{ data, backgroundColor: color + '99', borderColor: color, borderWidth: 1, borderRadius: 3 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false,
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, color]);
  return <div style={{ position: 'relative', height, width: '100%', marginTop: 8 }}><canvas ref={ref} /></div>;
}

function DonutChart({ data, colors, centerText }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.value), backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(1)}%` } },
        },
        animation: { duration: 600 },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, colors]);
  return (
    <div style={{ position: 'relative', height: 180 }}>
      <canvas ref={ref} />
      {centerText && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>{centerText}</div>
        </div>
      )}
    </div>
  );
}

function BarLineChart({ labels, entradas, saidas, saldo }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      data: {
        labels,
        datasets: [
          { type: 'bar', label: 'Entradas', data: entradas, backgroundColor: '#34D39966', borderColor: '#34D399', borderWidth: 1, borderRadius: 4 },
          { type: 'bar', label: 'Saídas', data: saidas, backgroundColor: '#F8717166', borderColor: '#F87171', borderWidth: 1, borderRadius: 4 },
          { type: 'line', label: 'Saldo', data: saldo, borderColor: '#60A5FA', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#60A5FA', tension: 0.4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#64748B', font: { size: 10 }, callback: v => fmtK(v) }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        animation: { duration: 600 },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, entradas, saidas, saldo]);
  return <div style={S.chartWrap(200)}><canvas ref={ref} /></div>;
}

function MiniDonut({ pct, color = '#6366F1', size = 60 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { datasets: [{ data: [pct, 100 - pct], backgroundColor: [color, 'rgba(255,255,255,0.08)'], borderWidth: 0 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: false,
      },
    });
    return () => chartRef.current?.destroy();
  }, [pct, color]);
  return <div style={{ position: 'relative', width: size, height: size }}><canvas ref={ref} /></div>;
}

export default function DashboardPage() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth();

  const [ano, setAno] = useState(anoAtual);
  const [mesSel, setMesSel] = useState(mesAtual);
  const [loading, setLoading] = useState(true);

  const [transacoes, setTransacoes] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [tetoGastos, setTetoGastos] = useState(() => Number(localStorage.getItem('teto_gastos') || 0));

  const [metas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('metas_financeiras') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) { try { const parsed = JSON.parse(u); setNomeUsuario(parsed.nome || parsed.email || ''); } catch {} }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resT, resL] = await Promise.all([
        api.get('/transacoes'),
        api.get(`/fluxo/lancamentos/${ano}`),
      ]);
      // normaliza mes/ano das transacoes extraindo do campo data
      const txNormalizadas = (resT.data || []).map(t => ({
        ...t,
        mes: t.mes || parseInt((t.data || '').split('-')[1]),
        ano: t.ano || parseInt((t.data || '').split('-')[0]),
      }));
      setTransacoes(txNormalizadas);
      setLancamentos(resL.data || []);
    } catch (e) {
      console.error('Erro ao buscar dados:', e);
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // entradas por mês (transacoes tipo 'entrada')
  const entradasPorMes = Array.from({ length: 12 }, (_, m) =>
    transacoes
      .filter(t => t.tipo === 'entrada' && Number(t.mes) === m + 1 && Number(t.ano) === ano)
      .reduce((s, t) => s + Number(t.valor), 0)
  );

  // saidas por mês (lancamentos_mensais via fluxo — todos são saídas)
  const saidasPorMes = Array.from({ length: 12 }, (_, m) => {
    if (!Array.isArray(lancamentos)) return 0;
    return lancamentos
      .filter(l => Number(l.mes) === m + 1)
      .reduce((s, l) => s + Number(l.valor || 0), 0);
  });

  const saldoPorMes = entradasPorMes.map((e, i) => e - saidasPorMes[i]);

  const entradaMes = entradasPorMes[mesSel];
  const saidaMes = saidasPorMes[mesSel];
  const saldoMes = saldoPorMes[mesSel];

  const entradaMesAnt = entradasPorMes[mesSel - 1] || 0;
  const saidaMesAnt = saidasPorMes[mesSel - 1] || 0;
  const saldoMesAnt = saldoPorMes[mesSel - 1] || 0;

  const varEntrada = entradaMesAnt > 0 ? ((entradaMes - entradaMesAnt) / entradaMesAnt) * 100 : 0;
  const varSaida = saidaMesAnt > 0 ? ((saidaMes - saidaMesAnt) / saidaMesAnt) * 100 : 0;
  const varSaldo = saldoMesAnt !== 0 ? ((saldoMes - saldoMesAnt) / Math.abs(saldoMesAnt)) * 100 : 0;

  const saldoAcumulado = saldoPorMes.slice(0, mesSel + 1).reduce((s, v) => s + v, 0);

  const totalEntradas = entradasPorMes.reduce((s, v) => s + v, 0);
  const totalSaidas = saidasPorMes.reduce((s, v) => s + v, 0);
  const saldoAnual = totalEntradas - totalSaidas;

  const mesesComDados = saldoPorMes.filter((_, i) => entradasPorMes[i] > 0 || saidasPorMes[i] > 0);
  const melhorSaldo = Math.max(...(mesesComDados.length ? mesesComDados : [0]));
  const melhorMes = saldoPorMes.indexOf(melhorSaldo);

  const taxaPoupanca = totalEntradas > 0 ? Math.round((saldoAnual / totalEntradas) * 100) : 0;

  const pcTeto = tetoGastos > 0 ? (saidaMes / tetoGastos) * 100 : 0;
  const limiteRestante = tetoGastos > 0 ? tetoGastos - saidaMes : 0;
  const limiteRestantePct = tetoGastos > 0 ? (limiteRestante / tetoGastos) * 100 : 0;

  // categorias do mês selecionado
  const catMap = {};
  transacoes
    .filter(t => t.tipo === 'saida' && Number(t.mes) === mesSel + 1 && Number(t.ano) === ano && t.categoria)
    .forEach(t => { catMap[t.categoria] = (catMap[t.categoria] || 0) + Number(t.valor); });
  const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
  const categoriasDonut = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value: parseFloat(((value / totalCat) * 100).toFixed(1)) }));

  const chipTipo = (i) => {
    if (entradasPorMes[i] === 0 && saidasPorMes[i] === 0) return 'empty';
    return saldoPorMes[i] >= 0 ? 'pos' : 'neg';
  };

  const ultimos6E = entradasPorMes.slice(Math.max(0, mesSel - 6), mesSel);
  const ultimos6S = saidasPorMes.slice(Math.max(0, mesSel - 6), mesSel);
  const medE = ultimos6E.length > 0 ? ultimos6E.reduce((s,v) => s+v,0)/ultimos6E.length : 0;
  const medS = ultimos6S.length > 0 ? ultimos6S.reduce((s,v) => s+v,0)/ultimos6S.length : 0;
  const varE6 = medE > 0 ? ((entradaMes - medE)/medE)*100 : 0;
  const varS6 = medS > 0 ? ((saidaMes - medS)/medS)*100 : 0;
  const varSaldo6 = (medE - medS) !== 0 ? ((saldoMes - (medE - medS))/Math.abs(medE - medS))*100 : 0;

  const alertas = [];
  if (pcTeto > 80) alertas.push({ nivel: 'red', titulo: 'Limite do mês quase atingido', desc: `Você já utilizou ${pcTeto.toFixed(0)}% do orçamento deste mês.` });
  if (varSaida > 10) alertas.push({ nivel: 'amber', titulo: 'Saídas acima do mês anterior', desc: `Seus gastos aumentaram ${varSaida.toFixed(1)}% em relação ao mês passado.` });
  if (saldoAnual < 0) alertas.push({ nivel: 'red', titulo: 'Saldo anual negativo', desc: 'Suas despesas estão superando suas receitas neste ano.' });
  if (alertas.length === 0) alertas.push({ nivel: 'green', titulo: 'Finanças saudáveis!', desc: 'Nenhum alerta crítico este mês. Continue assim!' });

  const insights = [];
  if (saldoAnual > 0) insights.push({ tipo: 'green', texto: `Você economizou R$ ${fmt(saldoAnual)} até agora em ${ano}! Continue assim para bater suas metas.` });
  if (melhorMes >= 0 && mesesComDados.length > 1) insights.push({ tipo: 'blue', texto: `Seu melhor mês foi ${MESES_FULL[melhorMes]} com saldo de R$ ${fmt(melhorSaldo)}.` });
  if (varSaida < 0) insights.push({ tipo: 'green', texto: `Parabéns! Você reduziu os gastos em ${Math.abs(varSaida).toFixed(1)}% em relação ao mês anterior.` });
  if (mesSel < 11) insights.push({ tipo: 'amber', texto: `Atenção: faltam ${11 - mesSel} meses para encerrar o ano. Revise suas metas de poupança.` });

  const corGauge = pcTeto < 60 ? '#34D399' : pcTeto < 80 ? '#FBB824' : '#F87171';

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(129,140,248,0.2)', borderTop: '3px solid #6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ color: '#818CF8', fontSize: 14 }}>Carregando dashboard...</div>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div style={S.page}>
      <style>{`
        ::-webkit-scrollbar{display:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dash-section{animation:fadeIn 0.4s ease both}
        .month-chip-hover:hover{opacity:0.85}
        .btn-ghost:hover{background:rgba(129,140,248,0.1)!important}
        .alert-item-red{background:rgba(248,113,113,0.08);border:0.5px solid rgba(248,113,113,0.2)}
        .alert-item-amber{background:rgba(251,191,36,0.08);border:0.5px solid rgba(251,191,36,0.2)}
        .alert-item-green{background:rgba(52,211,153,0.08);border:0.5px solid rgba(52,211,153,0.2)}
        @media(max-width:900px){
          .grid4-resp{grid-template-columns:repeat(2,1fr)!important}
          .grid3-resp{grid-template-columns:1fr!important}
          .grid-kpis-resp{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:600px){
          .grid4-resp{grid-template-columns:1fr!important}
          .grid-kpis-resp{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>Plano Financeiro Anual</div>
            <div style={{ fontSize: 12, color: '#818CF8', marginTop: 2 }}>{MESES_FULL[mesSel]} {ano} {nomeUsuario ? `· ${nomeUsuario}` : ''}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={ano} onChange={e => setAno(Number(e.target.value))} style={{ background: '#1E1B4B', border: '0.5px solid #4338CA', color: '#E2E8F0', padding: '7px 14px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
              {[anoAtual - 1, anoAtual, anoAtual + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchData} style={{ background: '#1E1B4B', border: '0.5px solid #4338CA', color: '#818CF8', width: 36, height: 36, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Atualizar dados">↻</button>
          </div>
        </div>

        {/* Seletor de meses */}
        <div style={S.monthNav} className="dash-section">
          <span style={{ color: '#64748B', fontSize: 18, cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}
            onClick={() => setAno(a => a - 1)}>‹</span>
          {MESES.map((m, i) => (
            <div key={i} className="month-chip-hover" style={S.monthChip(mesSel === i, chipTipo(i))} onClick={() => setMesSel(i)}>
              {m}{melhorMes === i && mesesComDados.length > 0 ? ' ★' : ''}
            </div>
          ))}
          <span style={{ color: '#64748B', fontSize: 18, cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}
            onClick={() => setAno(a => a + 1)}>›</span>
        </div>

        {/* 4 KPIs superiores */}
        <div style={{ ...S.grid4, marginBottom: 12 }} className="grid4-resp dash-section">
          <div style={S.cardAccent('linear-gradient(135deg,#312E81,#1A1740)', 'rgba(129,140,248,0.3)')}>
            <div style={S.kpiLabel()}>🐷 Dinheiro Guardado</div>
            <div style={S.kpiValue('#818CF8')}>R$ {fmt(saldoAcumulado)}</div>
            <span style={S.badge(saldoMes >= 0)}>{saldoMes >= 0 ? '▲' : '▼'} acumulado {ano}</span>
            <SparkBar data={saldoPorMes.map(v => Math.max(0, v))} color="#818CF8" height={40} />
          </div>

          <div style={S.cardAccent('linear-gradient(135deg,#134E4A,#1A1740)', 'rgba(20,184,166,0.3)')}>
            <div style={S.kpiLabel()}>🛡️ Reserva de Segurança</div>
            <div style={S.kpiValue('#2DD4BF')}>
              {entradaMes > 0 ? `${(saldoAcumulado / (saidaMes || 1)).toFixed(1)} meses` : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>de despesas cobertas</div>
            <div style={{ ...S.progressBar, marginTop: 0 }}>
              <div style={S.progressFill(Math.min((saldoAcumulado / (saidaMes || 1)) / 6 * 100, 100), '#14B8A6')} />
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>Meta: 6 meses</div>
          </div>

          <div style={S.cardAccent('linear-gradient(135deg,#4C1D95,#1A1740)', 'rgba(167,139,250,0.3)')}>
            <div style={S.kpiLabel()}>🎯 Metas</div>
            <div style={S.kpiValue('#A78BFA')}>
              {metas.length > 0 ? `R$ ${fmt(metas.reduce((s, m) => s + Number(m.atual || 0), 0))}` : 'Sem metas'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Total acumulado</div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#A78BFA', cursor: 'pointer' }}>
              {metas.length} {metas.length === 1 ? 'meta ativa' : 'metas ativas'} ›
            </div>
          </div>

          <div style={S.cardAccent('linear-gradient(135deg,#78350F,#1A1740)', 'rgba(251,191,36,0.3)')}>
            <div style={S.kpiLabel()}>⏱️ Limite Restante do Mês</div>
            <div style={S.kpiValue('#FBB824')}>
              {tetoGastos > 0 ? `R$ ${fmt(limiteRestante)}` : '—'}
            </div>
            {tetoGastos > 0 ? (
              <span style={{ ...S.badge(limiteRestantePct > 30), background: 'rgba(251,191,36,0.15)', color: '#FBB824' }}>
                {limiteRestantePct.toFixed(0)}% do orçamento
              </span>
            ) : (
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                Configure o teto em{' '}
                <span style={{ color: '#FBB824', cursor: 'pointer' }} onClick={() => {
                  const v = prompt('Teto de gastos mensal (R$):');
                  if (v && !isNaN(v)) { const n = Number(v); setTetoGastos(n); localStorage.setItem('teto_gastos', n); }
                }}>Fluxo Anual</span>
              </div>
            )}
          </div>
        </div>

        {/* KPIs mensais + gauge */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr) 1.1fr', gap: 12, marginBottom: 12 }} className="grid4-resp dash-section">
          <div style={S.card()}>
            <div style={S.kpiLabel('#34D399')}>↑ Entradas (Mês)</div>
            <div style={S.kpiValue('#34D399')}>R$ {fmt(entradaMes)}</div>
            <span style={S.badge(varEntrada >= 0)}>{varEntrada >= 0 ? '▲' : '▼'} {Math.abs(varEntrada).toFixed(1)}% vs mês anterior</span>
            <SparkBar data={entradasPorMes.slice(0, mesSel + 1)} color="#34D399" height={55} />
          </div>

          <div style={S.card()}>
            <div style={S.kpiLabel('#F87171')}>↓ Saídas (Mês)</div>
            <div style={S.kpiValue('#F87171')}>R$ {fmt(saidaMes)}</div>
            <span style={S.badge(varSaida <= 0)}>{varSaida >= 0 ? '▲' : '▼'} {Math.abs(varSaida).toFixed(1)}% vs mês anterior</span>
            <SparkBar data={saidasPorMes.slice(0, mesSel + 1)} color="#F87171" height={55} />
          </div>

          <div style={S.card()}>
            <div style={S.kpiLabel('#60A5FA')}>= Saldo do Mês</div>
            <div style={S.kpiValue('#60A5FA')}>R$ {fmt(saldoMes)}</div>
            <span style={S.badge(varSaldo >= 0)}>{varSaldo >= 0 ? '▲' : '▼'} {Math.abs(varSaldo).toFixed(1)}% vs mês anterior</span>
            <SparkBar data={saldoPorMes.slice(0, mesSel + 1)} color="#60A5FA" height={55} />
          </div>

          <div style={S.card({ textAlign: 'center' })}>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Limite do Mês (Teto)</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: corGauge }}>
              {tetoGastos > 0 ? `${pcTeto.toFixed(0)}%` : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10 }}>do orçamento utilizado</div>
            <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${Math.min(pcTeto, 100)}%`, background: 'linear-gradient(90deg,#34D399 0%,#FBB824 55%,#F87171 80%)', borderRadius: 6, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 8 }}>
              <span>R$ 0</span>
              <span style={{ color: corGauge, fontWeight: 600 }}>R$ {fmt(saidaMes)} / R$ {fmt(tetoGastos)}</span>
            </div>
            {pcTeto > 80 && tetoGastos > 0 && (
              <>
                <div style={{ background: '#FBB824', color: '#1C1917', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 4 }}>⚠ ATENÇÃO</div>
                <div style={{ fontSize: 10, color: '#94A3B8' }}>Acima de 80% do limite!</div>
              </>
            )}
            {tetoGastos === 0 && <div style={{ fontSize: 11, color: '#64748B' }}>Configure no Fluxo Anual</div>}
          </div>
        </div>

        {/* Gráfico anual + Donut + Comparativos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, marginBottom: 12 }} className="grid3-resp dash-section">
          <div style={S.card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>Evolução Financeira Anual</span>
            </div>
            <div style={S.legendRow}>
              {[['#34D399','Entradas'],['#F87171','Saídas'],['#60A5FA','Saldo']].map(([c,l]) => (
                <div key={l} style={S.legendItem}><div style={S.legendDot(c)} />{l}</div>
              ))}
            </div>
            <BarLineChart labels={MESES} entradas={entradasPorMes} saidas={saidasPorMes} saldo={saldoPorMes} />
          </div>

          <div style={S.card()}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>
              Gastos por Categoria ({MESES[mesSel]})
            </div>
            {categoriasDonut.length > 0 ? (
              <>
                <DonutChart data={categoriasDonut} colors={CAT_COLORS.slice(0, categoriasDonut.length)} centerText={`R$\n${fmt(saidaMes)}`} />
                <div style={S.legendRow}>
                  {categoriasDonut.map((c, i) => (
                    <div key={c.label} style={S.legendItem}><div style={S.legendDot(CAT_COLORS[i])} />{c.label} {c.value}%</div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#64748B', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
                Sem dados de categoria<br />para {MESES_FULL[mesSel]}
              </div>
            )}
          </div>

          <div style={S.card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>Comparativos</span>
              <span style={{ fontSize: 11, color: '#818CF8' }}>{MESES[mesSel]}/{ano}</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              vs Mês Anterior ({MESES[mesSel - 1] || '—'}/{ano})
            </div>
            {[
              ['Entradas', varEntrada, entradaMes - entradaMesAnt, true],
              ['Saídas', varSaida, saidaMes - saidaMesAnt, false],
              ['Saldo', varSaldo, saldoMes - saldoMesAnt, true],
            ].map(([label, pct, diff, maisEMelhor]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid rgba(129,140,248,0.08)', fontSize: 12 }}>
                <span style={{ color: '#94A3B8', fontSize: 11 }}>{label}</span>
                <span style={{ color: (maisEMelhor ? pct >= 0 : pct <= 0) ? '#34D399' : '#F87171', fontWeight: 600 }}>
                  {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
                </span>
                <span style={{ color: diff >= 0 ? '#34D399' : '#F87171', fontSize: 10 }}>
                  {diff >= 0 ? '+' : ''}R${fmt(diff)}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#64748B', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              vs Média Últimos 6 Meses
            </div>
            {[
              ['Entradas', varE6, entradaMes - medE, true],
              ['Saídas', varS6, saidaMes - medS, false],
              ['Saldo', varSaldo6, saldoMes - (medE - medS), true],
            ].map(([label, pct, diff, maisEMelhor]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid rgba(129,140,248,0.08)', fontSize: 12 }}>
                <span style={{ color: '#94A3B8', fontSize: 11 }}>{label}</span>
                <span style={{ color: (maisEMelhor ? pct >= 0 : pct <= 0) ? '#34D399' : '#F87171', fontWeight: 600 }}>
                  {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
                </span>
                <span style={{ color: diff >= 0 ? '#34D399' : '#F87171', fontSize: 10 }}>
                  {diff >= 0 ? '+' : ''}R${fmt(diff)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas + Insights + Metas */}
        <div style={S.grid3} className="grid3-resp dash-section">
          <div style={S.card()}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>🔔 Alertas</div>
            {alertas.map((a, i) => (
              <div key={i} className={`alert-item-${a.nivel}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, background: a.nivel === 'red' ? 'rgba(248,113,113,0.2)' : a.nivel === 'green' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)' }}>
                  {a.nivel === 'red' ? '🔴' : a.nivel === 'green' ? '🟢' : '🟡'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 2 }}>{a.titulo}</div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{a.desc}</div>
                </div>
              </div>
            ))}
            <button className="btn-ghost" style={{ background: 'transparent', border: '0.5px solid rgba(248,113,113,0.3)', color: '#F87171', padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 4 }}>
              Ver todos os alertas
            </button>
          </div>

          <div style={S.card()}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>💡 Insights do Ano</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, background: ins.tipo === 'green' ? 'rgba(52,211,153,0.2)' : ins.tipo === 'blue' ? 'rgba(96,165,250,0.2)' : 'rgba(251,191,36,0.2)', color: ins.tipo === 'green' ? '#34D399' : ins.tipo === 'blue' ? '#60A5FA' : '#FBB824' }}>
                  {ins.tipo === 'green' ? '✓' : ins.tipo === 'blue' ? '★' : '!'}
                </div>
                <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>{ins.texto}</div>
              </div>
            ))}
            <button className="btn-ghost" style={{ background: 'transparent', border: '0.5px solid rgba(129,140,248,0.3)', color: '#818CF8', padding: '7px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', width: '100%', marginTop: 4 }}>
              Ver mais insights
            </button>
          </div>

          <div style={S.card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>🎯 Metas Ativas</span>
              <span style={{ fontSize: 11, color: '#818CF8', cursor: 'pointer' }}>Ver todas</span>
            </div>
            {metas.length > 0 ? metas.slice(0, 3).map((meta, i) => {
              const pct = meta.total > 0 ? (Number(meta.atual || 0) / Number(meta.total)) * 100 : 0;
              const cores = ['#6366F1', '#14B8A6', '#F59E0B'];
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: '#E2E8F0' }}>{meta.nome || `Meta ${i+1}`}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#818CF8' }}>{pct.toFixed(0)}%</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>R$ {fmt(Number(meta.atual || 0))} / R$ {fmt(Number(meta.total || 0))}</div>
                  <div style={S.progressBar}><div style={S.progressFill(pct, cores[i % cores.length])} /></div>
                </div>
              );
            }) : (
              <div style={{ color: '#64748B', fontSize: 12, textAlign: 'center', padding: '30px 0' }}>
                Nenhuma meta cadastrada.<br />
                <span style={{ color: '#818CF8', cursor: 'pointer' }}>Criar primeira meta →</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Anual */}
        <div style={{ ...S.card(), marginTop: 4 }} className="dash-section">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Resumo Anual {ano}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, alignItems: 'center' }}>
            {[
              { lbl: 'Entradas Totais', val: `R$ ${fmt(totalEntradas)}`, cor: '#34D399' },
              { lbl: 'Saídas Totais', val: `R$ ${fmt(totalSaidas)}`, cor: '#F87171' },
              { lbl: 'Saldo Anual', val: `R$ ${fmt(saldoAnual)}`, cor: '#60A5FA' },
              { lbl: 'Melhor Mês', val: mesesComDados.length > 0 ? MESES_FULL[melhorMes] : '—', cor: '#34D399', sub: mesesComDados.length > 0 ? `R$ ${fmt(melhorSaldo)}` : null },
            ].map((k, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k.lbl}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: k.cor }}>{k.val}</div>
                {k.sub && <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{k.sub}</div>}
              </div>
            ))}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Taxa de Poupança</div>
              <div style={{ position: 'relative' }}>
                <MiniDonut pct={Math.max(0, taxaPoupanca)} color="#6366F1" size={60} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 12, fontWeight: 700, color: '#818CF8', whiteSpace: 'nowrap' }}>
                  {taxaPoupanca}%
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>de tudo que ganham</div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </Layout>
  );
}
