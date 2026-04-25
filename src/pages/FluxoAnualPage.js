import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';
import { Chart, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, BarController, LineController, DoughnutController } from 'chart.js';
Chart.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, BarController, LineController, DoughnutController);

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_F = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CORES_CAT = ['#EF4444','#60A5FA','#34D399','#F59E0B','#A78BFA','#FB923C'];
const ANO = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth();

export default function FluxoAnualPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeUsuario = user.nome || user.email || 'Usuário';

  const [mesAtivo, setMesAtivo] = useState(MES_ATUAL);
  const [anoAtivo] = useState(ANO);
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teto, setTeto] = useState(() => parseFloat(localStorage.getItem('finanTeto') || '7000'));
  const [editandoTeto, setEditandoTeto] = useState(false);
  const [novoTeto, setNovoTeto] = useState('');

  const fluxoRef = useRef(null);
  const fluxoChart = useRef(null);

  const card = { background: 'white', borderRadius: 12, border: '0.5px solid #F1F5F9', padding: '14px 16px' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lancRes, , txRes] = await Promise.all([
          api.get(`/fluxo/lancamentos/${ANO}`),
          api.get('/fluxo/grupos'),
          api.get('/transacoes'),
        ]);
        const saidas = (lancRes.data || []).map(l => ({ ...l, tipo: 'saida' }));
        const entradas = (txRes.data || [])
          .filter(t => parseInt((t.data || '').split('-')[0]) === ANO)
          .map(t => ({
            ...t,
            tipo: 'entrada',
            mes: parseInt((t.data || '').split('-')[1]),
            ano: parseInt((t.data || '').split('-')[0]),
          }));
        setLancamentos([...saidas, ...entradas]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTotalMes = (mes, tipo) =>
    lancamentos
      .filter(l => l.mes === mes + 1 && (tipo === 'entrada' ? l.tipo === 'entrada' : l.tipo !== 'entrada'))
      .reduce((s, l) => s + parseFloat(l.valor || 0), 0);

  const getDadosMeses = () => MESES.map((_, i) => {
    const e = getTotalMes(i, 'entrada');
    const s = getTotalMes(i, 'saida');
    return { e, s, sd: e - s };
  });

  const dados = getDadosMeses();
  const mesesComDados = dados.map(d => d.e > 0 || d.s > 0);
  const melhorIdx = dados.reduce((b, d, i) => d.sd > dados[b].sd ? i : b, 0);
  const piorIdx = dados.reduce((b, d, i) => d.sd < dados[b].sd ? i : b, 0);

  const getCategoriasMes = (mes) => {
    const doMes = lancamentos.filter(l => l.mes === mes + 1 && l.tipo !== 'entrada');
    const cats = {};
    doMes.forEach(l => {
      const c = l.categoria || 'Outros';
      cats[c] = (cats[c] || 0) + parseFloat(l.valor || 0);
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    return sorted.map(([nome, val]) => ({ nome, val, pct: total > 0 ? Math.round(val / total * 100) : 0 }));
  };

  const getInsights = () => {
    const comDados = dados.filter((_, i) => mesesComDados[i]);
    const totalE = dados.reduce((s, d) => s + d.e, 0);
    const totalS = dados.reduce((s, d) => s + d.s, 0);

    const todasCats = {};
    lancamentos.filter(l => l.tipo !== 'entrada').forEach(l => {
      const c = l.categoria || 'Outros';
      todasCats[c] = (todasCats[c] || 0) + parseFloat(l.valor || 0);
    });
    const catTop = Object.entries(todasCats).sort((a, b) => b[1] - a[1])[0];
    const catPct = totalS > 0 && catTop ? Math.round(catTop[1] / totalS * 100) : 0;

    const mesesComS = dados.filter((_, i) => mesesComDados[i] && i < MES_ATUAL);
    const tendencia = mesesComS.length >= 2
      ? mesesComS[mesesComS.length - 1].s > mesesComS[mesesComS.length - 2].s ? 'subindo' : 'caindo'
      : 'estável';

    const taxaMedia = comDados.length && totalE > 0
      ? Math.round(Math.max(0, (totalE - totalS) / totalE * 100))
      : 0;

    const metasMock = [
      { nome: 'Viagem', total: 5000, guardado: 3400 },
      { nome: 'Carro', total: 15000, guardado: 4800 },
      { nome: 'Reserva', total: 12000, guardado: 1800 },
    ];
    const metaMaisProxima = [...metasMock].sort((a, b) => (b.guardado / b.total) - (a.guardado / a.total))[0];

    return [
      catTop
        ? { titulo: `${catTop[0]} lidera os gastos`, desc: `${catPct}% de todas as saídas do ano`, cor: '#EF4444', bgCor: '#FEE2E2', icone: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' }
        : { titulo: 'Sem dados de categoria', desc: 'Adicione lançamentos para ver insights', cor: '#60A5FA', bgCor: '#EFF6FF', icone: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
      dados[melhorIdx].sd > 0
        ? { titulo: `${MESES_F[melhorIdx]} foi o melhor mês`, desc: `Saldo de +${fmt(dados[melhorIdx].sd)}`, cor: '#16A34A', bgCor: '#DCFCE7', icone: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' }
        : { titulo: 'Nenhum mês positivo ainda', desc: 'Revise suas entradas e saídas', cor: '#EF4444', bgCor: '#FEE2E2', icone: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
      { titulo: `Taxa de poupança: ${taxaMedia}%`, desc: taxaMedia >= 20 ? 'Acima da meta de 20% — excelente!' : taxaMedia >= 5 ? 'Abaixo de 20% — tente aumentar' : 'Poupança muito baixa — revise gastos', cor: taxaMedia >= 20 ? '#16A34A' : taxaMedia >= 5 ? '#D97706' : '#EF4444', bgCor: taxaMedia >= 20 ? '#DCFCE7' : taxaMedia >= 5 ? '#FEF3C7' : '#FEE2E2', icone: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
      { titulo: `Saídas ${tendencia === 'caindo' ? 'em queda ↓' : tendencia === 'subindo' ? 'em alta ↑' : 'estáveis →'}`, desc: tendencia === 'caindo' ? 'Boa tendência de controle' : tendencia === 'subindo' ? 'Fique atento ao aumento dos gastos' : 'Sem variação significativa', cor: tendencia === 'caindo' ? '#16A34A' : tendencia === 'subindo' ? '#D97706' : '#60A5FA', bgCor: tendencia === 'caindo' ? '#DCFCE7' : tendencia === 'subindo' ? '#FEF3C7' : '#EFF6FF', icone: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' },
      { titulo: `Meta "${metaMaisProxima.nome}" mais próxima`, desc: `${Math.round(metaMaisProxima.guardado / metaMaisProxima.total * 100)}% concluída — faltam R$ ${(metaMaisProxima.total - metaMaisProxima.guardado).toLocaleString('pt-BR')}`, cor: '#3B82F6', bgCor: '#EFF6FF', icone: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z' },
    ];
  };

  const fmt = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const fmtK = v => (v >= 0 ? '+' : '-') + 'R$' + (Math.abs(v) / 1000).toFixed(1) + 'k';

  const totalE = dados.reduce((s, d) => s + d.e, 0);
  const totalS = dados.reduce((s, d) => s + d.s, 0);
  const saldoAcum = totalE - totalS;
  const comDadosCount = dados.filter((_, i) => mesesComDados[i]).length;
  const projecaoAnual = comDadosCount > 0 ? (saldoAcum / comDadosCount) * 12 : 0;

  const dAtivo = dados[mesAtivo];
  const entrMes = dAtivo.e;
  const saidMes = dAtivo.s;
  const saldMes = dAtivo.sd;
  const positivoMes = saldMes >= 0;
  const catsMes = getCategoriasMes(mesAtivo);
  const maiorGasto = lancamentos
    .filter(l => l.mes === mesAtivo + 1 && l.tipo !== 'entrada')
    .reduce((a, b) => parseFloat(a.valor || 0) > parseFloat(b.valor || 0) ? a : b, { descricao: '—', valor: 0 });

  const pcTeto = teto > 0 ? Math.round(saidMes / teto * 100) : 0;
  const corTeto = pcTeto < 80 ? '#16A34A' : pcTeto <= 100 ? '#D97706' : '#EF4444';
  const bgTeto = pcTeto < 80 ? '#DCFCE7' : pcTeto <= 100 ? '#FEF3C7' : '#FEE2E2';
  const badgeTeto = pcTeto < 80 ? `✅ ${pcTeto}% — dentro do limite` : pcTeto <= 100 ? `⚠ ${pcTeto}% — atenção` : `❌ Teto ultrapassado!`;

  const metas = [
    { nome: 'Viagem de férias', icone: '✈️', cor: '#3B82F6', guardado: 3400, total: 5000 },
    { nome: 'Troca do carro', icone: '🚗', cor: '#16A34A', guardado: 4800, total: 15000 },
    { nome: 'Reserva de emergência', icone: '🏠', cor: '#F59E0B', guardado: 1800, total: 12000 },
  ];

  const insights = getInsights();

  const salvarTeto = () => {
    const v = parseFloat(novoTeto.replace(',', '.'));
    if (!isNaN(v) && v > 0) {
      setTeto(v);
      localStorage.setItem('finanTeto', v.toString());
    }
    setEditandoTeto(false);
    setNovoTeto('');
  };

  useEffect(() => {
    if (!fluxoRef.current || loading) return;
    if (fluxoChart.current) fluxoChart.current.destroy();
    fluxoChart.current = new Chart(fluxoRef.current, {
      data: {
        labels: MESES,
        datasets: [
          { type: 'bar', label: 'Entradas', data: dados.map(d => d.e), backgroundColor: dados.map((_, i) => i === mesAtivo ? '#93C5FD' : '#C7D2FE'), borderRadius: 5, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.6 },
          { type: 'bar', label: 'Saídas', data: dados.map(d => d.s), backgroundColor: dados.map((_, i) => i === mesAtivo ? '#F87171' : '#FECACA'), borderRadius: 5, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.6 },
          { type: 'line', label: 'Saldo', data: dados.map(d => d.sd), borderColor: '#3B82F6', backgroundColor: 'transparent', borderWidth: 2, pointRadius: dados.map((_, i) => i === mesAtivo ? 6 : 3), pointBackgroundColor: dados.map(d => d.sd >= 0 ? '#16A34A' : '#EF4444'), tension: 0.3, yAxisID: 'y2' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => { if (elements.length > 0) setMesAtivo(elements[0].index); },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmt(ctx.parsed.y) } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' }, border: { display: false } },
          y: { grid: { color: '#F8FAFC' }, ticks: { font: { size: 10 }, color: '#94A3B8', callback: v => 'R$' + (v / 1000).toFixed(0) + 'k' }, border: { display: false } },
          y2: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, color: '#3B82F6', callback: v => (v >= 0 ? '+' : '') + 'R$' + (v / 1000).toFixed(1) + 'k' }, border: { display: false } },
        },
      },
    });
    return () => { if (fluxoChart.current) fluxoChart.current.destroy(); };
  }, [mesAtivo, lancamentos, loading]);

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Carregando...</div></Layout>;

  return (
    <Layout>
      <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto', background: '#F7F8FA', minHeight: '100vh' }}>

        {/* Linha 1 — Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Fluxo anual</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>{anoAtivo} · {nomeUsuario}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>Dashboard</button>
            <button onClick={() => navigate('/transacoes')} style={{ background: '#3B82F6', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, color: 'white', cursor: 'pointer', fontWeight: 500 }}>+ Lançamento</button>
          </div>
        </div>

        {/* Linha 2 — KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { lbl: 'Entradas no ano', val: fmt(totalE), cor: '#3B82F6', bgIco: '#EFF6FF', icoFill: '#1D4ED8', path: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z', badge: '= acumulado', badgeBg: '#F1F5F9', badgeCor: '#64748B' },
            { lbl: 'Saídas no ano', val: fmt(totalS), cor: '#EF4444', bgIco: '#FEF2F2', icoFill: '#DC2626', path: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z', badge: 'total gasto', badgeBg: '#FEE2E2', badgeCor: '#991B1B' },
            { lbl: 'Saldo acumulado', val: fmt(saldoAcum), cor: saldoAcum >= 0 ? '#16A34A' : '#EF4444', bgIco: saldoAcum >= 0 ? '#F0FDF4' : '#FEF2F2', icoFill: saldoAcum >= 0 ? '#16A34A' : '#DC2626', path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', badge: saldoAcum >= 0 ? 'positivo' : 'negativo', badgeBg: saldoAcum >= 0 ? '#DCFCE7' : '#FEE2E2', badgeCor: saldoAcum >= 0 ? '#166534' : '#991B1B' },
            { lbl: 'Projeção anual', val: fmt(projecaoAnual), cor: '#3B82F6', bgIco: '#EFF6FF', icoFill: '#1D4ED8', path: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z', badge: 'mantendo ritmo', badgeBg: '#EFF6FF', badgeCor: '#1D4ED8' },
          ].map((k, i) => (
            <div key={i} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.cor, borderRadius: '12px 12px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, background: k.bgIco, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={k.icoFill}><path d={k.path}/></svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 5, background: k.badgeBg, color: k.badgeCor }}>{k.badge}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.cor, letterSpacing: '-.4px', marginBottom: 2 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{k.lbl}</div>
            </div>
          ))}
        </div>

        {/* Linha 3 — Teto / Metas / Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 16 }}>

          {/* Card Teto */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Teto de gastos</span>
              <button onClick={() => { setEditandoTeto(!editandoTeto); setNovoTeto(teto.toString()); }}
                style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                {editandoTeto ? 'cancelar' : 'editar'}
              </button>
            </div>
            {editandoTeto ? (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <input value={novoTeto} onChange={e => setNovoTeto(e.target.value)}
                  placeholder="Ex: 7000"
                  style={{ flex: 1, padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 7, fontSize: 13, outline: 'none' }} />
                <button onClick={salvarTeto}
                  style={{ padding: '7px 14px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Salvar
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{fmt(teto)}</div>
            )}
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
              Gasto em {MESES_F[mesAtivo]}: {fmt(saidMes)} — <span style={{ color: corTeto, fontWeight: 600 }}>{fmt(Math.max(0, teto - saidMes))} disponíveis</span>
            </div>
            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: Math.min(pcTeto, 100) + '%', background: corTeto, borderRadius: 3, transition: 'width .4s' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, background: bgTeto, color: corTeto }}>{badgeTeto}</span>
          </div>

          {/* Card Metas */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Metas de saldo</span>
              <span onClick={() => navigate('/metas')} style={{ fontSize: 11, color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>ver metas →</span>
            </div>
            {metas.map((m, i) => {
              const pct = Math.round(m.guardado / m.total * 100);
              return (
                <div key={i} style={{ marginBottom: i < metas.length - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {m.icone} {m.nome}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.cor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                    <div style={{ height: '100%', width: pct + '%', background: m.cor, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>R$ {m.guardado.toLocaleString('pt-BR')} / R$ {m.total.toLocaleString('pt-BR')}</div>
                </div>
              );
            })}
          </div>

          {/* Card Insights */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 10 }}>Insights do ano</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: ins.bgCor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={ins.cor}><path d={ins.icone}/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>{ins.titulo}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.4 }}>{ins.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linha 4 — Seletor de meses */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Selecione o mês</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{anoAtivo}</span>
          </div>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E9ECEF', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {MESES.map((m, i) => {
              const tem = mesesComDados[i];
              const futuro = !tem && i > MES_ATUAL;
              const active = i === mesAtivo;
              const pos = dados[i].sd >= 0;
              const color = active ? '#3B82F6' : !tem ? '#D1D5DB' : pos ? '#374151' : '#DC2626';
              return (
                <button key={i} onClick={() => !futuro && setMesAtivo(i)}
                  style={{
                    padding: '7px 12px', fontSize: 11, fontWeight: active ? 600 : 500,
                    cursor: futuro ? 'default' : 'pointer',
                    border: 'none', borderBottom: `2px solid ${active ? '#3B82F6' : 'transparent'}`,
                    color, background: 'transparent', outline: 'none',
                    whiteSpace: 'nowrap', flexShrink: 0, marginBottom: -1, opacity: futuro ? 0.4 : 1,
                  }}
                >
                  {i === melhorIdx && tem ? `★ ${m}` : m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha 5 — Card resumo do mês */}
        <div style={{ ...card, marginBottom: 14, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: positivoMes ? '#EFF6FF' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={positivoMes ? '#3B82F6' : '#EF4444'}>
                  <path d={positivoMes ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'} />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{MESES_F[mesAtivo]}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{anoAtivo}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 16,
              background: mesAtivo === melhorIdx ? '#EFF6FF' : positivoMes ? '#F0FDF4' : '#FEF2F2',
              color: mesAtivo === melhorIdx ? '#1D4ED8' : positivoMes ? '#166534' : '#991B1B' }}>
              {mesAtivo === melhorIdx ? 'Melhor mês ★' : mesAtivo === piorIdx ? 'Pior mês' : positivoMes ? '✓ Positivo' : '✗ Negativo'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #F8FAFC' }}>
            {[
              { lbl: 'Entradas', val: fmt(entrMes), cor: '#3B82F6' },
              { lbl: 'Saídas', val: fmt(saidMes), cor: '#EF4444' },
              { lbl: 'Saldo', val: (positivoMes ? '' : '-') + fmt(saldMes), cor: positivoMes ? '#16A34A' : '#EF4444' },
              { lbl: 'Maior gasto', val: maiorGasto.descricao || '—', cor: '#0F172A', sub: fmt(parseFloat(maiorGasto.valor || 0)), subCor: '#EF4444' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '14px 18px', borderRight: i < 3 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{m.lbl}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.cor, marginBottom: 2 }}>{m.val}</div>
                {m.sub && <div style={{ fontSize: 10, color: m.subCor }}>{m.sub}</div>}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 5 }}>
              <span>Entradas {fmt(entrMes)}</span>
              <span>Saídas {fmt(saidMes)}</span>
            </div>
            <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
              <div style={{ height: '100%', background: '#A5B4FC', borderRadius: 4, width: Math.round(entrMes / Math.max(entrMes, saidMes, 1) * 100) + '%', transition: 'width .4s' }} />
              <div style={{ height: '100%', background: '#FCA5A5', borderRadius: 4, width: Math.round(saidMes / Math.max(entrMes, saidMes, 1) * 100) + '%', transition: 'width .4s' }} />
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {[
              { lbl: (entrMes > 0 ? Math.round(saidMes / entrMes * 100) : 0) + '%', desc: 'da renda foi gasta', cor: '#3B82F6', bg: '#EFF6FF' },
              { lbl: catsMes[0]?.nome || '—', desc: 'maior categoria', cor: '#D97706', bg: '#FEF3C7' },
              { lbl: positivoMes ? 'Positivo ✓' : 'Negativo ✗', desc: 'resultado do mês', cor: positivoMes ? '#16A34A' : '#EF4444', bg: positivoMes ? '#DCFCE7' : '#FEE2E2' },
            ].map((ins, i) => (
              <div key={i} style={{ flex: 1, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: i < 2 ? '1px solid #F8FAFC' : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: ins.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ins.cor }} />
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{ins.lbl}</span>
                  <span style={{ color: '#94A3B8' }}> {ins.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linha 6 — Gráfico + Categorias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 12, marginBottom: 14 }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Fluxo {anoAtivo} — clique para selecionar mês</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['#A5B4FC','Entradas'],['#FCA5A5','Saídas'],['#3B82F6','Saldo','line']].map(([cor, lbl, tipo]) => (
                  <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748B' }}>
                    <span style={{ width: tipo === 'line' ? 12 : 8, height: tipo === 'line' ? 2 : 8, borderRadius: tipo === 'line' ? 1 : 2, background: cor, display: 'inline-block' }} />{lbl}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ height: 200 }}><canvas ref={fluxoRef} /></div>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Categorias — {MESES_F[mesAtivo]}</div>
            {catsMes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, padding: 20 }}>Sem dados de saídas neste mês</div>
            ) : catsMes.slice(0, 6).map((c, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: CORES_CAT[i] || '#CBD5E1', display: 'inline-block' }} />
                    {c.nome}
                  </span>
                  <span style={{ fontWeight: 600, color: CORES_CAT[i] || '#334155' }}>{c.pct}% · {fmt(c.val)}</span>
                </div>
                <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: c.pct + '%', background: CORES_CAT[i] || '#CBD5E1', borderRadius: 2 }} />
                </div>
              </div>
            ))}
            {catsMes.length > 0 && (
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                <span>Total saídas</span>
                <span style={{ fontWeight: 700, color: '#EF4444' }}>{fmt(saidMes)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Linha 7 — Tabela anual */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Tabela anual — {anoAtivo}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                {['Mês','Entradas','Saídas','Saldo','% Gasto','Teto (%)','Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MESES.map((m, i) => {
                const d = dados[i];
                const tem = mesesComDados[i];
                const pos = d.sd >= 0;
                const ativo = i === mesAtivo;
                const pctGasto = d.e > 0 ? Math.round(d.s / d.e * 100) : 0;
                const pctTeto = teto > 0 ? Math.round(d.s / teto * 100) : 0;
                const corPctTeto = pctTeto < 80 ? '#16A34A' : pctTeto <= 100 ? '#D97706' : '#EF4444';
                return (
                  <tr key={i} onClick={() => tem && setMesAtivo(i)}
                    style={{ borderBottom: '1px solid #F8FAFC', background: ativo ? '#EFF6FF' : 'white', cursor: tem ? 'pointer' : 'default', transition: 'background .1s' }}>
                    <td style={{ padding: '10px 16px', fontWeight: ativo ? 700 : 400, color: ativo ? '#1D4ED8' : '#334155' }}>
                      {m}{i === melhorIdx && tem ? ' ★' : ''}
                    </td>
                    <td style={{ padding: '10px 16px', color: tem ? '#3B82F6' : '#CBD5E1', fontWeight: 500 }}>{tem ? fmt(d.e) : '—'}</td>
                    <td style={{ padding: '10px 16px', color: tem ? '#EF4444' : '#CBD5E1', fontWeight: 500 }}>{tem ? fmt(d.s) : '—'}</td>
                    <td style={{ padding: '10px 16px', color: !tem ? '#CBD5E1' : pos ? '#16A34A' : '#EF4444', fontWeight: 600 }}>{tem ? (pos ? '+' : '-') + fmt(d.sd) : '—'}</td>
                    <td style={{ padding: '10px 16px', color: !tem ? '#CBD5E1' : pctGasto > 100 ? '#EF4444' : '#334155' }}>{tem ? pctGasto + '%' : '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {tem ? <span style={{ fontSize: 11, fontWeight: 600, color: corPctTeto }}>{pctTeto}%</span> : <span style={{ color: '#CBD5E1' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {!tem
                        ? <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#F1F5F9', color: '#94A3B8', fontWeight: 500 }}>Aguardando</span>
                        : pos
                          ? <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#DCFCE7', color: '#166534', fontWeight: 500 }}>Positivo</span>
                          : <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#FEE2E2', color: '#991B1B', fontWeight: 500 }}>Negativo</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}
