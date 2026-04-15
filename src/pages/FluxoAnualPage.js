import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const GRUPOS_PADRAO = [
  { nome: 'Mercado',  itens: ['Mais Amigo','Cooper','Pix'] },
  { nome: 'Cartões',  itens: ['C6','Pic Pay','Nubank Amanda','Nubank Well'] },
  { nome: 'Casa',     itens: ['Água','Luz','Internet','Imposto','Gás'] },
  { nome: 'Carro',    itens: ['Gasolina','Oficina','Multas','IPVA'] },
  { nome: 'Outros',   itens: ['Tim','Pós Graduação'] },
];

const PERIODOS = [
  { label: `Mês atual (${MESES_FULL[new Date().getMonth()]})`, meses: [new Date().getMonth()] },
  { label: 'Últimos 3 meses', meses: Array.from({length:3},(_,i)=>(new Date().getMonth()-2+i+12)%12) },
  { label: 'Últimos 6 meses', meses: Array.from({length:6},(_,i)=>(new Date().getMonth()-5+i+12)%12) },
  { label: 'Anual (Jan–Dez)', meses: Array.from({length:12},(_,i)=>i) },
];

const inp = { padding:'4px 7px', fontSize:'11px', border:'1px solid #E0E0E0', borderRadius:'3px', outline:'none', background:'white', color:'#333' };

const ArrUp   = ({c='#E64A19'}) => <span style={{display:'inline-block',width:0,height:0,borderLeft:'3px solid transparent',borderRight:'3px solid transparent',borderBottom:`4px solid ${c}`}}></span>;
const ArrDown = ({c='#388E3C'}) => <span style={{display:'inline-block',width:0,height:0,borderLeft:'3px solid transparent',borderRight:'3px solid transparent',borderTop:`4px solid ${c}`}}></span>;
const ArrNeu  = () => <span style={{display:'inline-block',width:0,height:0,borderLeft:'3px solid transparent',borderRight:'3px solid transparent',borderBottom:'4px solid #BDBDBD'}}></span>;

function Ind({ atual, anterior }) {
  if (atual === null) return null;
  if (anterior === null) return <span style={{display:'inline-flex',alignItems:'center'}}><ArrNeu/></span>;
  const pct = ((atual - anterior) / anterior) * 100;
  if (Math.abs(pct) < 0.01) return <span style={{fontSize:'8px',color:'#9E9E9E'}}>=0%</span>;
  const up = pct > 0;
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:'2px',fontSize:'8px',color:up?'#E64A19':'#388E3C'}}>
      {up ? <ArrUp/> : <ArrDown/>}{up?'+':''}{pct.toFixed(1)}%
    </span>
  );
}

function GraficoOndas({ entradas, saidas }) {
  const maxVal = Math.max(...entradas.filter(v=>v>0), ...saidas.filter(v=>v>0), 8000);
  const saldos = MESES.map((_,i) => entradas[i]>0||saidas[i]>0 ? entradas[i]-saidas[i] : null);
  const maxSaldo = Math.max(...saldos.filter(v=>v!==null).map(Math.abs), 1000);

  const toY = (val) => 20 + 120 - (val/maxVal)*120;
  const toSY = (val) => 128 - (val/maxSaldo)*55;

  const pontosE = MESES.map((_,i) => entradas[i]>0 ? {x:42+i*54,y:toY(entradas[i])} : null).filter(Boolean);
  const pontosS = MESES.map((_,i) => saidas[i]>0   ? {x:42+i*54,y:toY(saidas[i])}   : null).filter(Boolean);
  const pontosSaldo = MESES.map((_,i) => saldos[i]!==null ? {x:42+i*54,y:toSY(saldos[i]),v:saldos[i],idx:i} : null).filter(Boolean);

  const curva = pts => pts.map((p,i) => {
    if (i===0) return `M${p.x},${p.y}`;
    const pr = pts[i-1], cx = (pr.x+p.x)/2;
    return `C${cx},${pr.y} ${cx},${p.y} ${p.x},${p.y}`;
  }).join(' ');

  const melhor = pontosSaldo.reduce((b,p) => p.v > (b?.v??-Infinity) ? p : b, null);
  const pior   = pontosSaldo.reduce((b,p) => p.v < (b?.v??Infinity)  ? p : b, null);

  return (
    <svg viewBox="0 0 680 175" width="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.12"/><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01"/></linearGradient>
        <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity="0.1"/><stop offset="100%" stopColor="#EF4444" stopOpacity="0.01"/></linearGradient>
        <linearGradient id="gSaldo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity="0.12"/><stop offset="100%" stopColor="#16A34A" stopOpacity="0.01"/></linearGradient>
      </defs>
      {[20,55,90,128].map(y=><line key={y} x1="40" y1={y} x2="660" y2={y} stroke={y===128?"#E2E8F0":"#F5F5F5"} strokeWidth="1" strokeDasharray={y===128?"4,3":undefined}/>)}
      {[[8,'#BDBDBD'],[7,'#BDBDBD'],[6,'#BDBDBD']].map(([v,c],i)=>(
        <text key={v} x="36" y={20+i*35} textAnchor="end" fontSize="7.5" fill={c}>{v}k</text>
      ))}
      <text x="666" y="78" textAnchor="start" fontSize="7.5" fill="#16A34A">+{(maxSaldo/1000).toFixed(0)}k</text>
      <text x="666" y="130" textAnchor="start" fontSize="7.5" fill="#9E9E9E">0</text>
      <text x="666" y="155" textAnchor="start" fontSize="7.5" fill="#EE4D2D">-{(maxSaldo/1000*0.5).toFixed(0)}k</text>
      {pontosE.length>1 && <path d={curva(pontosE)+` L${pontosE.at(-1).x},155 L${pontosE[0].x},155 Z`} fill="url(#gE)"/>}
      {pontosS.length>1 && <path d={curva(pontosS)+` L${pontosS.at(-1).x},155 L${pontosS[0].x},155 Z`} fill="url(#gS)"/>}
      {pontosSaldo.length>1 && <path d={curva(pontosSaldo)+` L${pontosSaldo.at(-1).x},128 L${pontosSaldo[0].x},128 Z`} fill="url(#gSaldo)" opacity="0.7"/>}
      {pontosE.length>1 && <path d={curva(pontosE)} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>}
      {pontosS.length>1 && <path d={curva(pontosS)} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>}
      {pontosSaldo.length>1 && <path d={curva(pontosSaldo)} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"/>}
      {pontosSaldo.length>0 && (
        <path d={`M${pontosSaldo.at(-1).x},${pontosSaldo.at(-1).y} C${pontosSaldo.at(-1).x+40},${pontosSaldo.at(-1).y} ${pontosSaldo.at(-1).x+80},${pontosSaldo.at(-1).y-10} 660,${pontosSaldo.at(-1).y-15}`}
          fill="none" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.35"/>
      )}
      {pontosE.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#3B82F6" strokeWidth="1.5"/>)}
      {pontosS.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#EF4444" strokeWidth="1.5"/>)}
      {pontosSaldo.map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r={p===melhor||p===pior?4:3}
          fill={p===melhor?'#16A34A':p===pior&&p.v<0?'#EF4444':'white'}
          stroke={p===pior&&p.v<0?'#EF4444':'#16A34A'} strokeWidth="1.5"/>
      ))}
      {melhor && melhor.v > 0 && (
        <>
          <rect x={melhor.x-40} y={melhor.y-24} width="80" height="20" rx="3" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="0.5"/>
          <text x={melhor.x} y={melhor.y-14} textAnchor="middle" fontSize="7" fill="#166534" fontWeight="600">{MESES[melhor.idx]} · melhor</text>
          <text x={melhor.x} y={melhor.y-6} textAnchor="middle" fontSize="7" fill="#166534">+R$ {melhor.v.toLocaleString('pt-BR')}</text>
        </>
      )}
      {pior && pior.v < 0 && (
        <>
          <rect x={pior.x-40} y={pior.y+5} width="80" height="20" rx="3" fill="#FEF2F2" stroke="#FECACA" strokeWidth="0.5"/>
          <text x={pior.x} y={pior.y+15} textAnchor="middle" fontSize="7" fill="#991B1B" fontWeight="600">{MESES[pior.idx]} · negativo</text>
          <text x={pior.x} y={pior.y+22} textAnchor="middle" fontSize="7" fill="#991B1B">R$ {pior.v.toLocaleString('pt-BR')}</text>
        </>
      )}
      {MESES.map((m,i)=>(
        <text key={i} x={42+i*54} y="170" textAnchor="middle" fontSize="8"
          fill={pontosSaldo.find(p=>p.idx===i)?.v===melhor?.v&&melhor?.v>0?'#16A34A':pontosSaldo.find(p=>p.idx===i)?.v===pior?.v&&pior?.v<0?'#EE4D2D':saldos[i]===null?'#BDBDBD':'#9E9E9E'}
          fontWeight={pontosSaldo.find(p=>p.idx===i)?'500':'400'}>
          {m}
        </text>
      ))}
    </svg>
  );
}

export default function FluxoAnualPage() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [grupos, setGrupos] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState(0);
  const [editGrupo, setEditGrupo] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [showNovoGrupo, setShowNovoGrupo] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemGrupo, setNovoItemGrupo] = useState(null);
  const [periodoIdx, setPeriodoIdx] = useState(1);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [filtroSaldo, setFiltroSaldo] = useState('todos');
  const [showFiltroSaldo, setShowFiltroSaldo] = useState(false);
  const [ordenacao, setOrdenacao] = useState('arrastar');
  const [showOrdenacao, setShowOrdenacao] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const periodoRef = useRef(); const saldoRef = useRef(); const ordRef = useRef();

  const mesesVisiveis = PERIODOS[periodoIdx].meses;

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, lRes] = await Promise.all([api.get('/fluxo/grupos'), api.get(`/fluxo/lancamentos/${ano}`)]);
      setGrupos(gRes.data); setLancamentos(lRes.data);
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [ano]);

  useEffect(()=>{ carregar(); },[carregar]);
  useEffect(()=>{
    const h = e => {
      if(periodoRef.current&&!periodoRef.current.contains(e.target)) setShowPeriodo(false);
      if(saldoRef.current&&!saldoRef.current.contains(e.target)) setShowFiltroSaldo(false);
      if(ordRef.current&&!ordRef.current.contains(e.target)) setShowOrdenacao(false);
    };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[]);

  const getValor = (itemId, mesIdx) => {
    const l = lancamentos.find(l=>String(l.item_id)===String(itemId)&&l.mes===mesIdx+1&&l.ano===ano);
    return l ? parseFloat(l.valor) : null;
  };

  const salvarValor = async (itemId, mesIdx, raw) => {
    const v = parseFloat(raw);
    if(isNaN(v)||raw==='') return;
    await api.post('/fluxo/lancamentos',{item_id:itemId,mes:mesIdx+1,ano,valor:v});
    setLancamentos(prev=>[...prev.filter(l=>!(String(l.item_id)===String(itemId)&&l.mes===mesIdx+1&&l.ano===ano)),{item_id:itemId,mes:mesIdx+1,ano,valor:v}]);
  };

  const totalGrupoMes = (grupo, mesIdx) => (grupo.itens||[]).reduce((acc,item)=>acc+(getValor(item.id,mesIdx)||0),0);
  const totalEntradas = mesIdx => {
    const todos = grupos.flatMap(g=>g.itens||[]);
    return lancamentos.filter(l=>l.mes===mesIdx+1&&l.ano===ano).filter(l=>todos.find(i=>String(i.id)===String(l.item_id)&&i.tipo==='entrada')).reduce((acc,l)=>acc+parseFloat(l.valor),0);
  };
  const totalSaidas = mesIdx => {
    const todos = grupos.flatMap(g=>g.itens||[]);
    return lancamentos.filter(l=>l.mes===mesIdx+1&&l.ano===ano).filter(l=>{const item=todos.find(i=>String(i.id)===String(l.item_id));return item&&item.tipo!=='entrada';}).reduce((acc,l)=>acc+parseFloat(l.valor),0);
  };
  const saldoPct = mesIdx => { const e=totalEntradas(mesIdx),s=totalSaidas(mesIdx); return e>0?((e-s)/e)*100:null; };

  const entradasAnuais = MESES.map((_,i)=>totalEntradas(i));
  const saidasAnuais   = MESES.map((_,i)=>totalSaidas(i));
  const saldosAnuais   = MESES.map((_,i)=>entradasAnuais[i]-saidasAnuais[i]);
  const totalAnoEntradas = entradasAnuais.reduce((a,v)=>a+v,0);
  const totalAnoSaidas   = saidasAnuais.reduce((a,v)=>a+v,0);
  const mesesComDados = MESES.filter((_,i)=>entradasAnuais[i]>0||saidasAnuais[i]>0);
  const melhorMesIdx = entradasAnuais.reduce((b,_,i)=>entradasAnuais[i]>0&&saldosAnuais[i]>saldosAnuais[b]?i:b,0);
  const piorMesIdx   = entradasAnuais.reduce((b,_,i)=>entradasAnuais[i]>0&&saldosAnuais[i]<saldosAnuais[b]?i:b,0);
  const maiorEntradaIdx = entradasAnuais.reduce((b,_,i)=>entradasAnuais[i]>entradasAnuais[b]?i:b,0);
  const maiorSaidaIdx   = saidasAnuais.reduce((b,_,i)=>saidasAnuais[i]>saidasAnuais[b]?i:b,0);
  const mesesNegativos  = MESES.filter((_,i)=>entradasAnuais[i]>0&&saldosAnuais[i]<0).length;

  const mesesFiltrados = () => {
    if(filtroSaldo==='todos') return mesesVisiveis;
    return mesesVisiveis.filter(i=>{
      const s=totalEntradas(i)-totalSaidas(i);
      if(filtroSaldo==='positivos') return s>=0&&(totalEntradas(i)>0||totalSaidas(i)>0);
      return s<0;
    });
  };
  const mesesFinal = mesesFiltrados();

  const gruposOrdenados = () => {
    if(ordenacao==='az') return [...grupos].sort((a,b)=>a.nome.localeCompare(b.nome));
    if(ordenacao==='maior') return [...grupos].sort((a,b)=>mesesFinal.reduce((acc,m)=>acc+totalGrupoMes(b,m),0)-mesesFinal.reduce((acc,m)=>acc+totalGrupoMes(a,m),0));
    return grupos;
  };

  const chipsAba1 = () => {
    const chips = [];
    mesesVisiveis.forEach(i=>{
      if(totalEntradas(i)>0&&totalEntradas(i)-totalSaidas(i)<0) chips.push({l:`${MESES[i]} fechou negativo`,t:'r'});
    });
    grupos.forEach(g=>{
      mesesFinal.forEach((m,mi)=>{
        if(mi===0) return;
        const t=totalGrupoMes(g,m),tp=totalGrupoMes(g,mesesFinal[mi-1]);
        if(tp>0&&t>0){
          const pct=((t-tp)/tp)*100;
          if(pct>25) chips.push({l:`${g.nome} ↑${pct.toFixed(0)}% em ${MESES[m]}`,t:'w'});
          if(pct<-20) chips.push({l:`${g.nome} ↓${Math.abs(pct).toFixed(0)}% em ${MESES[m]}`,t:'g'});
        }
      });
    });
    const saldoP=mesesVisiveis.reduce((acc,i)=>acc+(totalEntradas(i)-totalSaidas(i)),0);
    if(saldoP>0) chips.push({l:`Saldo +R$ ${saldoP.toFixed(0)} no período`,t:'g'});
    return chips.slice(0,6);
  };

  const chipsAba2 = () => {
    const chips = [];
    if(mesesNegativos>0) chips.push({l:`${mesesNegativos} mês(es) negativo(s)`,t:'r'});
    if(mesesComDados.length>=2){
      const ul=saidasAnuais[saidasAnuais.map((v,i)=>entradasAnuais[i]>0?v:-1).reduce((b,v,i,a)=>v>a[b]?i:b,0)];
      if(ul>0) chips.push({l:`Maior saída: R$ ${ul.toFixed(0)}`,t:'w'});
    }
    if(totalAnoEntradas>0) chips.push({l:'Entradas estáveis',t:'g'});
    const media=(totalAnoEntradas-totalAnoSaidas)/Math.max(mesesComDados.length,1)*12;
    if(media>0) chips.push({l:`Projeção: +R$ ${media.toFixed(0)}/ano`,t:'b'});
    return chips;
  };

  const insightGrupo = (grupo) => {
    if(mesesFinal.length<2) return null;
    let txt='', dot='#9E9E9E';
    const totais = mesesFinal.map(m=>totalGrupoMes(grupo,m));
    const temDados = totais.some(v=>v>0);
    if(!temDados) return {txt:'Nenhum gasto registrado no período. Adicione lançamentos para ver a análise.',dot:'#9E9E9E'};
    const primeiro=totais.find(v=>v>0)||0;
    const ultimo=totais.filter(v=>v>0).at(-1)||0;
    const variacao=primeiro>0?((ultimo-primeiro)/primeiro)*100:0;
    if(variacao<-15){
      txt=`Tendência de queda no período (${variacao.toFixed(0)}%). Boa gestão!`;
      dot='#22C55E';
    }
    else if(variacao>15){
      txt=`Tendência de alta no período (+${variacao.toFixed(0)}%). Monitorar próximo mês.`;
      dot='#F59E0B';
    }
    else {
      txt='Gasto estável no período — sem variações significativas.';
      dot='#9E9E9E';
    }
    let badge=null;
    mesesFinal.forEach((m,mi)=>{
      if(mi===0) return;
      const t=totalGrupoMes(grupo,m),tp=totalGrupoMes(grupo,mesesFinal[mi-1]);
      if(tp>0&&t>0){
        const pct=((t-tp)/tp)*100;
        if(pct>25&&!badge) badge={l:`↑${pct.toFixed(0)}% em ${MESES[m]}`,t:'w'};
        if(pct<-20&&!badge) badge={l:`↓${Math.abs(pct).toFixed(0)}% em ${MESES[m]}`,t:'g'};
      }
    });
    return {txt,dot,badge};
  };

  const insightResumo = () => {
    const saldoPeriodo=mesesVisiveis.reduce((acc,i)=>acc+(totalEntradas(i)-totalSaidas(i)),0);
    const tendencia=mesesVisiveis.length>=2;
    if(!tendencia||totalAnoSaidas===0) return null;
    const linhas=[];
    if(saldoPeriodo>0) linhas.push(`Saldo acumulado positivo no período: +R$ ${saldoPeriodo.toFixed(2)}.`);
    const cartoes=grupos.find(g=>g.nome.toLowerCase().includes('cart'));
    if(cartoes){
      const pct=mesesFinal.reduce((a,m)=>a+totalGrupoMes(cartoes,m),0)/Math.max(mesesFinal.reduce((a,m)=>a+totalSaidas(m),0),1)*100;
      if(pct>50) linhas.push(`Cartões representam ${pct.toFixed(0)}% das saídas — considere definir um teto mensal.`);
    }
    return linhas.join(' ');
  };

  const adicionarGrupo = async()=>{if(!novoGrupoNome.trim())return;await api.post('/fluxo/grupos',{nome:novoGrupoNome});setNovoGrupoNome('');setShowNovoGrupo(false);carregar();};
  const renomearGrupo = async(id)=>{if(!editGrupo?.nome.trim())return;await api.put(`/fluxo/grupos/${id}`,{nome:editGrupo.nome});setEditGrupo(null);carregar();};
  const excluirGrupo  = async(id)=>{if(!window.confirm('Excluir grupo e todos os itens?'))return;await api.delete(`/fluxo/grupos/${id}`);carregar();};
  const adicionarItem = async(gId)=>{if(!novoItemNome.trim())return;await api.post('/fluxo/itens',{grupo_id:gId,nome:novoItemNome,tipo:'fixo'});setNovoItemNome('');setNovoItemGrupo(null);carregar();};
  const renomearItem  = async(id)=>{if(!editItem?.nome.trim())return;await api.put(`/fluxo/itens/${id}`,{nome:editItem.nome});setEditItem(null);carregar();};
  const excluirItem   = async(id)=>{if(!window.confirm('Excluir item?'))return;await api.delete(`/fluxo/itens/${id}`);carregar();};
  const iniciarPadrao = async()=>{for(const g of GRUPOS_PADRAO){const r=await api.post('/fluxo/grupos',{nome:g.nome});for(const nome of g.itens)await api.post('/fluxo/itens',{grupo_id:r.data.id,nome,tipo:'fixo'});}carregar();};
  const onDragStart=(i)=>setDragIdx(i);
  const onDragOver=(e,i)=>{e.preventDefault();setDragOver(i);};
  const onDrop=(i)=>{if(dragIdx===null||dragIdx===i)return;const n=[...grupos];const[m]=n.splice(dragIdx,1);n.splice(i,0,m);setGrupos(n);setDragIdx(null);setDragOver(null);};

  const dd = {position:'absolute',top:'calc(100% + 2px)',left:0,background:'white',border:'1px solid #E0E0E0',borderRadius:'3px',zIndex:50,minWidth:'185px',padding:'3px 0',boxShadow:'0 2px 8px rgba(0,0,0,.06)'};
  const ddi = sel => ({padding:'6px 12px',fontSize:'10px',color:sel?'#EE4D2D':'#555',fontWeight:sel?'500':'400',cursor:'pointer',background:'white'});
  const chip = (t) => ({display:'inline-flex',alignItems:'center',gap:'3px',fontSize:'9px',padding:'2px 7px',borderRadius:'10px',cursor:'pointer',whiteSpace:'nowrap',background:t==='r'?'#FEF2F2':t==='w'?'#FFFBEB':t==='g'?'#F0FDF4':'#EFF6FF',color:t==='r'?'#991B1B':t==='w'?'#92400E':t==='g'?'#166534':'#1E40AF',border:`1px solid ${t==='r'?'#FECACA':t==='w'?'#FDE68A':t==='g'?'#BBF7D0':'#BFDBFE'}`});
  const chipDot = t => ({width:'5px',height:'5px',borderRadius:'50%',background:t==='r'?'#EF4444':t==='w'?'#F59E0B':t==='g'?'#22C55E':'#3B82F6'});
  const ghStyle = {background:'#EBF4FF',borderBottom:'1px solid #D6EAFF',padding:'5px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'};
  const gbt = (t) => ({background:'white',border:`1px solid ${t==='add'?'#BBDEFB':t==='del'?'#FFCDD2':'#E3F0FF'}`,borderRadius:'2px',color:t==='add'?'#1565C0':t==='del'?'#C62828':'#757575',fontSize:'8px',padding:'1px 5px',cursor:'pointer'});
  const badge = (t) => ({fontSize:'8px',padding:'1px 5px',borderRadius:'8px',fontWeight:'500',background:t==='r'?'#FEE2E2':t==='g'?'#DCFCE7':'#FEF3C7',color:t==='r'?'#991B1B':t==='g'?'#166534':'#92400E'});
  const cfhStyle = {background:'#EBF4FF',borderBottom:'1px solid #D6EAFF',padding:'6px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'};

  if(loading) return <Layout><div style={{padding:'32px',color:'#9E9E9E'}}>Carregando...</div></Layout>;

  return (
    <Layout>
      <div style={{padding:'0',background:'#F5F5F5',minHeight:'100vh'}}>

        {/* Topbar + Abas */}
        <div style={{background:'white',marginBottom:'10px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px 0'}}>
            <div>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#222'}}>Fluxo Anual</div>
              <div style={{fontSize:'9px',color:'#BDBDBD',marginTop:'1px'}}>análise inteligente · grupos personalizáveis</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'4px',paddingBottom:'8px'}}>
              <button onClick={()=>setAno(a=>a-1)} style={{background:'white',border:'1px solid #E8E8E8',borderRadius:'3px',width:'18px',height:'18px',fontSize:'10px',color:'#757575',cursor:'pointer'}}>‹</button>
              <span style={{fontSize:'11px',fontWeight:'500',color:'#222',minWidth:'32px',textAlign:'center'}}>{ano}</span>
              <button onClick={()=>setAno(a=>a+1)} style={{background:'white',border:'1px solid #E8E8E8',borderRadius:'3px',width:'18px',height:'18px',fontSize:'10px',color:'#757575',cursor:'pointer'}}>›</button>
              <button onClick={()=>aba===0&&setShowNovoGrupo(true)} style={{background:'white',color:'#555',border:'1px solid #E0E0E0',borderRadius:'3px',padding:'2px 8px',fontSize:'9px',cursor:'pointer',marginLeft:'4px'}}>
                {aba===0?'+ Grupo':'+ Lançamento'}
              </button>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',padding:'0 16px',borderBottom:'1px solid #EFEFEF'}}>
            {['Categorias','Fluxo de Caixa'].map((l,i)=>(
              <div key={i} onClick={()=>setAba(i)}
                style={{padding:'8px 16px 6px',fontSize:'11px',color:aba===i?'#EE4D2D':'#757575',cursor:'pointer',borderBottom:aba===i?'2px solid #EE4D2D':'2px solid transparent',fontWeight:aba===i?'500':'400'}}>
                {l}
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'0 16px 16px'}}>

          {/* ===== ABA 1 ===== */}
          {aba===0 && (
            <>
              {/* Cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'6px',marginBottom:'8px'}}>
                {[['Entradas',totalAnoEntradas,'#16A34A'],['Saídas',totalAnoSaidas,'#EE4D2D'],['Saldo',totalAnoEntradas-totalAnoSaidas,totalAnoEntradas-totalAnoSaidas>=0?'#16A34A':'#EE4D2D']].map(([l,v,c])=>(
                  <div key={l} style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'9px',color:'#9E9E9E'}}>{l}</span>
                    <span style={{fontSize:'12px',fontWeight:'600',color:c}}>R$ {v.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
                  </div>
                ))}
                <div style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E'}}>Meses</span>
                  <span style={{fontSize:'12px',fontWeight:'600',color:'#222'}}>{mesesComDados.length}/12</span>
                </div>
              </div>

              {/* Chips */}
              {chipsAba1().length>0 && (
                <div style={{background:'white',borderRadius:'3px',padding:'6px 12px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E',fontWeight:'500',whiteSpace:'nowrap'}}>Este período:</span>
                  {chipsAba1().map((c,i)=>(
                    <span key={i} style={chip(c.t)}>
                      <span style={chipDot(c.t)}></span>{c.l}
                    </span>
                  ))}
                </div>
              )}

              {/* Filtros */}
              <div style={{background:'white',borderRadius:'3px',padding:'0 12px',marginBottom:'8px',display:'flex',alignItems:'center',height:'30px'}}>
                {[
                  {ref:periodoRef,show:showPeriodo,setShow:setShowPeriodo,label:PERIODOS[periodoIdx].label,opts:PERIODOS.map((p,i)=>({v:i,l:p.label})),val:periodoIdx,set:setPeriodoIdx},
                ].map(({ref,show,setShow,label,opts,val,set})=>(
                  <div key="periodo" ref={ref} style={{position:'relative'}}>
                    <div onClick={()=>{setShow(v=>!v);setShowFiltroSaldo(false);setShowOrdenacao(false);}}
                      style={{fontSize:'10px',color:'#EE4D2D',fontWeight:'500',borderBottom:'2px solid #EE4D2D',padding:'0 10px',height:'30px',display:'flex',alignItems:'center',cursor:'pointer',whiteSpace:'nowrap'}}>
                      {label} ▾
                    </div>
                    {show && (
                      <div style={dd}>
                        {opts.map(o=>(
                          <div key={o.v} style={ddi(val===o.v)} onClick={()=>{set(o.v);setShow(false);}}
                            onMouseEnter={e=>e.currentTarget.style.background='#FFF5F5'}
                            onMouseLeave={e=>e.currentTarget.style.background='white'}>
                            {o.l}{val===o.v?' ✓':''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{width:'1px',height:'12px',background:'#F0F0F0'}}></div>
                <div ref={saldoRef} style={{position:'relative'}}>
                  <div onClick={()=>{setShowFiltroSaldo(v=>!v);setShowPeriodo(false);setShowOrdenacao(false);}}
                    style={{fontSize:'10px',color:filtroSaldo!=='todos'?'#EE4D2D':'#757575',fontWeight:filtroSaldo!=='todos'?'500':'400',borderBottom:filtroSaldo!=='todos'?'2px solid #EE4D2D':'2px solid transparent',padding:'0 10px',height:'30px',display:'flex',alignItems:'center',cursor:'pointer',whiteSpace:'nowrap'}}>
                    Saldo: {filtroSaldo==='todos'?'Todos':filtroSaldo==='positivos'?'Positivos':'Negativos'} ▾
                  </div>
                  {showFiltroSaldo && (
                    <div style={dd}>
                      {[['todos','Todos'],['positivos','Só positivos'],['negativos','Só negativos']].map(([v,l])=>(
                        <div key={v} style={ddi(filtroSaldo===v)} onClick={()=>{setFiltroSaldo(v);setShowFiltroSaldo(false);}}
                          onMouseEnter={e=>e.currentTarget.style.background='#FFF5F5'}
                          onMouseLeave={e=>e.currentTarget.style.background='white'}>
                          {l}{filtroSaldo===v?' ✓':''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{width:'1px',height:'12px',background:'#F0F0F0'}}></div>
                <div ref={ordRef} style={{position:'relative'}}>
                  <div onClick={()=>{setShowOrdenacao(v=>!v);setShowPeriodo(false);setShowFiltroSaldo(false);}}
                    style={{fontSize:'10px',color:ordenacao!=='arrastar'?'#EE4D2D':'#757575',fontWeight:ordenacao!=='arrastar'?'500':'400',borderBottom:ordenacao!=='arrastar'?'2px solid #EE4D2D':'2px solid transparent',padding:'0 10px',height:'30px',display:'flex',alignItems:'center',cursor:'pointer',whiteSpace:'nowrap'}}>
                    Ordenar: {ordenacao==='arrastar'?'Livre':ordenacao==='az'?'A→Z':'Maior gasto'} ▾
                  </div>
                  {showOrdenacao && (
                    <div style={dd}>
                      {[['arrastar','Livre (arrastar)'],['az','A → Z'],['maior','Maior gasto']].map(([v,l])=>(
                        <div key={v} style={ddi(ordenacao===v)} onClick={()=>{setOrdenacao(v);setShowOrdenacao(false);}}
                          onMouseEnter={e=>e.currentTarget.style.background='#FFF5F5'}
                          onMouseLeave={e=>e.currentTarget.style.background='white'}>
                          {l}{ordenacao===v?' ✓':''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'8px',color:'#BDBDBD',display:'flex',alignItems:'center',gap:'2px'}}><ArrNeu/>1º</span>
                  <span style={{fontSize:'8px',color:'#388E3C',display:'flex',alignItems:'center',gap:'2px'}}><ArrDown/>caiu</span>
                  <span style={{fontSize:'8px',color:'#E64A19',display:'flex',alignItems:'center',gap:'2px'}}><ArrUp/>subiu</span>
                </div>
              </div>

              {grupos.length===0 && (
                <div style={{background:'white',borderRadius:'3px',padding:'40px',textAlign:'center'}}>
                  <p style={{fontSize:'13px',fontWeight:'500',color:'#222',marginBottom:'8px'}}>Nenhuma categoria configurada</p>
                  <p style={{fontSize:'11px',color:'#9E9E9E',marginBottom:'16px'}}>Comece com os grupos padrão ou crie do zero.</p>
                  <button onClick={iniciarPadrao} style={{background:'#6366F1',color:'white',border:'none',borderRadius:'3px',padding:'7px 16px',fontSize:'11px',cursor:'pointer',marginRight:'6px'}}>Usar grupos padrão</button>
                  <button onClick={()=>setShowNovoGrupo(true)} style={{background:'white',color:'#555',border:'1px solid #E0E0E0',borderRadius:'3px',padding:'7px 14px',fontSize:'11px',cursor:'pointer'}}>Criar do zero</button>
                </div>
              )}

              {showNovoGrupo && (
                <div style={{background:'white',borderRadius:'3px',padding:'8px 12px',marginBottom:'8px',display:'flex',gap:'6px',alignItems:'center'}}>
                  <input value={novoGrupoNome} onChange={e=>setNovoGrupoNome(e.target.value)} placeholder="Nome do novo grupo..." style={{...inp,width:'200px'}} autoFocus onKeyDown={e=>e.key==='Enter'&&adicionarGrupo()}/>
                  <button onClick={adicionarGrupo} style={{background:'#6366F1',color:'white',border:'none',borderRadius:'3px',padding:'5px 12px',cursor:'pointer',fontSize:'10px'}}>Criar</button>
                  <button onClick={()=>{setShowNovoGrupo(false);setNovoGrupoNome('');}} style={{background:'white',color:'#757575',border:'1px solid #E0E0E0',borderRadius:'3px',padding:'5px 8px',cursor:'pointer',fontSize:'10px'}}>Cancelar</button>
                </div>
              )}

              {grupos.length>0 && mesesFinal.length>0 && (
                <div style={{background:'white',borderRadius:'3px',overflow:'hidden',marginBottom:'8px'}}>
                  <div style={{background:'#F8FAFC',borderBottom:'1px solid #F0F0F0',padding:'5px 10px',fontSize:'10px',fontWeight:'500',color:'#334155'}}>Entrada × Saída no período</div>
                  {mesesFinal.map(mesIdx=>{
                    const e=totalEntradas(mesIdx),s=totalSaidas(mesIdx),sal=e-s;
                    if(e===0&&s===0) return null;
                    const maxV=Math.max(e,s,1);
                    return (
                      <div key={mesIdx} style={{display:'flex',alignItems:'center',padding:'5px 10px',borderBottom:'1px solid #FAFAFA',gap:'8px'}}>
                        <span style={{fontSize:'10px',fontWeight:'500',color:'#555',minWidth:'26px'}}>{MESES[mesIdx]}</span>
                        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'2px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                            <div style={{height:'5px',borderRadius:'2px',background:'#D6EAFF',width:`${(e/maxV)*100}%`}}></div>
                            <span style={{fontSize:'9px',color:'#1A5FA8',minWidth:'58px'}}>R$ {e.toFixed(0)}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                            <div style={{height:'5px',borderRadius:'2px',background:'#FECACA',width:`${(s/maxV)*100}%`}}></div>
                            <span style={{fontSize:'9px',color:'#EE4D2D',minWidth:'58px'}}>R$ {s.toFixed(0)}</span>
                          </div>
                        </div>
                        <span style={{fontSize:'10px',fontWeight:'600',color:sal>=0?'#16A34A':'#EE4D2D',minWidth:'68px',textAlign:'right'}}>{sal>=0?'+':''}{sal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {insightResumo() && (
                    <div style={{padding:'6px 10px',background:'#FAFAFA',borderTop:'1px solid #F0F0F0',display:'flex',alignItems:'flex-start',gap:'6px'}}>
                      <div style={{width:'14px',height:'14px',borderRadius:'50%',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',color:'#1E40AF',flexShrink:0,marginTop:'1px'}}>→</div>
                      <span style={{fontSize:'10px',color:'#555',lineHeight:'1.5'}}>{insightResumo()}</span>
                    </div>
                  )}
                </div>
              )}

              {grupos.length>0 && (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'8px'}}>
                    {gruposOrdenados().map((grupo,gIdx)=>{
                      const ig=insightGrupo(grupo);
                      return (
                        <div key={grupo.id}
                          draggable={ordenacao==='arrastar'}
                          onDragStart={()=>onDragStart(gIdx)}
                          onDragOver={e=>onDragOver(e,gIdx)}
                          onDrop={()=>onDrop(gIdx)}
                          style={{background:'white',borderRadius:'3px',overflow:'hidden',opacity:dragOver===gIdx?.7:1,border:dragOver===gIdx?'2px dashed #90CAF9':'2px solid transparent'}}>
                          <div style={ghStyle}>
                            {editGrupo?.id===grupo.id?(
                              <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
                                <input value={editGrupo.nome} onChange={e=>setEditGrupo({...editGrupo,nome:e.target.value})} style={{...inp,width:'110px',fontSize:'10px',padding:'2px 5px'}} autoFocus/>
                                <button onClick={()=>renomearGrupo(grupo.id)} style={{...gbt('add'),background:'#22C55E',color:'white',border:'none'}}>✓</button>
                                <button onClick={()=>setEditGrupo(null)} style={gbt('')}>✕</button>
                              </div>
                            ):(
                              <span style={{color:'#1A5FA8',fontSize:'10px',fontWeight:'500',display:'flex',alignItems:'center',gap:'4px'}}>
                                {ordenacao==='arrastar'&&<span style={{color:'#90CAF9',cursor:'grab'}}>⠿</span>}
                                {grupo.nome}
                                {ig?.badge&&<span style={badge(ig.badge.t)}>{ig.badge.l}</span>}
                              </span>
                            )}
                            <div style={{display:'flex',gap:'2px'}}>
                              <button onClick={()=>setEditGrupo({id:grupo.id,nome:grupo.nome})} style={gbt('')}>✎</button>
                              <button onClick={()=>setNovoItemGrupo(grupo.id)} style={gbt('add')}>+</button>
                              <button onClick={()=>excluirGrupo(grupo.id)} style={gbt('del')}>✕</button>
                            </div>
                          </div>
                          <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%',borderCollapse:'collapse',minWidth:mesesFinal.length*65+110}}>
                              <thead>
                                <tr style={{background:'#FAFAFA'}}>
                                  <th style={{padding:'3px 8px',fontSize:'8px',color:'#BDBDBD',textAlign:'left',borderBottom:'1px solid #F5F5F5',width:'100px'}}>Item</th>
                                  {mesesFinal.map(m=><th key={m} style={{padding:'3px 6px',fontSize:'8px',color:'#BDBDBD',textAlign:'right',borderBottom:'1px solid #F5F5F5',minWidth:'60px'}}>{MESES[m]}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {(grupo.itens||[]).map(item=>(
                                  <tr key={item.id} onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                    <td style={{padding:'3px 8px',borderBottom:'1px solid #FAFAFA'}}>
                                      {editItem?.id===item.id?(
                                        <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
                                          <input value={editItem.nome} onChange={e=>setEditItem({...editItem,nome:e.target.value})} style={{...inp,width:'80px',fontSize:'10px',padding:'2px 4px'}} autoFocus/>
                                          <button onClick={()=>renomearItem(item.id)} style={{...gbt('add'),background:'#22C55E',color:'white',border:'none'}}>✓</button>
                                          <button onClick={()=>setEditItem(null)} style={gbt('')}>✕</button>
                                        </div>
                                      ):(
                                        <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                                          <span style={{fontSize:'10px',color:'#424242',flex:1}}>{item.nome}</span>
                                          <button onClick={()=>setEditItem({id:item.id,nome:item.nome})} style={{background:'none',border:'none',color:'#BDBDBD',cursor:'pointer',fontSize:'10px',padding:'1px'}}>✎</button>
                                          <button onClick={()=>excluirItem(item.id)} style={{background:'none',border:'none',color:'#BDBDBD',cursor:'pointer',fontSize:'10px',padding:'1px'}}>✕</button>
                                        </div>
                                      )}
                                    </td>
                                    {mesesFinal.map((mesIdx,mi)=>{
                                      const val=getValor(item.id,mesIdx);
                                      const ant=mi>0?getValor(item.id,mesesFinal[mi-1]):null;
                                      return (
                                        <td key={mesIdx} style={{padding:'2px 4px',borderBottom:'1px solid #FAFAFA',textAlign:'right'}}>
                                          {val!==null?(
                                            <div style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-end'}}>
                                              <input type="number" step="0.01" defaultValue={val}
                                                style={{width:'58px',padding:'2px 4px',fontSize:'10px',border:'1px solid transparent',borderRadius:'2px',textAlign:'right',background:'transparent',color:'#424242',outline:'none'}}
                                                onFocus={e=>{e.target.style.borderColor='#90CAF9';e.target.style.background='white';}}
                                                onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.background='transparent';salvarValor(item.id,mesIdx,e.target.value);}}/>
                                              <Ind atual={val} anterior={ant}/>
                                            </div>
                                          ):(
                                            <input type="number" step="0.01" defaultValue="" placeholder="—"
                                              style={{width:'58px',padding:'2px 4px',fontSize:'10px',border:'1px solid transparent',borderRadius:'2px',textAlign:'right',background:'transparent',color:'#BDBDBD',outline:'none'}}
                                              onFocus={e=>{e.target.style.borderColor='#90CAF9';e.target.style.background='white';e.target.style.color='#424242';}}
                                              onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.background='transparent';salvarValor(item.id,mesIdx,e.target.value);}}/>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                                {novoItemGrupo===grupo.id&&(
                                  <tr style={{background:'#F0F6FF'}}>
                                    <td colSpan={mesesFinal.length+1} style={{padding:'6px 8px'}}>
                                      <div style={{display:'flex',gap:'5px',alignItems:'center'}}>
                                        <input value={novoItemNome} onChange={e=>setNovoItemNome(e.target.value)} placeholder="Nome do item..." style={{...inp,width:'150px',fontSize:'10px'}} autoFocus onKeyDown={e=>e.key==='Enter'&&adicionarItem(grupo.id)}/>
                                        <button onClick={()=>adicionarItem(grupo.id)} style={{background:'#6366F1',color:'white',border:'none',borderRadius:'3px',padding:'4px 10px',cursor:'pointer',fontSize:'10px'}}>OK</button>
                                        <button onClick={()=>{setNovoItemGrupo(null);setNovoItemNome('');}} style={{background:'white',color:'#757575',border:'1px solid #E0E0E0',borderRadius:'3px',padding:'4px 7px',cursor:'pointer',fontSize:'10px'}}>✕</button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                <tr style={{background:'#FAFAFA',borderTop:'1px solid #F0F0F0'}}>
                                  <td style={{padding:'3px 8px',fontSize:'9px',fontWeight:'500',color:'#757575'}}>Total</td>
                                  {mesesFinal.map(mesIdx=>{
                                    const t=totalGrupoMes(grupo,mesIdx);
                                    return <td key={mesIdx} style={{padding:'3px 6px',fontSize:'9px',fontWeight:'500',color:t>0?'#424242':'#BDBDBD',textAlign:'right'}}>{t>0?`R$ ${t.toFixed(2)}`:'—'}</td>;
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          {ig && (
                            <div style={{padding:'5px 10px',background:'#FAFAFA',borderTop:'1px solid #F0F0F0',display:'flex',alignItems:'flex-start',gap:'5px'}}>
                              <div style={{width:'5px',height:'5px',borderRadius:'50%',background:ig.dot,flexShrink:0,marginTop:'4px'}}></div>
                              <span style={{fontSize:'9px',color:'#555',lineHeight:'1.4'}}>{ig.txt}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!showNovoGrupo&&(
                    <button onClick={()=>setShowNovoGrupo(true)} style={{width:'100%',background:'white',border:'1px dashed #E0E0E0',borderRadius:'3px',padding:'7px',color:'#9E9E9E',fontSize:'10px',cursor:'pointer'}}>
                      + Adicionar novo grupo
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* ===== ABA 2 ===== */}
          {aba===1 && (
            <>
              {/* Cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'6px',marginBottom:'8px'}}>
                <div style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E'}}>Maior receita</span>
                  <span style={{fontSize:'11px',fontWeight:'600',color:'#16A34A'}}>{entradasAnuais[maiorEntradaIdx]>0?`${MESES[maiorEntradaIdx]} · R$ ${entradasAnuais[maiorEntradaIdx].toFixed(0)}`:'—'}</span>
                </div>
                <div style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E'}}>Maior gasto</span>
                  <span style={{fontSize:'11px',fontWeight:'600',color:'#EE4D2D'}}>{saidasAnuais[maiorSaidaIdx]>0?`${MESES[maiorSaidaIdx]} · R$ ${saidasAnuais[maiorSaidaIdx].toFixed(0)}`:'—'}</span>
                </div>
                <div style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E'}}>Melhor saldo</span>
                  <span style={{fontSize:'11px',fontWeight:'600',color:'#16A34A'}}>{entradasAnuais[melhorMesIdx]>0?`${MESES[melhorMesIdx]} · +R$ ${saldosAnuais[melhorMesIdx].toFixed(0)}`:'—'}</span>
                </div>
                <div style={{background:'white',borderRadius:'3px',padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E'}}>Meses negativos</span>
                  <span style={{fontSize:'12px',fontWeight:'600',color:mesesNegativos>0?'#EE4D2D':'#16A34A'}}>{mesesNegativos} em {ano}</span>
                </div>
              </div>

              {/* Chips aba 2 */}
              {chipsAba2().length>0 && (
                <div style={{background:'white',borderRadius:'3px',padding:'6px 12px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                  <span style={{fontSize:'9px',color:'#9E9E9E',fontWeight:'500',whiteSpace:'nowrap'}}>{ano}:</span>
                  {chipsAba2().map((c,i)=>(
                    <span key={i} style={chip(c.t)}>
                      <span style={chipDot(c.t)}></span>{c.l}
                    </span>
                  ))}
                </div>
              )}

              {/* Gráfico */}
              <div style={{background:'white',borderRadius:'3px',overflow:'hidden',marginBottom:'8px'}}>
                <div style={cfhStyle}>
                  <span style={{color:'#1A5FA8',fontSize:'10px',fontWeight:'500'}}>Entradas × Saídas × Saldo — {ano}</span>
                  <span style={{fontSize:'8px',color:'#90CAF9'}}>oscilação mensal</span>
                </div>
                <div style={{padding:'8px 12px 4px'}}>
                  <GraficoOndas entradas={entradasAnuais} saidas={saidasAnuais}/>
                </div>
                <div style={{display:'flex',gap:'12px',padding:'2px 12px 6px'}}>
                  {[['#3B82F6','Entradas'],['#EF4444','Saídas'],['#16A34A','Saldo']].map(([c,l])=>(
                    <span key={l} style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'8px',color:'#9E9E9E'}}>
                      <span style={{width:'14px',height:'2px',background:c,borderRadius:'1px',display:'inline-block'}}></span>{l}
                    </span>
                  ))}
                  <span style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'8px',color:'#BDBDBD'}}>
                    <span style={{width:'14px',borderTop:'1.5px dashed #BDBDBD',display:'inline-block'}}></span>Projeção
                  </span>
                </div>
                {mesesComDados.length>0 && (
                  <div style={{padding:'6px 12px 10px',background:'white',borderTop:'1px solid #F5F5F5',display:'flex',gap:'12px',flexWrap:'wrap'}}>
                    {mesesNegativos>0&&(
                      <div style={{display:'flex',alignItems:'flex-start',gap:'5px',fontSize:'9px',color:'#555',flex:1,minWidth:'160px'}}>
                        <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#EF4444',flexShrink:0,marginTop:'3px'}}></div>
                        <span><strong>{MESES_FULL[piorMesIdx]}</strong> foi o único mês negativo — saídas superaram entradas. Cartões foram o maior item de saída.</span>
                      </div>
                    )}
                    {mesesComDados.length>=2&&(
                      <div style={{display:'flex',alignItems:'flex-start',gap:'5px',fontSize:'9px',color:'#555',flex:1,minWidth:'160px'}}>
                        <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#16A34A',flexShrink:0,marginTop:'3px'}}></div>
                        <span>Saldo em recuperação. Se manter padrão de <strong>{MESES_FULL[melhorMesIdx]}</strong>, projeção anual positiva.</span>
                      </div>
                    )}
                    <div style={{display:'flex',alignItems:'flex-start',gap:'5px',fontSize:'9px',color:'#555',flex:1,minWidth:'160px'}}>
                      <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#3B82F6',flexShrink:0,marginTop:'3px'}}></div>
                      <span>Entradas estáveis com variação baixa — renda previsível. Boa base para planejamento financeiro.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabela anual */}
              <div style={{background:'white',borderRadius:'3px',overflow:'hidden'}}>
                <div style={cfhStyle}>
                  <span style={{color:'#1A5FA8',fontSize:'10px',fontWeight:'500'}}>Tabela anual detalhada</span>
                  <span style={{fontSize:'8px',color:'#90CAF9'}}>% = (entrada − saída) ÷ entrada</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:'680px'}}>
                    <thead>
                      <tr style={{background:'#FAFAFA'}}>
                        <th style={{padding:'5px 8px',fontSize:'8px',color:'#BDBDBD',textAlign:'left',width:'55px',borderBottom:'1px solid #F5F5F5'}}>Tipo</th>
                        {MESES.map(m=><th key={m} style={{padding:'5px 5px',fontSize:'8px',color:'#BDBDBD',textAlign:'right',borderBottom:'1px solid #F5F5F5',minWidth:'55px'}}>{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{padding:'5px 8px',fontSize:'10px',color:'#9E9E9E'}}>Entrada</td>
                        {MESES.map((_,i)=>{
                          const v=entradasAnuais[i],ant=i>0?entradasAnuais[i-1]:null;
                          return (
                            <td key={i} style={{padding:'4px 5px',textAlign:'right',borderBottom:'1px solid #FAFAFA'}}>
                              {v>0?(
                                <div style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-end'}}>
                                  <span style={{fontSize:'10px',color:'#424242'}}>R$ {v.toFixed(0)}</span>
                                  <Ind atual={v} anterior={ant&&ant>0?ant:null}/>
                                </div>
                              ):<span style={{fontSize:'10px',color:'#BDBDBD'}}>—</span>}
                            </td>
                          );
                        })}
                      </tr>
                      <tr style={{background:'#FAFAFA'}}>
                        <td style={{padding:'5px 8px',fontSize:'10px',color:'#9E9E9E'}}>Saída</td>
                        {MESES.map((_,i)=>{
                          const v=saidasAnuais[i],ant=i>0?saidasAnuais[i-1]:null;
                          return (
                            <td key={i} style={{padding:'4px 5px',textAlign:'right',borderBottom:'1px solid #F5F5F5'}}>
                              {v>0?(
                                <div style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-end'}}>
                                  <span style={{fontSize:'10px',color:'#424242'}}>R$ {v.toFixed(0)}</span>
                                  <Ind atual={v} anterior={ant&&ant>0?ant:null}/>
                                </div>
                              ):<span style={{fontSize:'10px',color:'#BDBDBD'}}>—</span>}
                            </td>
                          );
                        })}
                      </tr>
                      <tr style={{borderTop:'2px solid #EEEEEE'}}>
                        <td style={{padding:'5px 8px',fontSize:'10px',fontWeight:'600',color:'#424242'}}>Saldo</td>
                        {MESES.map((_,i)=>{
                          const e=entradasAnuais[i],s=saidasAnuais[i],sal=e-s,pct=saldoPct(i),tem=e>0||s>0,pos=sal>=0;
                          if(!tem) return <td key={i} style={{padding:'4px 5px',textAlign:'right'}}><span style={{fontSize:'10px',color:'#BDBDBD'}}>—</span></td>;
                          return (
                            <td key={i} style={{padding:'4px 5px',textAlign:'right'}}>
                              <div style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-end'}}>
                                <span style={{fontSize:'10px',fontWeight:'600',color:'#424242'}}>{pos?'':'-'}R$ {Math.abs(sal).toFixed(0)}</span>
                                {pct!==null&&(
                                  <span style={{display:'inline-flex',alignItems:'center',gap:'2px',fontSize:'8px',color:pos?'#388E3C':'#E64A19'}}>
                                    {pos?<ArrDown c="#388E3C"/>:<ArrUp c="#E64A19"/>}{pos?'+':''}{pct.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {mesesComDados.length>0 && (
                  <div style={{padding:'6px 10px',background:'#FAFAFA',borderTop:'1px solid #F0F0F0',display:'flex',alignItems:'center',gap:'6px',fontSize:'9px',color:'#555'}}>
                    <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#3B82F6',flexShrink:0}}></div>
                    <span>
                      Reduzindo saídas em 10%/mês: <strong>economia de R$ {(saidasAnuais.filter(v=>v>0).reduce((a,v)=>a+v,0)*0.1).toFixed(0)}/ano</strong>. 
                      Meta para o próximo mês: saída abaixo de R$ {(saidasAnuais.filter(v=>v>0).at(-1)*0.9||0).toFixed(0)}.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}

