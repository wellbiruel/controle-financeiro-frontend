import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES      = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const CAT_CORES = {
  'Cartões':     '#EF4444',
  'Casa':        '#F97316',
  'Transporte':  '#3B82F6',
  'Alimentação': '#22C55E',
  'Saúde':       '#8B5CF6',
  'Lazer':       '#EC4899',
  'Outros':      '#6B7280',
};

const CAT_ICONS = {
  'Cartões':     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  'Casa':        'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'Transporte':  'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10z',
  'Alimentação': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'Saúde':       'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Lazer':       'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Outros':      'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
};

const FORMAS_PGTO  = ['Débito','Crédito','PIX','Dinheiro','Boleto','TED/DOC','Outro'];
const RECORRENCIAS = ['Única','Mensal','Quinzenal','Semanal','Anual'];
const CATS_DEFAULT = ['Cartões','Casa','Transporte','Alimentação','Saúde','Lazer','Outros'];
const INSIGHT_TICK = 7000;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt     = v  => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const fmtPct  = v  => `${v > 0 ? '+' : ''}${v}%`;
const fmtDate = d  => d ? new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR') : '';
const today   = () => new Date().toISOString().split('T')[0];
const cor     = n  => CAT_CORES[n] || '#6B7280';
const icon    = n  => CAT_ICONS[n] || CAT_ICONS['Outros'];

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────

const S = {
  page:    { padding: '0 20px 40px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  card:    { background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '0.5px solid #E5E7EB' },
  skel:    { background: '#F1F5F9', borderRadius: '8px', animation: 'pulse 1.5s infinite' },
  empty:   { textAlign: 'center', color: '#9CA3AF', padding: '28px 0', fontSize: '13px' },
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 8px' },
  title:   { fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 },
  sub:     { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  btnExp:  { display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',color:'#374151',fontSize:'13px',fontWeight:500,cursor:'pointer',fontFamily:'inherit' },
  btnNew:  { display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:8,border:'none',background:'#EF4444',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px rgba(239,68,68,.25)',fontFamily:'inherit' },
  table:   { width:'100%',borderCollapse:'collapse' },
  th:      { textAlign:'left',fontSize:'10px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.5px',padding:'6px 10px',borderBottom:'0.5px solid #F3F4F6',whiteSpace:'nowrap' },
  td:      { padding:'10px',fontSize:'13px',color:'#374151',borderBottom:'0.5px solid #F9FAFB',verticalAlign:'middle' },
  tdRed:   { color:'#DC2626',fontWeight:600 },
  actBtn:  { background:'none',border:'none',cursor:'pointer',color:'#D1D5DB',padding:3,borderRadius:5,fontSize:'13px',lineHeight:1 },
  fLabel:  { fontSize:'10px',fontWeight:600,color:'#374151',textTransform:'uppercase',letterSpacing:'.04em' },
  fInput:  { padding:'8px 10px',borderRadius:7,border:'1px solid #E5E7EB',fontSize:'13px',color:'#111827',outline:'none',width:'100%',boxSizing:'border-box',fontFamily:'inherit',background:'#fff' },
  fSel:    { padding:'8px 10px',borderRadius:7,border:'1px solid #E5E7EB',fontSize:'13px',color:'#111827',outline:'none',width:'100%',background:'#fff',cursor:'pointer',fontFamily:'inherit' },
  fErr:    { color:'#DC2626',fontSize:'12px',padding:'8px 10px',background:'#FEF2F2',borderRadius:7,marginBottom:10 },
  fOk:     { color:'#16A34A',fontSize:'12px',padding:'8px 10px',background:'#F0FDF4',borderRadius:7,marginBottom:10 },
  btnSave: { width:'100%',padding:'10px',borderRadius:8,border:'none',background:'#EF4444',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(239,68,68,.2)' },
};

function Skel({ h = 24, mb = 0 }) {
  return <div style={{ ...S.skel, height: h, marginBottom: mb }} />;
}

// ─── MENU DE CATEGORIAS — cards horizontais com ícone + valor + % ─────────────

function CatMenu({ cats, total, catFiltro, setCatFiltro }) {
  const all = [
    { nome: 'Todos', total, pct: 100, top: false },
    ...cats.map((c, i) => ({ ...c, top: i === 0 })),
  ];
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 10px', scrollbarWidth: 'none' }}>
      {all.map(c => {
        const active = catFiltro === c.nome;
        const baseC  = cor(c.nome);
        return (
          <div key={c.nome} onClick={() => setCatFiltro(c.nome)} style={{
            minWidth: c.nome === 'Todos' ? 100 : 130,
            padding: '10px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            flexShrink: 0,
            border: active ? `1.5px solid ${baseC}` : c.top ? '1px solid #FECACA' : '1px solid #E5E7EB',
            background: active ? baseC : c.top ? '#FEF2F2' : '#fff',
            transition: 'all .15s',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {active && <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.06)',pointerEvents:'none' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: active ? 'rgba(255,255,255,.2)' : `${baseC}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {c.nome === 'Todos'
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : baseC} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : baseC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon(c.nome)} /></svg>
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#fff' : c.top ? '#DC2626' : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80 }}>
                {c.nome}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: active ? '#fff' : c.top ? '#DC2626' : '#111827', lineHeight: 1, marginBottom: 3 }}>
              {fmt(c.total)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
                background: active ? 'rgba(255,255,255,.2)' : c.top ? '#FECACA' : '#F3F4F6',
                color: active ? '#fff' : c.top ? '#DC2626' : '#6B7280',
              }}>{c.pct}%</span>
              {c.variacaoPct !== undefined && c.variacaoPct !== null && (
                <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,.8)' : c.variacaoPct > 0 ? '#EF4444' : '#16A34A' }}>
                  {fmtPct(c.variacaoPct)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RESUMO DO PERÍODO — 6 blocos lado a lado ─────────────────────────────────

function ResumoPeriodo({ R, E, mes, ano, loading }) {
  const total     = R.totalMes    || 0;
  const varPct    = R.variacao    || 0;
  const maiorG    = R.maiorGasto  || null;
  const totalE    = E?.totalMes   || 0;
  const represen  = totalE > 0 ? parseFloat(((total / totalE) * 100).toFixed(1)) : 0;
  const resultado = totalE - total;

  const blocos = [
    { lbl: 'Total saídas',       val: fmt(total),         sub: `${MESES[mes-1]} ${ano}`,                       bar: '#EF4444', vc: '#DC2626' },
    { lbl: 'Entradas',           val: fmt(totalE),         sub: `${MESES[mes-1]} ${ano}`,                       bar: '#22C55E', vc: '#16A34A' },
    { lbl: 'Representatividade', val: `${represen}%`,      sub: 'saídas / entradas',                            bar: '#F97316', vc: '#D97706' },
    { lbl: 'Comparativo',        val: `${varPct>0?'+':''}${varPct}%`, sub: varPct<=0?'Reduziu ✓':'Aumentou ↑', bar: varPct<=0?'#16A34A':'#EF4444', vc: varPct<=0?'#16A34A':'#DC2626' },
    { lbl: 'Resultado do mês',   val: fmt(resultado),      sub: resultado>=0?'Saldo positivo ✓':'Déficit ↑',    bar: resultado>=0?'#16A34A':'#EF4444', vc: resultado>=0?'#16A34A':'#DC2626' },
    { lbl: 'Maior gasto',        val: maiorG?.descricao||'—', sub: maiorG?fmt(maiorG.valor):'Sem dados',       bar: '#F59E0B', vc: '#D97706', sm: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 14 }}>
      {blocos.map(b => (
        <div key={b.lbl} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '0.5px solid #E5E7EB', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:b.bar,borderRadius:'10px 10px 0 0' }} />
          <div style={{ fontSize:'10px',fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.06em',marginTop:4,marginBottom:5 }}>{b.lbl}</div>
          {loading ? <Skel h={20} /> : (
            <div style={{ fontSize:b.sm?14:18,fontWeight:700,color:b.vc,lineHeight:1.1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3 }}>{b.val}</div>
          )}
          <div style={{ fontSize:'10px',color:'#9CA3AF' }}>{b.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ÁREA OPERACIONAL POR CATEGORIA ──────────────────────────────────────────

function CatArea({ catFiltro, cats, total }) {
  if (catFiltro === 'Todos' || !cats.length) return null;
  const c = cats.find(x => x.nome === catFiltro);
  if (!c) return null;
  const resto = total - c.total;
  return (
    <div style={{ ...S.card, background:'#FEF2F2', border:'1px solid #FECACA', padding:'12px 16px', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:28,height:28,borderRadius:7,background:`${cor(catFiltro)}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cor(catFiltro)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon(catFiltro)} />
          </svg>
        </div>
        <span style={{ fontSize:14,fontWeight:700,color:'#111827' }}>{catFiltro}</span>
        <span style={{ fontSize:11,color:'#9CA3AF' }}>· visão detalhada</span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
        {[
          { lbl:'Total',       val:fmt(c.total),                                                       vc:'#DC2626' },
          { lbl:'% do mês',    val:`${c.pct}%`,                                                        vc:'#D97706' },
          { lbl:'vs anterior', val:c.variacaoPct!==null?fmtPct(c.variacaoPct):'—',                    vc:c.variacaoPct>0?'#EF4444':'#16A34A' },
          { lbl:'Restante',    val:fmt(Math.max(0,resto)),                                             vc:'#374151' },
        ].map(({ lbl, val, vc }) => (
          <div key={lbl} style={{ background:'rgba(255,255,255,.7)',borderRadius:8,padding:'8px 10px',border:'1px solid #FECACA' }}>
            <div style={{ fontSize:10,color:'#9CA3AF',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:3 }}>{lbl}</div>
            <div style={{ fontSize:15,fontWeight:700,color:vc }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RADAR FINANCEIRO — 4 cards de insight em carrossel ───────────────────────

function RadarFinanceiro({ R, E, cats, mes }) {
  const total    = R.totalMes   || 0;
  const totalAnt = R.totalAnt   || 0;
  const varPct   = R.variacao   || 0;
  const totalE   = E?.totalMes  || 0;
  const represen = totalE > 0 ? Math.round((total / totalE) * 100) : 0;
  const maiorC   = cats[0] || null;

  const cards = [
    maiorC
      ? { icon:'📊', cor:'#EF4444', bg:'#FEF2F2',
          titulo:`${maiorC.nome} lidera`,
          desc:`${maiorC.pct}% das saídas · ${fmt(maiorC.total)}`,
          badge: maiorC.variacaoPct > 0 ? `+${maiorC.variacaoPct}% vs ant.` : maiorC.variacaoPct < 0 ? `${maiorC.variacaoPct}% vs ant.` : 'novo',
          badgeCor: maiorC.variacaoPct > 0 ? '#DC2626' : '#16A34A' }
      : { icon:'📊', cor:'#6B7280', bg:'#F9FAFB', titulo:'Sem dados de categoria', desc:'Adicione saídas para ver insights', badge:'—', badgeCor:'#9CA3AF' },
    { icon: varPct <= 0 ? '✅' : '⚠️',
      cor: varPct <= 0 ? '#16A34A' : '#F59E0B',
      bg:  varPct <= 0 ? '#F0FDF4' : '#FFFBEB',
      titulo: varPct <= 0 ? `Saídas ${Math.abs(varPct)}% menores` : `Saídas ${varPct}% maiores`,
      desc: `${MESES[mes-1]} vs mês anterior · ${fmt(totalAnt)} → ${fmt(total)}`,
      badge: varPct <= 0 ? 'Redução ✓' : 'Atenção ↑',
      badgeCor: varPct <= 0 ? '#16A34A' : '#D97706',
    },
    { icon: represen <= 70 ? '💰' : represen <= 90 ? '⚡' : '🔴',
      cor: represen <= 70 ? '#16A34A' : represen <= 90 ? '#D97706' : '#EF4444',
      bg:  represen <= 70 ? '#F0FDF4' : represen <= 90 ? '#FFFBEB' : '#FEF2F2',
      titulo: `${represen}% da renda gasto`,
      desc: `${fmt(total)} de saídas sobre ${fmt(totalE)} de entradas`,
      badge: represen <= 70 ? 'Saudável ✓' : represen <= 90 ? 'Moderado' : 'Crítico',
      badgeCor: represen <= 70 ? '#16A34A' : represen <= 90 ? '#D97706' : '#DC2626',
    },
    cats.length >= 3
      ? { icon:'📈', cor:'#3B82F6', bg:'#EFF6FF',
          titulo: `${cats.length} categorias ativas`,
          desc: cats.slice(0,3).map(c => `${c.nome} ${c.pct}%`).join(' · '),
          badge: 'Distribuição', badgeCor:'#1D4ED8',
        }
      : { icon:'💡', cor:'#8B5CF6', bg:'#F5F3FF',
          titulo:'Dica financeira',
          desc:'Categorize 100% das saídas para ter insights detalhados.',
          badge:'Conselho', badgeCor:'#7C3AED',
        },
  ];

  const [idx,    setIdx]    = useState(0);
  const [prog,   setProg]   = useState(0);
  const [paused, setPaused] = useState(false);
  const t0Ref    = useRef(Date.now());
  const pauseRef = useRef(false);
  const progRef  = useRef(null);
  const tickRef  = useRef(null);

  const stopAll = () => { clearInterval(progRef.current); clearInterval(tickRef.current); };

  const start = useCallback((fromProg = 0) => {
    stopAll();
    t0Ref.current = Date.now() - (fromProg / 100) * INSIGHT_TICK;
    progRef.current = setInterval(() => {
      if (pauseRef.current) return;
      setProg(Math.min(((Date.now() - t0Ref.current) / INSIGHT_TICK) * 100, 100));
    }, 80);
    tickRef.current = setInterval(() => {
      if (pauseRef.current) return;
      setIdx(i => (i + 1) % cards.length);
      t0Ref.current = Date.now();
      setProg(0);
    }, INSIGHT_TICK);
  }, [cards.length]); // eslint-disable-line

  useEffect(() => { start(); return stopAll; }, [start]);

  const go = i => { setIdx(i); t0Ref.current = Date.now(); setProg(0); };
  const prev = () => go((idx - 1 + cards.length) % cards.length);
  const next = () => go((idx + 1) % cards.length);
  const togglePause = () => {
    const p = !pauseRef.current;
    pauseRef.current = p;
    setPaused(p);
    if (!p) start(prog);
  };

  const card = cards[idx];

  return (
    <div style={{ ...S.card, marginBottom: 14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:'#111827' }}>Radar Financeiro</div>
          <div style={{ fontSize:11,color:'#9CA3AF',marginTop:1 }}>{MESES_FULL[mes-1]} · {cards.length} insights ativos</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <button onClick={prev} style={{ width:26,height:26,borderRadius:'50%',border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>‹</button>
            <div style={{ display:'flex', gap:4 }}>
              {cards.map((_,i) => (
                <button key={i} onClick={() => go(i)} style={{ width:i===idx?16:6,height:6,borderRadius:3,border:'none',background:i===idx?card.cor:'#E5E7EB',cursor:'pointer',padding:0,transition:'all .2s' }} />
              ))}
            </div>
            <button onClick={next} style={{ width:26,height:26,borderRadius:'50%',border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12 }}>›</button>
            <button onClick={togglePause} style={{ width:26,height:26,borderRadius:'50%',border:'1px solid #E5E7EB',background:'#fff',color:'#9CA3AF',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10 }}>
              {paused ? '▶' : '⏸'}
            </button>
          </div>
          <div style={{ width:80,height:3,background:'#F3F4F6',borderRadius:2,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${prog}%`,background:paused?'#D1D5DB':card.cor,borderRadius:2,transition:'width .08s linear' }} />
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {cards.map((c, i) => (
          <div key={i} onClick={() => go(i)} style={{
            padding:'14px', borderRadius:10, cursor:'pointer',
            border:`1.5px solid ${i===idx ? c.cor : '#F3F4F6'}`,
            background: i===idx ? c.bg : '#FAFAFA',
            transition:'all .2s',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{c.icon}</span>
              <span style={{ fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:5,background:`${c.badgeCor}18`,color:c.badgeCor }}>{c.badge}</span>
            </div>
            <div style={{ fontSize:12,fontWeight:700,color:'#111827',marginBottom:4,lineHeight:1.3 }}>{c.titulo}</div>
            <div style={{ fontSize:10,color:'#6B7280',lineHeight:1.4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FORMULÁRIO ───────────────────────────────────────────────────────────────

const EMPTY = { categoria:'', descricao:'', valor:'', data:today(), forma_pagamento:'', recorrencia:'Única' };

function FormSaida({ editData, onSuccess, onCancel, categoriasLista }) {
  const [form,    setForm]    = useState(editData ? { ...EMPTY, ...editData } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [ok,      setOk]      = useState('');

  useEffect(() => setForm(editData ? { ...EMPTY, ...editData } : EMPTY), [editData]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setOk('');
    if (!form.descricao.trim()) return setError('Informe a descrição.');
    const val = parseFloat(form.valor.toString().replace(',','.'));
    if (!val || isNaN(val)) return setError('Informe um valor válido.');
    if (!form.data) return setError('Informe a data.');
    try {
      setLoading(true);
      const payload = { descricao:form.descricao, valor:val, tipo:'saida', data:form.data, categoria:form.categoria||'Outros' };
      if (editData?.id) await api.put(`/transacoes/${editData.id}`, payload);
      else              await api.post('/transacoes', payload);
      setOk(editData?.id ? 'Saída atualizada!' : 'Saída salva!');
      if (!editData?.id) setForm(EMPTY);
      setTimeout(() => { setOk(''); onSuccess?.(); }, 1200);
    } catch(e) { setError(e?.response?.data?.message || 'Erro ao salvar.'); }
    finally    { setLoading(false); }
  };

  const cats = (categoriasLista || []).filter(c => c !== 'Todos');
  return (
    <div>
      <div style={{ display:'flex',flexDirection:'column',gap:4,marginBottom:10 }}>
        <label style={S.fLabel}>Categoria</label>
        <select style={S.fSel} value={form.categoria} onChange={e => set('categoria',e.target.value)}>
          <option value="">Selecione</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:4,marginBottom:10 }}>
        <label style={S.fLabel}>Descrição *</label>
        <input style={S.fInput} placeholder="Ex: Conta de luz, Mercado…" value={form.descricao} onChange={e => set('descricao',e.target.value)} />
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <label style={S.fLabel}>Valor (R$) *</label>
          <input style={S.fInput} type="number" min="0" step="0.01" placeholder="0,00" value={form.valor} onChange={e => set('valor',e.target.value)} />
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <label style={S.fLabel}>Data *</label>
          <input style={S.fInput} type="date" value={form.data} onChange={e => set('data',e.target.value)} />
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <label style={S.fLabel}>Forma de pgto.</label>
          <select style={S.fSel} value={form.forma_pagamento} onChange={e => set('forma_pagamento',e.target.value)}>
            <option value="">Selecione</option>
            {FORMAS_PGTO.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <label style={S.fLabel}>Recorrência</label>
          <select style={S.fSel} value={form.recorrencia} onChange={e => set('recorrencia',e.target.value)}>
            {RECORRENCIAS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      {error && <div style={S.fErr}>{error}</div>}
      {ok    && <div style={S.fOk}>✓ {ok}</div>}
      <div style={{ display:'flex', gap:8 }}>
        {onCancel && <button onClick={onCancel} style={{ ...S.btnSave,background:'#F3F4F6',color:'#374151',boxShadow:'none',flex:'0 0 auto',width:'auto',padding:'10px 14px' }}>Cancelar</button>}
        <button onClick={submit} disabled={loading} style={{ ...S.btnSave,flex:1,opacity:loading?0.7:1 }}>
          {loading ? 'Salvando…' : editData?.id ? 'Atualizar' : 'Salvar saída'}
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

function getStatusFatura(f) {
  const px   = new Date(f.proximaData);
  const hoje = new Date();
  const dias = Math.ceil((px - hoje) / (1000 * 60 * 60 * 24));
  if (dias < 0)  return { txt: 'Vencida',       cor: '#DC2626', bg: '#FEE2E2' };
  if (dias <= 5) return { txt: 'Vence em breve', cor: '#D97706', bg: '#FEF3C7' };
  return { txt: 'Em dia', cor: '#16A34A', bg: '#DCFCE7' };
}

function Sidebar({ proximas, cats, faturas, loadingFat, mes }) {
  const [fatOpen, setFatOpen] = useState(true);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* Próximos vencimentos — tabela */}
      <div style={{ ...S.card, padding:0, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'0.5px solid #F3F4F6' }}>
          <div style={{ fontSize:13,fontWeight:600,color:'#111827' }}>Próximos vencimentos</div>
          <div style={{ fontSize:11,color:'#9CA3AF',marginTop:1 }}>{MESES_FULL[mes-1]}</div>
        </div>
        {!proximas.length ? (
          <div style={{ ...S.empty, padding:'16px' }}>Sem saídas futuras.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>{['Data','Descrição','Valor'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {proximas.map(s => (
                <tr key={s.id}>
                  <td style={{ ...S.td, fontSize:11, whiteSpace:'nowrap', color:'#6B7280' }}>{fmtDate(s.data)}</td>
                  <td style={{ ...S.td, fontSize:12 }}>
                    <div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:110 }}>{s.descricao}</div>
                    <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:2 }}>
                      <span style={{ width:5,height:5,borderRadius:'50%',background:cor(s.categoria),flexShrink:0 }} />
                      <span style={{ fontSize:10,color:'#9CA3AF' }}>{s.categoria}</span>
                    </div>
                  </td>
                  <td style={{ ...S.td,...S.tdRed, fontSize:12, whiteSpace:'nowrap' }}>{fmt(s.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Comparativo por categoria — tabela */}
      <div style={{ ...S.card, padding:0, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'0.5px solid #F3F4F6' }}>
          <div style={{ fontSize:13,fontWeight:600,color:'#111827' }}>Comparativo</div>
          <div style={{ fontSize:11,color:'#9CA3AF',marginTop:1 }}>{MESES_FULL[mes-1]} vs mês anterior</div>
        </div>
        {!cats.length ? (
          <div style={{ ...S.empty, padding:'16px' }}>Nenhum dado.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>{['Categoria','Este mês','Variação'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {cats.slice(0,7).map((c,i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12 }}>
                      <span style={{ width:6,height:6,borderRadius:'50%',background:cor(c.nome),flexShrink:0 }} />
                      {c.nome}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize:12, fontWeight:600, color:'#DC2626', whiteSpace:'nowrap' }}>{fmt(c.total)}</td>
                  <td style={{ ...S.td, fontSize:11, whiteSpace:'nowrap' }}>
                    {c.variacaoPct !== null
                      ? <span style={{ fontWeight:600, color:c.variacaoPct>0?'#EF4444':'#16A34A' }}>{fmtPct(c.variacaoPct)}</span>
                      : <span style={{ color:'#9CA3AF' }}>novo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico de faturas — tabela recolhível */}
      <div style={{ ...S.card, padding:0, overflow:'hidden' }}>
        <div onClick={() => setFatOpen(o => !o)}
          style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',cursor:'pointer',userSelect:'none' }}>
          <div>
            <div style={{ fontSize:13,fontWeight:600,color:'#111827' }}>Faturas recorrentes</div>
            {faturas.length > 0 && (
              <div style={{ fontSize:10,color:'#9CA3AF',marginTop:1 }}>
                {faturas.length} recorrência{faturas.length!==1?'s':''} detectada{faturas.length!==1?'s':''}
              </div>
            )}
          </div>
          <span style={{ fontSize:11,color:'#9CA3AF' }}>{fatOpen ? '▲' : '▼'}</span>
        </div>

        {fatOpen && (
          <div style={{ borderTop:'0.5px solid #F3F4F6' }}>
            {loadingFat ? (
              <div style={{ padding:'12px 16px' }}><Skel h={30} mb={6} /><Skel h={30} /></div>
            ) : !faturas.length ? (
              <div style={{ ...S.empty, padding:'16px' }}>Nenhuma recorrência detectada.</div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>{['Descrição','Valor atual','Total ano','Status'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {faturas.map((f,i) => {
                    const st = getStatusFatura(f);
                    return (
                      <tr key={i}>
                        <td style={S.td}>
                          <div style={{ fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:110 }}>{f.descricao}</div>
                          <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:2 }}>
                            <span style={{ width:5,height:5,borderRadius:'50%',background:cor(f.categoria) }} />
                            <span style={{ fontSize:10,color:'#9CA3AF' }}>{f.mesesCount}x · próx. {fmtDate(f.proximaData)}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, fontSize:12, fontWeight:700, color:'#DC2626', whiteSpace:'nowrap' }}>{fmt(f.valor)}</td>
                        <td style={{ ...S.td, fontSize:11, color:'#6B7280', whiteSpace:'nowrap' }}>{fmt(f.totalAno)}</td>
                        <td style={S.td}>
                          <span style={{ fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:5,background:st.bg,color:st.cor,whiteSpace:'nowrap' }}>{st.txt}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────

export default function SaidasPage() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [mes,             setMes]             = useState(hoje.getMonth() + 1);
  const [ano]                                 = useState(hoje.getFullYear());
  const [catFiltro,       setCatFiltro]       = useState('Todos');
  const [busca,           setBusca]           = useState('');
  const [resumo,          setResumo]          = useState(null);
  const [entradas,        setEntradas]        = useState(null);
  const [saidas,          setSaidas]          = useState([]);
  const [faturas,         setFaturas]         = useState([]);
  const [loadingRes,      setLoadingRes]      = useState(true);
  const [loadingList,     setLoadingList]     = useState(true);
  const [loadingFat,      setLoadingFat]      = useState(true);
  const [editData,        setEditData]        = useState(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [pagina,          setPagina]          = useState(1);
  const [porPagina,       setPorPagina]       = useState(10);
  const [agrupado,        setAgrupado]        = useState(false);
  const [expanded,        setExpanded]        = useState(new Set());
  const [categoriasLista, setCategoriasLista] = useState(['Todos', ...CATS_DEFAULT]);

  useEffect(() => {
    api.get('/categorias?tipo=saida').then(r => {
      const nomes  = r.data.map(c => c.nome);
      const merged = ['Todos', ...new Set([...nomes, ...CATS_DEFAULT])]
        .sort((a, b) => a === 'Todos' ? -1 : b === 'Todos' ? 1 : a.localeCompare(b, 'pt-BR'));
      setCategoriasLista(merged);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingFat(true);
    api.get(`/saidas/faturas?ano=${ano}`)
      .then(r => setFaturas(r.data?.faturas || []))
      .catch(() => setFaturas([]))
      .finally(() => setLoadingFat(false));
  }, [ano]);

  const carregarResumo = useCallback(async () => {
    try {
      setLoadingRes(true);
      const [r, e] = await Promise.all([
        api.get(`/saidas/resumo-completo?mes=${mes}&ano=${ano}`),
        api.get(`/entradas/resumo?mes=${mes}&ano=${ano}`),
      ]);
      setResumo(r.data);
      setEntradas(e.data);
    } catch { setResumo(null); setEntradas(null); }
    finally   { setLoadingRes(false); }
  }, [mes, ano]);

  const carregarSaidas = useCallback(async () => {
    try {
      setLoadingList(true);
      let url = `/transacoes?mes=${mes}&ano=${ano}&tipo=saida`;
      if (catFiltro !== 'Todos') url += `&categoria=${encodeURIComponent(catFiltro)}`;
      const r = await api.get(url);
      setSaidas(Array.isArray(r.data) ? r.data : []);
    } catch { setSaidas([]); }
    finally   { setLoadingList(false); }
  }, [mes, ano, catFiltro]);

  useEffect(() => { carregarResumo(); },                [carregarResumo]);
  useEffect(() => { carregarSaidas(); setPagina(1); }, [carregarSaidas]);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return saidas;
    const q = busca.toLowerCase();
    return saidas.filter(s => (s.descricao||'').toLowerCase().includes(q) || (s.categoria||'').toLowerCase().includes(q));
  }, [saidas, busca]);

  const totalPags = Math.ceil(filtradas.length / porPagina);
  const paginadas = filtradas.slice((pagina-1)*porPagina, pagina*porPagina);

  const agrupadas = useMemo(() => {
    const g = {};
    filtradas.forEach(s => {
      const c = s.categoria || 'Outros';
      if (!g[c]) g[c] = { nome:c, total:0, itens:[] };
      g[c].total += Math.abs(parseFloat(s.valor)||0);
      g[c].itens.push(s);
    });
    return Object.values(g).sort((a, b) => b.total - a.total);
  }, [filtradas]);

  const toggleGroup = n => setExpanded(p => { const nx=new Set(p); nx.has(n)?nx.delete(n):nx.add(n); return nx; });

  const excluir = async id => {
    if (!window.confirm('Excluir esta saída?')) return;
    try { await api.delete(`/transacoes/${id}`); carregarSaidas(); carregarResumo(); }
    catch { alert('Erro ao excluir.'); }
  };
  const editar   = s => { setEditData({ ...s, valor:s.valor?.toString(), data:(s.data||'').split('T')[0] }); setModalOpen(true); };
  const duplicar = s => { setEditData({ ...s, id:undefined, data:today(), valor:s.valor?.toString() }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditData(null); };
  const onSuccess  = () => { carregarSaidas(); carregarResumo(); closeModal(); };

  const R    = resumo   || {};
  const cats = R.categorias || [];
  const proxs = R.proximasSaidas || [];

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      <div style={S.page}>

        {/* HEADER */}
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Saídas</h1>
            <p style={S.sub}>Controle e classifique todos os seus gastos.</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={S.btnExp}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
            <button style={S.btnNew} onClick={() => { setEditData(null); setModalOpen(true); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova saída
            </button>
          </div>
        </div>

        {/* MENU DE CATEGORIAS — cards horizontais com ícone + valor + % */}
        <CatMenu cats={cats} total={R.totalMes||0} catFiltro={catFiltro} setCatFiltro={setCatFiltro} />

        {/* ÁREA OPERACIONAL POR CATEGORIA */}
        <CatArea catFiltro={catFiltro} cats={cats} total={R.totalMes||0} />

        {/* RESUMO DO PERÍODO — 6 blocos */}
        <ResumoPeriodo R={R} E={entradas} mes={mes} ano={ano} loading={loadingRes} />

        {/* RADAR FINANCEIRO — 4 insight cards */}
        {!loadingRes && <RadarFinanceiro R={R} E={entradas} cats={cats} mes={mes} />}

        {/* FILTROS */}
        <div style={{ display:'flex',alignItems:'center',gap:8,background:'#fff',borderRadius:10,border:'0.5px solid #E5E7EB',padding:'9px 14px',flexWrap:'wrap',marginBottom:14 }}>
          <span style={{ fontSize:11,color:'#9CA3AF',fontWeight:500,whiteSpace:'nowrap' }}>Mês:</span>
          {MESES.map((m,i) => (
            <button key={m}
              style={{ padding:'3px 8px',borderRadius:20,fontSize:'11px',fontWeight:500,cursor:'pointer',border:'none',background:mes===i+1?'#EF4444':'transparent',color:mes===i+1?'#fff':'#6B7280',fontFamily:'inherit' }}
              onClick={() => setMes(i+1)}>{m}</button>
          ))}
          <input
            style={{ flex:1,minWidth:140,padding:'6px 11px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:'13px',color:'#111827',outline:'none',fontFamily:'inherit' }}
            placeholder="Buscar descrição ou categoria…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {/* GRID: tabela + sidebar */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 296px', gap:14, alignItems:'flex-start' }}>

          {/* TABELA */}
          <div style={S.card}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
              <div style={{ fontSize:13,fontWeight:600,color:'#111827' }}>
                Saídas de {MESES_FULL[mes-1]}
                {filtradas.length>0 && <span style={{ fontSize:11,color:'#9CA3AF',fontWeight:400,marginLeft:7 }}>{filtradas.length} lançamento{filtradas.length!==1?'s':''}</span>}
              </div>
              <div style={{ display:'flex',gap:5,alignItems:'center' }}>
                <div style={{ display:'flex',gap:2 }}>
                  {[5,10,20].map(n => (
                    <button key={n} onClick={() => { setPorPagina(n); setPagina(1); }}
                      style={{ padding:'3px 7px',borderRadius:5,border:'1px solid #E5E7EB',fontFamily:'inherit',fontSize:11,background:porPagina===n?'#EF4444':'#fff',color:porPagina===n?'#fff':'#6B7280',cursor:'pointer' }}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setAgrupado(a => !a)}
                  style={{ padding:'3px 10px',borderRadius:5,border:'1px solid #E5E7EB',fontFamily:'inherit',fontSize:11,background:agrupado?'#111827':'#fff',color:agrupado?'#fff':'#6B7280',cursor:'pointer' }}>
                  {agrupado ? 'Agrupar ✓' : 'Agrupar'}
                </button>
              </div>
            </div>

            {loadingList ? (
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>{[1,2,3].map(i => <Skel key={i} h={42} />)}</div>
            ) : agrupado ? (
              agrupadas.length===0 ? <div style={S.empty}>Nenhuma saída encontrada.</div> : (
                agrupadas.map(g => (
                  <div key={g.nome} style={{ marginBottom:8,border:'1px solid #F3F4F6',borderRadius:8,overflow:'hidden' }}>
                    <div onClick={() => toggleGroup(g.nome)}
                      style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 14px',background:'#FAFAFA',cursor:'pointer' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                        <span style={{ width:8,height:8,borderRadius:'50%',background:cor(g.nome),flexShrink:0 }} />
                        <span style={{ fontSize:13,fontWeight:600,color:'#111827' }}>{g.nome}</span>
                        <span style={{ fontSize:11,color:'#9CA3AF' }}>{g.itens.length} lançamento{g.itens.length!==1?'s':''}</span>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <span style={{ fontSize:13,fontWeight:700,color:'#DC2626' }}>{fmt(g.total)}</span>
                        <span style={{ fontSize:11,color:'#9CA3AF' }}>{expanded.has(g.nome)?'▲':'▼'}</span>
                      </div>
                    </div>
                    {expanded.has(g.nome) && (
                      <table style={S.table}><tbody>
                        {g.itens.map(s => (
                          <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <td style={S.td}>{fmtDate(s.data)}</td>
                            <td style={S.td}>{s.descricao}</td>
                            <td style={{ ...S.td,...S.tdRed }}>{fmt(s.valor)}</td>
                            <td style={S.td}>
                              <div style={{ display:'flex',gap:2 }}>
                                <button style={S.actBtn} onClick={() => editar(s)}>✏️</button>
                                <button style={S.actBtn} onClick={() => excluir(s.id)}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody></table>
                    )}
                  </div>
                ))
              )
            ) : paginadas.length===0 ? (
              <div style={S.empty}>Nenhuma saída para o período selecionado.</div>
            ) : (
              <>
                <table style={S.table}>
                  <thead><tr>{['Data','Descrição','Categoria','Valor','Ações'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {paginadas.map(s => (
                      <tr key={s.id} onMouseEnter={e=>e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={S.td}>{fmtDate(s.data)}</td>
                        <td style={S.td}>{s.descricao}</td>
                        <td style={S.td}>
                          <span style={{ display:'inline-flex',alignItems:'center',gap:5 }}>
                            <span style={{ width:7,height:7,borderRadius:'50%',background:cor(s.categoria),flexShrink:0 }} />
                            {s.categoria||'Outros'}
                          </span>
                        </td>
                        <td style={{ ...S.td,...S.tdRed }}>{fmt(s.valor)}</td>
                        <td style={S.td}>
                          <div style={{ display:'flex',gap:2 }}>
                            <button style={S.actBtn} title="Editar"   onClick={() => editar(s)}>✏️</button>
                            <button style={S.actBtn} title="Duplicar" onClick={() => duplicar(s)}>📋</button>
                            <button style={S.actBtn} title="Excluir"  onClick={() => excluir(s.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPags>1 && (
                  <div style={{ display:'flex',gap:5,marginTop:12,justifyContent:'center' }}>
                    {Array.from({length:totalPags},(_,i)=>i+1).map(p => (
                      <button key={p} onClick={() => setPagina(p)}
                        style={{ padding:'4px 9px',borderRadius:6,border:'1px solid #E5E7EB',background:pagina===p?'#EF4444':'#fff',color:pagina===p?'#fff':'#374151',cursor:'pointer',fontSize:12,fontFamily:'inherit' }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
            <span style={{ display:'inline-flex',alignItems:'center',gap:4,color:'#EF4444',fontSize:12,fontWeight:500,cursor:'pointer',marginTop:10 }}
              onClick={() => navigate('/transacoes')}>
              Ver todas as transações →
            </span>
          </div>

          {/* SIDEBAR */}
          <Sidebar proximas={proxs} cats={cats} faturas={faturas} loadingFat={loadingFat} mes={mes} />
        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.32)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 }}
          onClick={e => { if(e.target===e.currentTarget) closeModal(); }}>
          <div style={{ background:'#fff',borderRadius:14,padding:24,width:480,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.16)' }}>
            <div style={{ fontSize:15,fontWeight:600,color:'#111827',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span>{editData?.id ? 'Editar saída' : 'Nova saída'}</span>
              <button style={{ background:'none',border:'none',fontSize:17,cursor:'pointer',color:'#9CA3AF' }} onClick={closeModal}>✕</button>
            </div>
            <FormSaida editData={editData} onSuccess={onSuccess} onCancel={closeModal} categoriasLista={categoriasLista} />
          </div>
        </div>
      )}
    </Layout>
  );
}
