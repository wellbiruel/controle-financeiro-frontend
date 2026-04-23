import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';
import { Chart, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, BarController, LineController, DoughnutController } from 'chart.js';

Chart.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, BarController, LineController, DoughnutController);

const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ANO = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth();

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeUsuario = user.nome || user.email || 'Usuário';

  const [mesAtivo, setMesAtivo] = useState(MES_ATUAL);
  const [subtitulo, setSubtitulo] = useState(`${MESES_FULL[MES_ATUAL]} ${ANO} · ${nomeUsuario}`);
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fluxoRef = useRef(null);
  const fluxoChart = useRef(null);
  const pizzaRef = useRef(null);
  const pizzaChart = useRef(null);

  const metas = [
    { nome: 'Viagem de férias', icone: '✈️', bg: '#EEF2FF', cor: '#6366F1', guardado: 3400, total: 5000, aporte: 400, prazo: 'Dezembro 2026', status: 'No prazo' },
    { nome: 'Troca do carro', icone: '🚗', bg: '#F0FDF4', cor: '#16A34A', guardado: 4800, total: 15000, aporte: 600, prazo: 'Junho 2027', status: 'No prazo' },
    { nome: 'Reserva de emergência', icone: '🏠', bg: '#FFFBEB', cor: '#F59E0B', guardado: 1800, total: 12000, aporte: 200, prazo: 'Sem prazo', status: 'Ritmo lento' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lancRes, , transacoesRes] = await Promise.all([
          api.get(`/fluxo/lancamentos/${ANO}`),
          api.get('/fluxo/grupos'),
          api.get('/transacoes'),
        ]);

        // lancamentos_mensais não tem campo tipo — são todos saídas (itens de despesa)
        const lancamentos = (lancRes.data || []).map(l => ({ ...l, tipo: 'saida' }));

        // transacoes tem campo tipo ('entrada'/outro) e campo data (ex: "2026-04-15")
        // extrai mes e ano do campo data para manter padrão numérico igual ao /fluxo
        const transacoes = (transacoesRes.data || [])
          .filter(t => {
            const ano = parseInt((t.data || '').split('-')[0]);
            return ano === ANO;
          })
          .map(t => ({
            ...t,
            mes: parseInt((t.data || '').split('-')[1]),
            ano: parseInt((t.data || '').split('-')[0]),
          }));

        setLancamentos([...lancamentos, ...transacoes]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTotalMes = (mes, tipo) => {
    return lancamentos
      .filter(l => l.mes === mes + 1 && (tipo === 'entrada' ? l.tipo === 'entrada' : l.tipo !== 'entrada'))
      .reduce((sum, l) => sum + parseFloat(l.valor || 0), 0);
  };

  const getDadosMeses = () => MESES_SHORT.map((_, i) => ({
    e: getTotalMes(i, 'entrada'),
    s: getTotalMes(i, 'saida'),
    sd: getTotalMes(i, 'entrada') - getTotalMes(i, 'saida'),
  }));

  const dados = getDadosMeses();
  const melhorIdx = dados.reduce((best, d, i) => d.sd > (dados[best]?.sd || -Infinity) ? i : best, 0);
  const piorIdx = dados.reduce((worst, d, i) => d.sd < (dados[worst]?.sd || Infinity) ? i : worst, 0);
  const mesesComDados = dados.map(d => d.e > 0 || d.s > 0);

  const dAtivo = dados[mesAtivo] || { e: 0, s: 0, sd: 0 };
  const entradas = dAtivo.e;
  const saidas = dAtivo.s;
  const saldo = dAtivo.sd;
  const positivo = saldo >= 0;
  const taxaPoupanca = entradas > 0 ? Math.max(0, ((entradas - saidas) / entradas * 100)).toFixed(1) : '0.0';

  const getMaiorItem = () => {
    const doMes = lancamentos.filter(l => l.mes === mesAtivo + 1 && l.tipo !== 'entrada');
    if (!doMes.length) return { nome: '—', valor: 0 };
    const maior = doMes.reduce((a, b) => parseFloat(a.valor) > parseFloat(b.valor) ? a : b);
    return { nome: maior.descricao || maior.item || '—', valor: parseFloat(maior.valor) };
  };
  const maiorItem = getMaiorItem();

  const getCategorias = () => {
    const doMes = lancamentos.filter(l => l.mes === mesAtivo + 1 && l.tipo !== 'entrada');
    const cats = {};
    doMes.forEach(l => {
      const c = l.categoria || 'Outros';
      cats[c] = (cats[c] || 0) + parseFloat(l.valor || 0);
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    return sorted.map(([nome, val]) => ({ nome, val, pct: total > 0 ? Math.round(val / total * 100) : 0 }));
  };
  const categorias = getCategorias();
  const coresCat = ['#EF4444', '#60A5FA', '#34D399', '#CBD5E1', '#A78BFA', '#FB923C'];

  const getUltimasTransacoes = () => lancamentos
    .filter(l => l.mes === mesAtivo + 1)
    .sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor))
    .slice(0, 5);
  const ultimasTx = getUltimasTransacoes();

  const mediaMensal = () => {
    const comDados = dados.filter(d => d.e > 0 || d.s > 0);
    if (!comDados.length) return 0;
    return comDados.reduce((s, d) => s + d.sd, 0) / comDados.length;
  };

  const selMes = (i) => {
    if (!mesesComDados[i] && i > MES_ATUAL) return;
    setMesAtivo(i);
    setSubtitulo(`${MESES_FULL[i]} ${ANO} · ${nomeUsuario}`);
  };

  // Gráfico de barras
  useEffect(() => {
    if (!fluxoRef.current || loading) return;
    if (fluxoChart.current) fluxoChart.current.destroy();
    fluxoChart.current = new Chart(fluxoRef.current, {
      data: {
        labels: [MESES_FULL[mesAtivo]],
        datasets: [
          { type: 'bar', label: 'Entradas', data: [entradas], backgroundColor: '#A5B4FC', borderRadius: 6, borderSkipped: false, barPercentage: 0.35, categoryPercentage: 0.4 },
          { type: 'bar', label: 'Saídas', data: [saidas], backgroundColor: '#FCA5A5', borderRadius: 6, borderSkipped: false, barPercentage: 0.35, categoryPercentage: 0.4 },
          { type: 'line', label: 'Saldo', data: [saldo], borderColor: positivo ? '#16A34A' : '#EF4444', backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: positivo ? '#16A34A' : '#EF4444', tension: 0, yAxisID: 'y2' },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' }, border: { display: false } },
          y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, color: '#94A3B8', callback: v => 'R$' + (v / 1000).toFixed(0) + 'k' }, border: { display: false } },
          y2: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, color: positivo ? '#16A34A' : '#EF4444', callback: v => (v >= 0 ? '+' : '') + 'R$' + (v / 1000).toFixed(1) + 'k' }, border: { display: false } },
        },
      }
    });
    return () => { if (fluxoChart.current) fluxoChart.current.destroy(); };
  }, [mesAtivo, lancamentos, loading]);

  // Gráfico de pizza
  useEffect(() => {
    if (!pizzaRef.current || loading) return;
    if (pizzaChart.current) pizzaChart.current.destroy();
    const labels = categorias.length ? categorias.map(c => c.nome) : ['Sem dados'];
    const dataVals = categorias.length ? categorias.map(c => c.pct) : [100];
    const cores = categorias.length ? categorias.map((_, i) => coresCat[i] || '#CBD5E1') : ['#F1F5F9'];
    pizzaChart.current = new Chart(pizzaRef.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: dataVals, backgroundColor: cores, borderWidth: 2, borderColor: 'white', hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } }
    });
    return () => { if (pizzaChart.current) pizzaChart.current.destroy(); };
  }, [mesAtivo, lancamentos, loading]);

  const fmt = v => 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const card = (extra = {}) => ({ background: 'white', borderRadius: 12, border: '1px solid #F1F5F9', padding: '16px 18px', ...extra });

  if (loading) return <Layout><div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Carregando...</div></Layout>;

  return (
    <Layout>
      <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto', background: '#F8F9FC', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#0F172A' }}>Visão Mensal</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>{subtitulo}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>Exportar</button>
            <button style={{ background: '#6366F1', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, color: 'white', cursor: 'pointer', fontWeight: 500 }}>+ Lançamento</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
          {/* Entradas */}
          <div style={{ ...card(), position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#6366F1', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: '#EEF2FF', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#4338CA"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#F1F5F9', color: '#64748B' }}>= estável</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(entradas)}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Entradas do mês</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Salário + extras</div>
          </div>
          {/* Saídas */}
          <div style={{ ...card(), position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: '#FEF2F2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#DCFCE7', color: '#166534' }}>Cartões lideram</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(saidas)}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Saídas do mês</div>
          </div>
          {/* Saldo */}
          <div style={{ ...card(), position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: positivo ? '#16A34A' : '#EF4444', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: positivo ? '#F0FDF4' : '#FEF2F2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={positivo ? '#16A34A' : '#DC2626'}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: positivo ? '#DCFCE7' : '#FEE2E2', color: positivo ? '#166534' : '#991B1B' }}>{mesAtivo === melhorIdx ? 'melhor mês ★' : mesAtivo === piorIdx ? 'pior mês' : positivo ? 'positivo' : 'negativo'}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: positivo ? '#16A34A' : '#EF4444', letterSpacing: '-.5px', marginBottom: 2 }}>{(saldo < 0 ? '-' : '') + fmt(saldo)}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Saldo do mês</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{taxaPoupanca}% da renda guardada</div>
          </div>
          {/* Cartões */}
          <div style={{ ...card(), position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: '#FEF2F2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#DC2626"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2zm-7 7h5v-2h-5v2z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#FEE2E2', color: '#991B1B' }}>maior gasto</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-.5px', marginBottom: 2 }}>{fmt(maiorItem.valor)}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Fatura cartões</div>
            <div style={{ fontSize: 11, color: '#991B1B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#DC2626"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              {maiorItem.nome} · {fmt(maiorItem.valor)}
            </div>
          </div>
        </div>

        {/* Seletor de meses */}
        <div style={{background:'white',borderRadius:14,border:'1px solid #F1F5F9',padding:'20px 24px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontSize:13,fontWeight:600,color:'#334155'}}>Selecione o mês</span>
            <span style={{fontSize:12,color:'#94A3B8',fontWeight:500}}>{ANO}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
            {MESES_SHORT.map((m,i)=>{
              const d=dados[i];
              const temDados=mesesComDados[i];
              const futuro=!temDados&&i>MES_ATUAL;
              const pos=d&&d.sd>=0;
              const ativo=i===mesAtivo;
              return(
                <div key={i} onClick={()=>selMes(i)}
                  style={{borderRadius:10,padding:'10px 6px 8px',cursor:futuro?'default':'pointer',textAlign:'center',
                    border:ativo?'none':`1.5px solid ${!temDados?'#F1F5F9':i===melhorIdx?'#16A34A':i===piorIdx?'#EF4444':pos?'#86EFAC':'#FCA5A5'}`,
                    background:ativo?'#6366F1':'white',opacity:futuro?0.4:1,transition:'all .15s',position:'relative'}}>
                  {i===melhorIdx&&temDados&&<span style={{position:'absolute',top:3,right:5,fontSize:9,color:ativo?'white':'#16A34A'}}>★</span>}
                  <span style={{fontSize:11,fontWeight:600,display:'block',marginBottom:4,
                    color:ativo?'white':!temDados?'#CBD5E1':pos?'#166534':'#991B1B'}}>{m}</span>
                  <span style={{display:'inline-block',fontSize:9,padding:'1px 6px',borderRadius:8,fontWeight:600,
                    background:ativo?'rgba(255,255,255,.2)':!temDados?'#F1F5F9':pos?'#DCFCE7':'#FEE2E2',
                    color:ativo?'white':!temDados?'#CBD5E1':pos?'#166534':'#991B1B'}}>
                    {temDados?(pos?'+':'')+((d.sd/1000).toFixed(1))+'k':'—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card resumo do mês */}
        <div style={{background:'white',borderRadius:14,border:'1px solid #F1F5F9',overflow:'hidden',marginBottom:14}}>
          {/* Header */}
          <div style={{padding:'16px 22px 14px',borderBottom:'1px solid #F8FAFC',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,background:positivo?'#EEF2FF':'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={positivo?'#6366F1':'#EF4444'}>
                  <path d={positivo?'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z':'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'}/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#0F172A'}}>{MESES_FULL[mesAtivo]}</div>
                <div style={{fontSize:12,color:'#94A3B8'}}>{ANO}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,
              background:mesAtivo===melhorIdx?'#EEF2FF':positivo?'#F0FDF4':'#FEF2F2',
              color:mesAtivo===melhorIdx?'#4338CA':positivo?'#166534':'#991B1B'}}>
              {mesAtivo===melhorIdx?'Melhor mês do ano ★':positivo?'✓ Mês positivo':'✗ Mês negativo'}
            </div>
          </div>

          {/* Métricas */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottom:'1px solid #F8FAFC'}}>
            {[
              {lbl:'Entradas',val:fmt(entradas),cor:'#6366F1',sub:'= estável',subCor:'#94A3B8'},
              {lbl:'Saídas',val:fmt(saidas),cor:'#EF4444',sub:'Cartões lideram',subCor:'#94A3B8'},
              {lbl:'Saldo',val:(positivo?'':'-')+fmt(saldo),cor:positivo?'#16A34A':'#EF4444',sub:taxaPoupanca+'% da renda guardada',subCor:'#94A3B8'},
              {lbl:'Maior gasto',val:maiorItem.nome,cor:'#0F172A',valSize:15,sub:fmt(maiorItem.valor)+' — cartões',subCor:'#EF4444'},
            ].map((m,i)=>(
              <div key={i} style={{padding:'16px 22px',borderRight:i<3?'1px solid #F8FAFC':'none'}}>
                <div style={{fontSize:10,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:5}}>{m.lbl}</div>
                <div style={{fontSize:m.valSize||18,fontWeight:700,color:m.cor,marginBottom:3,letterSpacing:'-.3px'}}>{m.val}</div>
                <div style={{fontSize:10,color:m.subCor}}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Barra visual entrada vs saída */}
          <div style={{padding:'14px 22px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748B',marginBottom:6}}>
              <span>Entradas {fmt(entradas)}</span>
              <span>Saídas {fmt(saidas)}</span>
            </div>
            <div style={{display:'flex',height:8,borderRadius:4,overflow:'hidden',gap:2}}>
              <div style={{height:'100%',background:'#A5B4FC',borderRadius:4,width:Math.round(entradas/Math.max(entradas,saidas,1)*100)+'%',transition:'width .4s'}}></div>
              <div style={{height:'100%',background:'#FCA5A5',borderRadius:4,width:Math.round(saidas/Math.max(entradas,saidas,1)*100)+'%',transition:'width .4s'}}></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94A3B8',marginTop:5}}>
              <span>R$ 0</span>
              <span>{fmt(Math.max(entradas,saidas))}</span>
            </div>
          </div>

          {/* Insights inline */}
          <div style={{display:'flex',borderTop:'1px solid #F8FAFC'}}>
            {[
              {bg:'#EEF2FF',iconCor:'#6366F1',path:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',bold:(entradas>0?Math.round(saidas/entradas*100):0)+'%',txt:'da renda foi gasta'},
              {bg:'#FEF3C7',iconCor:'#D97706',path:'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2zm-7 7h5v-2h-5v2z',bold:categorias[0]?.nome||'—',txt:'maior categoria de gastos'},
              {bg:positivo?'#DCFCE7':'#FEE2E2',iconCor:positivo?'#16A34A':'#EF4444',path:positivo?'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z':'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',bold:mesAtivo===melhorIdx?'Melhor mês ★':positivo?'Positivo ✓':'Negativo ✗',txt:'resultado do mês'},
              {bg:'#EEF2FF',iconCor:'#4338CA',path:'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z',bold:fmt(mediaMensal()),txt:'média mensal guardada'},
            ].map((ins,i)=>(
              <div key={i} style={{flex:1,padding:'12px 16px',display:'flex',alignItems:'center',gap:8,borderRight:i<3?'1px solid #F8FAFC':'none'}}>
                <div style={{width:26,height:26,borderRadius:7,background:ins.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={ins.iconCor}><path d={ins.path}/></svg>
                </div>
                <div style={{fontSize:11,color:'#64748B',lineHeight:1.4}}>
                  <span style={{fontWeight:600,color:'#334155'}}>{ins.bold}</span><br/>{ins.txt}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,320px)', gap: 14, marginBottom: 14 }}>
          {/* Fluxo */}
          <div style={{ ...card() }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Fluxo — {MESES_FULL[mesAtivo]}</span>
              <span style={{ fontSize: 10, color: '#6366F1', cursor: 'pointer' }} onClick={() => navigate('/fluxo')}>ver fluxo →</span>
            </div>
            <div style={{ position: 'relative', height: 160 }}><canvas ref={fluxoRef}></canvas></div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              {[['#A5B4FC','Entradas'],['#FCA5A5','Saídas'],['#16A34A','Saldo','line']].map(([cor, lbl, tipo]) => (
                <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B' }}>
                  <span style={{ width: tipo === 'line' ? 14 : 10, height: tipo === 'line' ? 2 : 10, borderRadius: tipo === 'line' ? 1 : 2, background: cor, display: 'inline-block' }}></span>{lbl}
                </span>
              ))}
            </div>
          </div>
          {/* Pizza */}
          <div style={{ ...card() }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Gastos por categoria</span>
              <span style={{ fontSize: 10, color: '#6366F1', cursor: 'pointer' }} onClick={() => navigate('/relatorios')}>ver relatórios →</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 130, height: 130, flexShrink: 0 }}><canvas ref={pizzaRef}></canvas></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(categorias.length ? categorias.slice(0, 4) : [{ nome: 'Sem dados', pct: 100, val: 0 }]).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: coresCat[i] || '#CBD5E1', display: 'inline-block' }}></span>
                      {c.nome}
                    </span>
                    <span style={{ fontWeight: 600, color: i === 0 ? coresCat[0] : '#0F172A' }}>{c.pct}%</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 6, marginTop: 2, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B' }}>
                  <span>Total saídas</span><span style={{ fontWeight: 600, color: '#EF4444' }}>{fmt(saidas)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Saúde */}
          <div style={{ ...card() }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 14 }}>Saúde financeira</div>
            {[
              { lbl: 'Taxa de poupança', val: taxaPoupanca + '%', pct: parseFloat(taxaPoupanca), cor: parseFloat(taxaPoupanca) > 20 ? '#16A34A' : parseFloat(taxaPoupanca) > 5 ? '#F59E0B' : '#EF4444', note: 'Meta: 20% da renda' },
              { lbl: 'Controle de gastos', val: '68%', pct: 68, cor: '#F59E0B', note: 'Cartões ainda elevados' },
              { lbl: 'Progresso das metas', val: '31%', pct: 31, cor: '#6366F1', note: '3 metas em andamento' },
            ].map((sf, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#64748B' }}>{sf.lbl}</span>
                  <span style={{ fontWeight: 600, color: sf.cor }}>{sf.val}</span>
                </div>
                <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.min(sf.pct, 100) + '%', background: sf.cor, borderRadius: 3 }}></div>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sf.note}</div>
              </div>
            ))}
            <div style={{ background: positivo ? '#F0FDF4' : '#FEF2F2', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={positivo ? '#16A34A' : '#EF4444'}><path d={positivo ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'}/></svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: positivo ? '#166534' : '#991B1B' }}>{positivo ? 'Mês fechado no positivo!' : 'Mês fechado no negativo.'}</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
          {[
            { bg: '#FEE2E2', iconBg: '#DC2626', path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', title: 'Atenção nos gastos', sub: `Suas saídas somam ${fmt(saidas)} em ${MESES_FULL[mesAtivo]}.` },
            { bg: '#DCFCE7', iconBg: '#16A34A', path: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z', title: 'Tendência positiva', sub: positivo ? `Saldo positivo de ${fmt(saldo)}. Continue assim!` : 'Fique atento ao saldo negativo.' },
            { bg: '#EEF2FF', iconBg: '#4338CA', path: 'M19.07 4.93l-1.41 1.41A8.014 8.014 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.48 8.64 6 10.17 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6a5.99 5.99 0 0 0-1.76-4.24l-1.41 1.41A3.977 3.977 0 0 1 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z', title: 'Meta mais próxima', sub: `Viagem: 68% concluída. Faltam R$ 1.600.` },
          ].map((ins, i) => (
            <div key={i} style={{ ...card(), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: ins.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={ins.iconBg}><path d={ins.path}/></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 3 }}>{ins.title}</div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{ins.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Metas + Transações */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }}>
          {/* Metas */}
          <div style={{ ...card() }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Metas em andamento</span>
              <span style={{ fontSize: 10, color: '#6366F1', cursor: 'pointer' }} onClick={() => navigate('/metas')}>ver metas →</span>
            </div>
            {metas.map((m, i) => {
              const pct = Math.round(m.guardado / m.total * 100);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < metas.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{m.icone}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{m.nome}</div>
                    <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: m.cor, borderRadius: 2 }}></div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.cor }}>{pct}%</div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>falta {fmt(m.total - m.guardado)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Transações */}
          <div style={{ ...card() }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Últimas transações</span>
              <span style={{ fontSize: 10, color: '#6366F1', cursor: 'pointer' }} onClick={() => navigate('/saidas')}>ver todas →</span>
            </div>
            {ultimasTx.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, padding: 20 }}>Nenhuma transação neste mês</div>
            ) : ultimasTx.map((tx, i) => {
              const entrada = tx.tipo === 'entrada';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < ultimasTx.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: entrada ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={entrada ? '#059669' : '#DC2626'}><path d={entrada ? 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z' : 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z'}/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{tx.descricao || tx.item || '—'}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{tx.categoria || (entrada ? 'Entrada' : 'Saída')} · {MESES_SHORT[mesAtivo]}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: entrada ? '#16A34A' : '#EF4444', whiteSpace: 'nowrap' }}>
                    {entrada ? '+' : '-'}{fmt(parseFloat(tx.valor))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
