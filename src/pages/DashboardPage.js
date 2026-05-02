import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../Components/Layout/Layout';

// Constantes
const MESES   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_F = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const BG_MAP    = { ok: '#DCFCE7', atencao: '#FEF3C7', critico: '#FEE2E2' };
const COR_MAP   = { ok: '#15803D', atencao: '#92400E', critico: '#991B1B' };
const BADGE_MAP = { ok: 'Saudável', atencao: 'Atenção', critico: 'Crítico' };

const fmt  = v => 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
const fmtS = v => (v >= 0 ? '+' : '-') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR');

const TETO = 7000;

const DADOS_MOCK = [
  { e: 6740, s: 6325, sd: 415,  score: 62, cor: '#F59E0B', status: 'atencao' },
  { e: 6790, s: 7627, sd: -837, score: 38, cor: '#EF4444', status: 'critico' },
  { e: 6626, s: 6037, sd: 589,  score: 68, cor: '#F59E0B', status: 'atencao' },
  { e: 7226, s: 6637, sd: 589,  score: 71, cor: '#F59E0B', status: 'atencao' },
  null, null, null, null, null, null, null, null,
];

const PMAS = [
  { txt: 'Aumente o aporte da reserva de R$ 200 para R$ 500/mes — conclui em Jun/2027', btn: 'Ver metas' },
  { txt: 'Reduza R$ 363 em saidas para voltar ao limite mensal planejado', btn: 'Ver categorias' },
  { txt: 'Cartão C6 = 37,8% das saidas — revise o limite deste cartão', btn: 'Ver cartões' },
  { txt: 'Taxa de poupança em 8,2% — meta é 20%. Redirecione R$ 800/mes para metas', btn: 'Ver planejamento' },
];

const INSIGHTS = [
  { tipo: 'alert', cat: 'Cartões acima do ideal',    txt: 'Cartões = 50% das saidas. Ideal é abaixo de 40%. Revise os limites mensais.', cta: 'Ver cartões' },
  { tipo: 'info',  cat: 'Comparativo de perfil',     txt: 'Usuários com perfil semelhante guardam 12% da renda. Você guarda 8,2%.', cta: 'Ver metas' },
  { tipo: 'ok',    cat: 'Conquista do mês',           txt: 'Abril foi o melhor mês do ano — saídas cairam 13% e saldo fechou positivo.', cta: 'Ver fluxo' },
  { tipo: 'alert', cat: 'Reserva crítica',            txt: 'Reserva cobre 1,8 meses. O recomendado para o seu padrão é 6 meses.', cta: 'Ajustar' },
  { tipo: 'warn',  cat: 'Tendência 2026',             txt: 'Inflação em alimentação subiu 4,2%. Reavalie o orçamento da categoria Mercado.', cta: 'Ver categoria' },
  { tipo: 'ok',    cat: 'Meta próxima',               txt: 'Viagem de férias está a R$ 1.600 da conclusão — possível encerrar em Maio.', cta: 'Ver meta' },
  { tipo: 'info',  cat: 'Planejamento',               txt: 'Aumentar R$ 120/mes na reserva adianta sua segurança financeira em 18 meses.', cta: 'Simular' },
  { tipo: 'warn',  cat: 'Padrão de consumo',          txt: 'Gastos em cartões cresceram 8% nos últimos 3 meses. Fique atento.', cta: 'Analisar' },
];

const COR_BORDA = { alert: '#FECACA', ok: '#BBF7D0', warn: '#FDE68A', info: '#BFDBFE' };
const BG_RI     = { alert: '#FEF2F2', ok: '#F0FDF4', warn: '#FFFBEB', info: '#EFF6FF' };
const COR_CAT   = { alert: '#EF4444', ok: '#16A34A', warn: '#D97706', info: '#3B82F6' };

// Estilos base
const card = {
  background: 'white', borderRadius: 11,
  border: '1px solid #F1F3F5', padding: '16px 18px',
};
const cardTitle = {
  fontSize: 15, fontWeight: 600, color: '#111827',
  marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const cardLink = { fontSize: 12, color: '#3B82F6', fontWeight: 400, cursor: 'pointer' };

// IcoEdit
function IcoEdit() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
}

// Modal edição
function ModalEdicao({ titulo, subtitulo, saldoAtual, metaValor, onSalvar, onClose, logItems }) {
  const [tabIdx, setTabIdx] = useState(0);
  const [saldo, setSaldo]   = useState(saldoAtual);
  const [aporte, setAporte] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const tabs  = ['Atualizar saldo', '+ Aporte', 'Histórico'];

  const handleSalvar = () => {
    const v = tabIdx === 0 ? Number(saldo) : Number(saldo) + Number(aporte);
    if (!v) return;
    onSalvar(v); onClose();
  };

  const inp = { width: '100%', padding: '9px 11px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' };
  const lbl = { display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 360, boxShadow: '0 16px 48px rgba(0,0,0,.12)', border: '1px solid #E9ECEF' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{titulo}</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>{subtitulo}</div>
        <div style={{ display: 'flex', borderBottom: '1px solid #E9ECEF', marginBottom: 16 }}>
          {tabs.map((t, i) => (
            <div key={i} onClick={() => setTabIdx(i)}
              style={{ fontSize: 12, fontWeight: 500, padding: '7px 14px', cursor: 'pointer', color: tabIdx === i ? '#3B82F6' : '#9CA3AF', borderBottom: tabIdx === i ? '2px solid #3B82F6' : '2px solid transparent' }}>
              {t}
            </div>
          ))}
        </div>
        {tabIdx === 0 && (
          <div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Saldo atual (R$)</label><input style={inp} type="number" value={saldo} onChange={e => setSaldo(e.target.value)} />{metaValor && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>Meta: R$ {metaValor.toLocaleString('pt-BR')}</div>}</div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Data de referência</label><input style={inp} type="date" defaultValue={today} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleSalvar} style={{ flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Atualizar saldo</button>
            </div>
          </div>
        )}
        {tabIdx === 1 && (
          <div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Valor do aporte (R$)</label><input style={inp} type="number" placeholder="0,00" value={aporte} onChange={e => setAporte(e.target.value)} /><div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>Será somado ao saldo atual de {fmt(saldoAtual)}</div></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Descrição (opcional)</label><input style={inp} type="text" placeholder="Ex: CDB, Tesouro Direto..." /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Data</label><input style={inp} type="date" defaultValue={today} /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={onClose} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={handleSalvar} style={{ flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar aporte</button>
            </div>
          </div>
        )}
        {tabIdx === 2 && (
          <div>
            {logItems.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < logItems.length - 1 ? '1px solid #F7F8FA' : 'none', fontSize: 12 }}>
                <span>{l.desc}</span><span style={{ fontWeight: 600, color: l.cor }}>{l.val}</span><span style={{ fontSize: 10, color: '#9CA3AF' }}>{l.data}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}><button onClick={onClose} style={{ padding: '8px 20px', background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Fechar</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Gráfico de saldo
function GraficoSaldo({ dados }) {
  const [tooltip, setTooltip] = useState(null);
  const saldos    = dados.map(d => d ? d.sd : null);
  const comDados  = saldos.filter(v => v !== null);
  const positivos = comDados.filter(v => v > 0);
  const negativos = comDados.filter(v => v < 0);
  const totalAcum = comDados.reduce((s, v) => s + v, 0);
  const absMax    = Math.max(...comDados.map(v => Math.abs(v)), 1);
  const maxH      = 110;

  return (
    <div style={card}>
      <div style={cardTitle}>
        Saldo por mês · 2026
        <span style={cardLink}>ver fluxo</span>
      </div>
      {/* Pills */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
        {[
          { cor: '#86EFAC', bg: '#F0FDF4', txt: `${positivos.length} positivos` },
          { cor: '#FCA5A5', bg: '#FEF2F2', txt: `${negativos.length} negativo` },
          { cor: '#D1D5DB', bg: '#F7F8FA', txt: `${saldos.filter(v => v === null).length} sem dados` },
        ].map((p, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: p.bg, color: '#374151' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.cor }} />{p.txt}
          </div>
        ))}
      </div>
      {/* Barras */}
      <div style={{ height: 110, display: 'flex', alignItems: 'flex-end', gap: 5, paddingTop: 22, position: 'relative' }}>
        {MESES.map((m, i) => {
          const val  = saldos[i];
          const fut  = val === null;
          const pos  = !fut && val >= 0;
          const cor  = fut ? '#F1F5F9' : pos ? '#86EFAC' : '#FCA5A5';
          const corV = fut ? '#D1D5DB' : pos ? '#16A34A' : '#EF4444';
          const h    = fut ? 4 : Math.max(4, Math.round(Math.abs(val) / absMax * maxH));
          const valTxt = fut ? '' : (pos ? '+' : '-') + 'R$ ' + Math.abs(val).toLocaleString('pt-BR');

          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: fut ? 'default' : 'pointer', position: 'relative' }}
              onMouseEnter={e => { if (!fut) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ x: r.left + r.width / 2, y: r.top - 38, m, val, pos }); }}}
              onMouseLeave={() => setTooltip(null)}>
              <div style={{ fontSize: 9, fontWeight: 700, position: 'absolute', top: -17, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: corV }}>{valTxt}</div>
              <div style={{ width: '100%', height: h, background: cor, borderRadius: '4px 4px 0 0', minHeight: 3 }} />
              <div style={{ fontSize: 11, color: fut ? '#D1D5DB' : '#9CA3AF', fontWeight: 500 }}>{m}</div>
            </div>
          );
        })}
        {tooltip && (
          <div style={{ position: 'fixed', background: '#111827', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 200, left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}>
            {tooltip.m} · <span style={{ color: tooltip.pos ? '#86EFAC' : '#FCA5A5' }}>{tooltip.pos ? '+' : '-'}R$ {Math.abs(tooltip.val).toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>
      {/* Bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #F7F8FA' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ cor: '#86EFAC', txt: 'Positivo' }, { cor: '#FCA5A5', txt: 'Negativo' }, { cor: '#F1F5F9', txt: 'Sem dados' }].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.cor }} />{l.txt}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: totalAcum >= 0 ? '#16A34A' : '#EF4444' }}>Acumulado: {fmtS(totalAcum)}</div>
      </div>
    </div>
  );
}

// Radar Financeiro — 10s, pausa no hover
function RadarFinanceiro() {
  const [idx, setIdx]       = useState(0);
  const [fade, setFade]     = useState(true);
  const [paused, setPaused] = useState(false);
  const [timer, setTimer]   = useState(10);
  const total = Math.ceil(INSIGHTS.length / 2);

  const transRadar = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); setTimer(10); }, 450);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { transRadar((idx + 1) % total); return 10; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, paused, total, transRadar]);

  const i1 = INSIGHTS[idx * 2];
  const i2 = INSIGHTS[(idx * 2 + 1) % INSIGHTS.length];

  return (
    <div style={card} onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); setTimer(10); }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Radar Financeiro
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#3B82F6', background: '#EFF6FF', padding: '3px 8px', borderRadius: 10, fontWeight: 600 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />Ao vivo
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity .5s, transform .5s' }}>
        {[i1, i2].map((ins, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 9, border: `1px solid ${COR_BORDA[ins.tipo]}`, background: BG_RI[ins.tipo] }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: COR_CAT[ins.tipo], marginBottom: 6 }}>{ins.cat}</div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginBottom: 6 }}>{ins.txt}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', cursor: 'pointer' }}>{ins.cta} →</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} onClick={() => transRadar(i)} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#3B82F6' : '#E9ECEF', cursor: 'pointer', transition: 'background .2s' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#D1D5DB' }}>{paused ? 'pausado' : `próximo em ${timer}s`}</div>
      </div>
    </div>
  );
}

// PMA
function PMA() {
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);

  const transPMA = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 300);
  }, []);

  useEffect(() => {
    const t = setInterval(() => transPMA((idx + 1) % PMAS.length), 7000);
    return () => clearInterval(t);
  }, [idx, transPMA]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111827', borderRadius: 10, padding: '11px 18px', marginBottom: 14 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Ação agora</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'white', flex: 1, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(-5px)', transition: 'opacity .4s, transform .4s' }}>
        {PMAS[idx].txt}
      </span>
      <button style={{ fontSize: 12, color: '#93C5FD', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{PMAS[idx].btn} →</button>
      <div style={{ display: 'flex', gap: 4 }}>
        {PMAS.map((_, i) => (
          <div key={i} onClick={() => transPMA(i)} style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );
}

// Página principal
export default function DashboardPage() {
  const [ativo, setAtivo]             = useState(3);
  const [modalGuardado, setModalGuardado] = useState(false);
  const [modalReserva, setModalReserva]   = useState(false);
  const [saldoGuardado, setSaldoGuardado] = useState(756);
  const [saldoReserva,  setSaldoReserva]  = useState(1800);
  const [hoverGuardado, setHoverGuardado] = useState(false);
  const [hoverReserva,  setHoverReserva]  = useState(false);

  const d      = DADOS_MOCK[ativo];
  const status = d?.status || 'atencao';
  const pct    = d ? Math.round(d.s / TETO * 100) : 0;
  const gaugeColor = pct > 100 ? '#EF4444' : pct > 80 ? '#F59E0B' : '#16A34A';
  const gaugeBadge = pct > 100
    ? { bg: '#FEE2E2', cor: '#991B1B', txt: 'Teto ultrapassado!' }
    : pct > 80
    ? { bg: '#FEF3C7', cor: '#92400E', txt: `Atenção — ${pct}% usado` }
    : { bg: '#DCFCE7', cor: '#15803D', txt: `${pct}% — dentro do limite` };

  const pctReserva   = Math.round(saldoReserva / 12000 * 100);
  const mesesReserva = (saldoReserva / 700).toFixed(1);

  const LOG_GUARDADO = [
    { desc: 'Saldo inicial 2026', val: 'R$ 0',    cor: '#3B82F6', data: 'Jan/2026' },
    { desc: 'Aporte CDB',         val: '+R$ 400', cor: '#16A34A', data: 'Fev/2026' },
    { desc: 'Atualização manual', val: '+R$ 356', cor: '#16A34A', data: 'Abr/2026' },
    { desc: 'Saldo atual',        val: fmt(saldoGuardado), cor: '#3B82F6', data: '' },
  ];
  const LOG_RESERVA = [
    { desc: 'Saldo inicial 2026', val: 'R$ 1.200', cor: '#3B82F6', data: 'Jan/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Fev/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Mar/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Abr/2026' },
    { desc: 'Saldo atual',        val: fmt(saldoReserva), cor: '#0F766E', data: '' },
  ];

  // Estilo do botão editar
  const btnEdit = (hover) => ({
    position: 'absolute', top: 10, right: 10,
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.18)',
    borderRadius: 6, padding: '4px 9px', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 10, fontWeight: 500, color: 'white',
    opacity: hover ? 1 : 0, transition: 'opacity .15s',
  });

  return (
    <Layout>
      <div style={{ padding: '18px 24px', maxWidth: 1280, margin: '0 auto', background: '#F7F8FA', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', letterSpacing: '-.4px' }}>Visão Mensal</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
              {MESES_F[ativo]} 2026 · Well e Amanda
              {d && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: BG_MAP[status], color: COR_MAP[status] }}>
                  {status === 'ok' ? '🟢' : status === 'atencao' ? '🟡' : '🔴'} {BADGE_MAP[status]} · {d.score}/100
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'white', color: '#374151', border: '1px solid #E9ECEF', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>Exportar</button>
            <button style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Lançamento</button>
          </div>
        </div>

        {/* Seletor de meses */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid #E9ECEF', overflowX: 'auto' }}>
          {MESES.map((m, i) => {
            const md  = DADOS_MOCK[i];
            const fut = !md;
            const pos = md && md.sd >= 0;
            const on  = i === ativo;
            return (
              <div key={i} onClick={() => !fut && setAtivo(i)}
                style={{ padding: '9px 14px 10px', fontSize: 13, fontWeight: 500, textAlign: 'center', flexShrink: 0, cursor: fut ? 'default' : 'pointer', borderBottom: on ? '2px solid #3B82F6' : '2px solid transparent', color: fut ? '#D1D5DB' : on ? '#3B82F6' : pos ? '#374151' : '#DC2626' }}>
                {i === 3 && md ? '★ ' : ''}{m}
                {md && <span style={{ fontSize: 10, display: 'block', marginTop: 2, fontWeight: 600, color: md.cor }}>{md.score}</span>}
              </div>
            );
          })}
        </div>

        {/* PMA */}
        <PMA />

        {/* Cards destaque */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
          {/* Dinheiro Guardado */}
          <div style={{ borderRadius: 11, padding: '16px 18px', background: '#1D4ED8', position: 'relative' }}
            onMouseEnter={() => setHoverGuardado(true)} onMouseLeave={() => setHoverGuardado(false)}>
            <button style={btnEdit(hoverGuardado)} onClick={() => setModalGuardado(true)}><IcoEdit /> Editar</button>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, color: '#BFDBFE' }}>Dinheiro guardado</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.5px', color: 'white' }}>{fmt(saldoGuardado)}</div>
            <div style={{ fontSize: 12, marginBottom: 10, color: '#93C5FD' }}>Investimentos além da reserva</div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}><div style={{ height: '100%', width: `${Math.min(saldoGuardado / 10000 * 100, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} /></div>
          </div>
          {/* Reserva */}
          <div style={{ borderRadius: 11, padding: '16px 18px', background: '#0F766E', position: 'relative' }}
            onMouseEnter={() => setHoverReserva(true)} onMouseLeave={() => setHoverReserva(false)}>
            <button style={btnEdit(hoverReserva)} onClick={() => setModalReserva(true)}><IcoEdit /> Editar</button>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, color: '#99F6E4' }}>Reserva de segurança</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.5px', color: 'white' }}>{fmt(saldoReserva)}</div>
            <div style={{ fontSize: 12, marginBottom: 10, color: '#5EEAD4' }}>{pctReserva}% da meta · {mesesReserva} meses</div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}><div style={{ height: '100%', width: `${Math.min(pctReserva, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} /></div>
          </div>
          {/* Metas */}
          <div style={{ borderRadius: 11, padding: '16px 18px', background: '#6D28D9' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, color: '#DDD6FE' }}>Metas ativas</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.5px', color: 'white' }}>3 metas</div>
            <div style={{ fontSize: 12, marginBottom: 10, color: '#C4B5FD' }}>Viagem 68% · Carro 32% · Reserva 15%</div>
            <div style={{ display: 'flex', gap: 2, marginTop: 8 }}><div style={{ height: 3, flex: 68, background: 'rgba(255,255,255,.7)', borderRadius: 1 }} /><div style={{ height: 3, flex: 32, background: 'rgba(255,255,255,.2)', borderRadius: 1 }} /></div>
          </div>
          {/* Limite */}
          <div style={{ borderRadius: 11, padding: '16px 18px', background: '#B45309' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, color: '#FDE68A' }}>Limite restante</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.5px', color: 'white' }}>{fmt(Math.max(0, TETO - (d?.s || 0)))}</div>
            <div style={{ fontSize: 12, marginBottom: 10, color: '#FCD34D' }}>{100 - pct}% do teto · {fmt(TETO)}/mês</div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}><div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} /></div>
          </div>
        </div>

        {/* KPIs + Maior Gasto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {/* Entradas */}
          <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '11px 11px 0 0', background: '#3B82F6' }} />
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Entradas</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.6px', color: '#111827' }}>{d ? fmt(d.e) : '–'}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Salário + extras</div>
            <div style={{ fontSize: 13, marginTop: 6, fontWeight: 500, color: '#16A34A' }}>Estável vs mês anterior</div>
          </div>
          {/* Saídas */}
          <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '11px 11px 0 0', background: '#EF4444' }} />
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Saídas</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.6px', color: '#DC2626' }}>{d ? fmt(d.s) : '–'}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Cartões lideram (50%)</div>
            <div style={{ fontSize: 13, marginTop: 6, fontWeight: 500, color: '#16A34A' }}>-13% vs mês anterior</div>
          </div>
          {/* Saldo */}
          <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '11px 11px 0 0', background: '#16A34A' }} />
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Saldo</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: '-.6px', color: d && d.sd >= 0 ? '#16A34A' : '#EF4444' }}>{d ? fmt(d.sd) : '–'}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>8,2% da renda guardada</div>
            <div style={{ fontSize: 13, marginTop: 6, fontWeight: 500, color: '#3B82F6' }}>Melhor mês do ano</div>
          </div>
          {/* Teto */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Teto de gastos</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: 2, letterSpacing: '-1px' }}>{pct}%</div>
            <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>do orçamento utilizado</div>
            <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: gaugeColor, borderRadius: 4, transition: 'width .4s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
              <span>Gasto: <strong style={{ color: '#DC2626' }}>{d ? fmt(d.s) : '–'}</strong></span>
              <span>{fmt(TETO)}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: gaugeBadge.bg, color: gaugeBadge.cor }}>{gaugeBadge.txt}</div>
          </div>
          {/* Maior Gasto */}
          <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#EF4444', borderRadius: '11px 11px 0 0' }} />
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Maior gasto</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Cartão C6</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626', marginBottom: 3, letterSpacing: '-.6px' }}>R$ 2.450</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>37,8% das saídas de Abril</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#FEE2E2', color: '#B91C1C' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              Alto impacto
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, lineHeight: 1.4 }}>Mais de 1/3 dos gastos vieram daqui.</div>
          </div>
        </div>

        {/* Gráfico + Categorias + Saúde */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr', gap: 10, marginBottom: 12 }}>
          <GraficoSaldo dados={DADOS_MOCK} />

          {/* Categorias expandidas */}
          <div style={card}>
            <div style={cardTitle}>Categorias</div>
            {/* Destaque maior */}
            <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1px solid #FECACA' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Maior impacto</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Cartões</div>
              <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>R$ 3.306 · 50% das saídas</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>+12% vs Março — atenção</div>
            </div>
            {[
              { cor: '#EF4444', nome: 'Cartões',  pct: 100, val: 'R$ 3.306', p: '50%' },
              { cor: '#3B82F6', nome: 'Mercado',  pct: 24,  val: 'R$ 784',   p: '12%' },
              { cor: '#16A34A', nome: 'Casa',     pct: 13,  val: 'R$ 437',   p: '7%' },
              { cor: '#F59E0B', nome: 'Carro',    pct: 3,   val: 'R$ 94',    p: '1%' },
              { cor: '#A78BFA', nome: 'Outros',   pct: 4,   val: 'R$ 116',   p: '2%' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 4 ? 10 : 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: 3, background: c.cor, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, width: 62 }}>{c.nome}</div>
                <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.cor, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', minWidth: 60, textAlign: 'right' }}>{c.val}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', minWidth: 28, textAlign: 'right' }}>{c.p}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F7F8FA', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>Total saídas</span>
              <span style={{ fontWeight: 700, color: '#DC2626' }}>R$ 6.637</span>
            </div>
          </div>

          {/* Saúde expandida */}
          <div style={card}>
            <div style={cardTitle}>Saúde financeira</div>
            {[
              { lbl: 'Poupança',  val: '8,2%',     cor: '#F59E0B', pct: 41, ctx: 'Meta 20% · Jan–Abr 2026' },
              { lbl: 'Teto',      val: '94%',       cor: '#F59E0B', pct: 94, ctx: 'R$ 363 disponíveis' },
              { lbl: 'Metas',     val: '38%',       cor: '#3B82F6', pct: 38, ctx: '3 metas ativas' },
              { lbl: 'Reserva',   val: '1,8 meses', cor: '#EF4444', pct: 30, ctx: 'Ideal 6 meses · crítico' },
            ].map((sf, i) => (
              <div key={i} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{sf.lbl}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: sf.cor }}>{sf.val}</span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sf.pct}%`, background: sf.cor, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{sf.ctx}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr 190px', gap: 10, marginBottom: 12 }}>
          {/* Comparativos */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Comparativos</div>
            {[
              { lbl: 'vs Março 2026', rows: [{ arrow: '↑', cor: '#16A34A', lbl: 'Entradas', val: '+9%' }, { arrow: '↓', cor: '#16A34A', lbl: 'Saídas', val: '-13%' }, { arrow: '↑', cor: '#3B82F6', lbl: 'Saldo', val: 'melhor' }] },
              { lbl: 'vs Média Jan–Abr', rows: [{ arrow: '↑', cor: '#16A34A', lbl: 'Entradas', val: '+5%' }, { arrow: '↓', cor: '#16A34A', lbl: 'Saídas', val: '-3%' }, { arrow: '↓', cor: '#F59E0B', lbl: 'Poupança', val: 'abaixo' }] },
            ].map((grupo, gi) => (
              <div key={gi} style={{ marginBottom: gi === 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 9 }}>{grupo.lbl}</div>
                {grupo.rows.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, width: 20, color: row.cor }}>{row.arrow}</span>
                    <span style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>{row.lbl}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: row.cor }}>{row.val}</span>
                  </div>
                ))}
                {gi === 0 && <div style={{ height: 1, background: '#F1F3F5', margin: '10px 0' }} />}
              </div>
            ))}
          </div>

          {/* Radar */}
          <RadarFinanceiro />

          {/* Metas */}
          <div style={card}>
            <div style={cardTitle}>
              Metas em andamento
              <span style={cardLink}>ver todas</span>
            </div>
            {[
              { nome: 'Viagem',  pct: 68, cor: '#3B82F6', ctx: 'Faltam R$ 1.600 · Dez/2026', ctxCor: '#9CA3AF' },
              { nome: 'Carro',   pct: 32, cor: '#16A34A', ctx: 'Faltam R$ 10.200 · Jun/2027', ctxCor: '#9CA3AF' },
              { nome: 'Reserva', pct: 15, cor: '#EF4444', ctx: 'Em risco — ritmo lento', ctxCor: '#EF4444' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: i < 2 ? '1px solid #F7F8FA' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{m.nome}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: m.cor }}>{m.pct}%</span>
                </div>
                <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.cor, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: m.ctxCor, marginTop: 3 }}>{m.ctx}</div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600, marginBottom: 10 }}>Score financeiro</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }}>{d?.score || 71}</div>
            <div style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 10 }}>/100</div>
            <div style={{ fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 20, marginBottom: 14, display: 'inline-block', background: BG_MAP[status], color: COR_MAP[status] }}>
              {status === 'ok' ? '🟢' : status === 'atencao' ? '🟡' : '🔴'} {BADGE_MAP[status]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
              {[
                { cor: '#16A34A', txt: 'Saldo positivo',    ok: true },
                { cor: '#16A34A', txt: 'Melhor mês',        ok: true },
                { cor: '#F59E0B', txt: 'Teto em 94%',       ok: false },
                { cor: '#EF4444', txt: 'Reserva crítica',   ok: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: item.cor, fontWeight: 500 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    {item.ok ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/> : <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>}
                  </svg>
                  {item.txt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo anual */}
        <div style={{ background: '#111827', borderRadius: 11, padding: '16px 22px', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr auto', gap: 14, alignItems: 'center' }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Resumo 2026</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Jan – Abr</div></div>
          {[
            { l: 'Entradas',    v: 'R$ 27.382', cor: '#BFDBFE' },
            { l: 'Saídas',      v: 'R$ 26.626', cor: '#FECACA' },
            { l: 'Saldo',       v: 'R$ 756',    cor: '#86EFAC' },
            { l: 'Score médio', v: '63/100',     cor: '#FDE68A' },
            { l: 'Melhor mês',  v: 'Abril →',   cor: 'white' },
            { l: 'Pior mês',    v: 'Fevereiro',  cor: '#FECACA' },
            { l: 'Diagnóstico', v: 'Em recuperação', cor: '#FDE68A' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>{item.l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.cor }}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Modais */}
        {modalGuardado && (
          <ModalEdicao titulo="Dinheiro guardado" subtitulo="Investimentos além da reserva de segurança" saldoAtual={saldoGuardado} metaValor={null}
            onSalvar={setSaldoGuardado} onClose={() => setModalGuardado(false)} logItems={LOG_GUARDADO} />
        )}
        {modalReserva && (
          <ModalEdicao titulo="Reserva de segurança" subtitulo="Valor guardado para emergências" saldoAtual={saldoReserva} metaValor={12000}
            onSalvar={setSaldoReserva} onClose={() => setModalReserva(false)} logItems={LOG_RESERVA} />
        )}

      </div>
    </Layout>
  );
}
