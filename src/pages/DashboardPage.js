import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout/Layout';

const MESES   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_F = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const BG_MAP    = { ok: '#DCFCE7', atencao: '#FEF3C7', critico: '#FEE2E2' };
const COR_MAP   = { ok: '#15803D', atencao: '#92400E', critico: '#991B1B' };
const BADGE_MAP = { ok: '🟢 Saudável', atencao: '🟡 Atenção', critico: '🔴 Crítico' };

const fmt  = v => 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
const fmtS = v => (v >= 0 ? '+' : '-') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR');

const DADOS_MOCK = [
  { e: 6740, s: 6325, sd: 415,  score: 62, cor: '#F59E0B', status: 'atencao' },
  { e: 6790, s: 7627, sd: -837, score: 38, cor: '#EF4444', status: 'critico' },
  { e: 6626, s: 6037, sd: 589,  score: 68, cor: '#F59E0B', status: 'atencao' },
  { e: 7226, s: 6637, sd: 589,  score: 71, cor: '#F59E0B', status: 'atencao' },
  null, null, null, null, null, null, null, null,
];

const TETO = 7000;

const PMAS = [
  { txt: 'Aumente o aporte da reserva de R$ 200 para R$ 500/mês — conclui em Jun/2027', btn: 'Ver metas →' },
  { txt: 'Reduza R$ 363 em saídas para voltar ao limite mensal planejado', btn: 'Ver categorias →' },
  { txt: 'Sua meta Viagem pode fechar em Maio — faltam apenas R$ 1.600', btn: 'Ver meta →' },
  { txt: 'Cartões = 50% das saídas — revise o limite por cartão', btn: 'Ver cartões →' },
  { txt: 'Taxa de poupança em 8,2% — meta é 20%. Redirecione para metas', btn: 'Ver planejamento →' },
];

const INSIGHTS = [
  { tipo: 'alert', cat: 'Cartões acima do ideal', txt: 'Cartões = 50% das saídas. Ideal é abaixo de 40%.', cta: 'Ver cartões →' },
  { tipo: 'info',  cat: 'Benchmark',              txt: 'Usuários semelhantes guardam 12%. Você guarda 8,2%.', cta: 'Ver metas →' },
  { tipo: 'ok',    cat: 'Conquista do mês',        txt: 'Abril: saídas -13% e saldo positivo pela 2ª vez.', cta: 'Ver fluxo →' },
  { tipo: 'alert', cat: 'Reserva crítica',         txt: '1,8 meses cobertos. Recomendado: 6 meses.', cta: 'Ajustar →' },
  { tipo: 'warn',  cat: 'Tendência 2026',          txt: 'Inflação em alimentação +4,2%. Reavalie mercado.', cta: 'Ver categoria →' },
  { tipo: 'ok',    cat: 'Meta próxima',            txt: 'Viagem a R$ 1.600 da conclusão — possível em Maio.', cta: 'Ver meta →' },
  { tipo: 'info',  cat: 'Planejamento',            txt: '+R$ 120/mês na reserva adianta segurança em 18 meses.', cta: 'Simular →' },
  { tipo: 'warn',  cat: 'Padrão de consumo',       txt: 'Gastos em Cartões cresceram 8% em 3 meses.', cta: 'Analisar →' },
];

const COR_DOT     = { alert: '#EF4444', ok: '#16A34A', warn: '#D97706', info: '#3B82F6' };
const COR_BORDA   = { alert: '#FECACA', ok: '#BBF7D0', warn: '#FDE68A', info: '#BFDBFE' };
const BG_RI       = { alert: '#FEF2F2', ok: '#F0FDF4', warn: '#FFFBEB', info: '#EFF6FF' };
const COR_CAT_TXT = { alert: '#EF4444', ok: '#16A34A', warn: '#D97706', info: '#3B82F6' };

const S = {
  page:     { padding: '16px 20px', maxWidth: 1280, margin: '0 auto', background: '#F7F8FA', minHeight: '100vh' },
  ph:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  pt:       { fontSize: 17, fontWeight: 500, color: '#111827', letterSpacing: '-.3px' },
  ps:       { fontSize: 11, color: '#6B7280', marginTop: 2 },
  diagInline: (status) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 10,
    fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20,
    background: BG_MAP[status], color: COR_MAP[status], verticalAlign: 'middle',
  }),
  bp: { background: '#3B82F6', color: 'white', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer' },
  bs: { background: 'white', color: '#374151', border: '1px solid #E9ECEF', borderRadius: 7, padding: '6px 11px', fontSize: 11, cursor: 'pointer' },
  msWrap: { display: 'flex', gap: 0, marginBottom: 14, borderBottom: '1px solid #E9ECEF', overflowX: 'auto' },
  mc: (on, pos, fut) => ({
    padding: '6px 12px 7px', fontSize: 11, fontWeight: 500,
    color: fut ? '#D1D5DB' : on ? '#3B82F6' : pos ? '#374151' : '#DC2626',
    cursor: fut ? 'default' : 'pointer',
    borderBottom: on ? '2px solid #3B82F6' : '2px solid transparent',
    whiteSpace: 'nowrap', textAlign: 'center', flexShrink: 0,
  }),
  mcScore: (cor) => ({ fontSize: 8, display: 'block', marginTop: 1, fontWeight: 600, opacity: .7, color: cor }),

  pma:    { display: 'flex', alignItems: 'center', gap: 10, background: '#111827', borderRadius: 9, padding: '9px 16px', marginBottom: 12 },
  pmaDot: { width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 },
  pmaLbl: { fontSize: 10, color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.05em' },
  pmaTxt: { fontSize: 12, fontWeight: 500, color: 'white', flex: 1 },
  pmaBtn: { fontSize: 10, color: '#93C5FD', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' },
  pnaDot: (on) => ({ width: 4, height: 4, borderRadius: '50%', background: on ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)', cursor: 'pointer' }),

  dest:    { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 10 },
  dc:      (bg) => ({ borderRadius: 10, padding: '13px 15px', background: bg, position: 'relative' }),
  dcLbl:   (cor) => ({ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5, color: cor }),
  dcVal:   (cor) => ({ fontSize: 19, fontWeight: 500, marginBottom: 3, letterSpacing: '-.3px', color: cor }),
  dcSub:   (cor) => ({ fontSize: 10, marginBottom: 8, color: cor }),
  dcBar:   { height: 3, borderRadius: 2 },
  btnEdit: { position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 500, color: 'white' },

  kpis:    { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 10 },
  kpi:     { background: 'white', borderRadius: 10, border: '1px solid #F1F3F5', padding: '13px 15px', position: 'relative', overflow: 'hidden' },
  kpiAcc:  (cor) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: cor }),
  kpiLbl:  { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 },
  kpiVal:  (cor) => ({ fontSize: 20, fontWeight: 500, marginBottom: 3, letterSpacing: '-.3px', color: cor }),
  kpiSub:  { fontSize: 10, color: '#6B7280' },
  kpiTrend:(cor) => ({ fontSize: 10, marginTop: 4, color: cor }),

  charts:    { display: 'grid', gridTemplateColumns: '1fr 180px 180px', gap: 10, marginBottom: 10 },
  card:      { background: 'white', borderRadius: 10, border: '1px solid #F1F3F5', padding: '13px 15px' },
  cardTitle: { fontSize: 12, fontWeight: 500, color: '#111827', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  bot: { display: 'grid', gridTemplateColumns: '200px 1fr 1fr 180px', gap: 10, marginBottom: 10 },

  ra:  { background: '#111827', borderRadius: 10, padding: '13px 18px', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center' },
  raT: { fontSize: 12, fontWeight: 500, color: 'white' },
  raS: { fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 },
  raI: { textAlign: 'center' },
  raL: { fontSize: 9, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 },

  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal:    { background: 'white', borderRadius: 12, padding: 22, width: 340, boxShadow: '0 16px 48px rgba(0,0,0,.12)', border: '1px solid #E9ECEF' },
  mTitle:   { fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 },
  mSub:     { fontSize: 11, color: '#9CA3AF', marginBottom: 18 },
  mTabs:    { display: 'flex', borderBottom: '1px solid #E9ECEF', marginBottom: 16 },
  mTab:     (on) => ({ fontSize: 12, fontWeight: 500, padding: '7px 14px', cursor: 'pointer', color: on ? '#3B82F6' : '#9CA3AF', borderBottom: on ? '2px solid #3B82F6' : '2px solid transparent' }),
  mField:   { marginBottom: 12 },
  mLabel:   { display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4 },
  mInput:   { width: '100%', padding: '9px 11px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' },
  mHint:    { fontSize: 10, color: '#9CA3AF', marginTop: 3 },
  mBtns:    { display: 'flex', gap: 8, marginTop: 16 },
  mCancel:  { flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' },
  mConfirm: { flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' },
  logItem:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F7F8FA', fontSize: 11 },
};

function IcoEdit() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  );
}

function IcoCheck() {
  return <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
}

function IcoWarn() {
  return <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>;
}

function ModalEdicao({ titulo, subtitulo, saldoAtual, metaValor, onSalvar, onClose, logItems }) {
  const [tabIdx, setTabIdx] = useState(0);
  const [saldo, setSaldo]   = useState(saldoAtual);
  const [aporte, setAporte] = useState('');
  const [desc, setDesc]     = useState('');
  const today = new Date().toISOString().split('T')[0];

  const tabs = ['Atualizar saldo', '+ Aporte', 'Histórico'];

  const handleSalvar = () => {
    const v = tabIdx === 0 ? Number(saldo) : Number(saldo) + Number(aporte);
    if (!v) return;
    onSalvar(v);
    onClose();
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.mTitle}>{titulo}</div>
        <div style={S.mSub}>{subtitulo}</div>
        <div style={S.mTabs}>
          {tabs.map((t, i) => (
            <div key={i} style={S.mTab(tabIdx === i)} onClick={() => setTabIdx(i)}>{t}</div>
          ))}
        </div>

        {tabIdx === 0 && (
          <div>
            <div style={S.mField}>
              <label style={S.mLabel}>Saldo atual (R$)</label>
              <input style={S.mInput} type="number" value={saldo} onChange={e => setSaldo(e.target.value)} />
              {metaValor && <div style={S.mHint}>Meta: R$ {metaValor.toLocaleString('pt-BR')}</div>}
            </div>
            <div style={S.mField}>
              <label style={S.mLabel}>Data de referência</label>
              <input style={S.mInput} type="date" defaultValue={today} />
            </div>
            <div style={S.mBtns}>
              <button style={S.mCancel} onClick={onClose}>Cancelar</button>
              <button style={S.mConfirm} onClick={handleSalvar}>Atualizar saldo</button>
            </div>
          </div>
        )}

        {tabIdx === 1 && (
          <div>
            <div style={S.mField}>
              <label style={S.mLabel}>Valor do aporte (R$)</label>
              <input style={S.mInput} type="number" placeholder="0,00" value={aporte} onChange={e => setAporte(e.target.value)} />
              <div style={S.mHint}>Será somado ao saldo atual de {fmt(saldoAtual)}</div>
            </div>
            <div style={S.mField}>
              <label style={S.mLabel}>Descrição (opcional)</label>
              <input style={S.mInput} type="text" placeholder="Ex: CDB, Tesouro Direto..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div style={S.mField}>
              <label style={S.mLabel}>Data</label>
              <input style={S.mInput} type="date" defaultValue={today} />
            </div>
            <div style={S.mBtns}>
              <button style={S.mCancel} onClick={onClose}>Cancelar</button>
              <button style={S.mConfirm} onClick={handleSalvar}>Confirmar aporte</button>
            </div>
          </div>
        )}

        {tabIdx === 2 && (
          <div>
            {logItems.map((l, i) => (
              <div key={i} style={{ ...S.logItem, borderBottom: i < logItems.length - 1 ? '1px solid #F7F8FA' : 'none' }}>
                <span>{l.desc}</span>
                <span style={{ fontWeight: 500, color: l.cor }}>{l.val}</span>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>{l.data}</span>
              </div>
            ))}
            <div style={S.mBtns}>
              <button style={{ ...S.mConfirm, flex: 'none', padding: '8px 20px' }} onClick={onClose}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GraficoSaldo({ dados }) {
  const [tooltip, setTooltip] = useState(null);
  const saldos    = dados.map(d => d ? d.sd : null);
  const comDados  = saldos.filter(v => v !== null);
  const positivos = comDados.filter(v => v > 0);
  const negativos = comDados.filter(v => v < 0);
  const totalAcum = comDados.reduce((s, v) => s + v, 0);
  const absMax    = Math.max(...comDados.map(v => Math.abs(v)), 1);
  const maxH      = 100;
  const melhor    = positivos.length ? Math.max(...positivos) : null;
  const pior      = negativos.length ? Math.min(...negativos) : null;

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>
        Saldo por mês · 2026
        <span style={{ fontSize: 10, color: '#3B82F6', cursor: 'pointer' }}>ver fluxo →</span>
      </div>

      <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
        {[
          { cor: '#86EFAC', bg: '#F0FDF4', txt: `${positivos.length} ${positivos.length === 1 ? 'mês positivo' : 'meses positivos'}` },
          { cor: '#FCA5A5', bg: '#FEF2F2', txt: `${negativos.length} ${negativos.length === 1 ? 'mês negativo' : 'meses negativos'}` },
          { cor: '#D1D5DB', bg: '#F7F8FA', txt: `${saldos.filter(v => v === null).length} sem dados` },
        ].map((p, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: p.bg, color: '#374151' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.cor }} />{p.txt}
          </div>
        ))}
      </div>

      <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 4, paddingTop: 26, position: 'relative' }}>
        {MESES.map((m, i) => {
          const val      = saldos[i];
          const fut      = val === null;
          const pos      = !fut && val >= 0;
          const isMelhor = !fut && val === melhor;
          const isPior   = !fut && val === pior;
          const cor    = fut ? '#F1F5F9' : isMelhor ? '#16A34A' : isPior ? '#EF4444' : pos ? '#86EFAC' : '#FCA5A5';
          const corVal = fut ? '#D1D5DB' : pos ? '#16A34A' : '#EF4444';
          const h      = fut ? 4 : Math.max(4, Math.round(Math.abs(val) / absMax * maxH));
          const valTxt = fut ? '' : (pos ? '+' : '-') + 'R$ ' + Math.abs(val).toLocaleString('pt-BR');

          return (
            <div key={i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: fut ? 'default' : 'pointer', position: 'relative' }}
              onMouseEnter={e => { if (!fut) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ x: r.left + r.width/2, y: r.top - 38, m, val, pos }); }}}
              onMouseLeave={() => setTooltip(null)}>
              {(isMelhor || isPior) && (
                <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 500, color: isMelhor ? '#16A34A' : '#EF4444', whiteSpace: 'nowrap' }}>
                  {isMelhor ? '↑ melhor' : '▼ pior'}
                </div>
              )}
              <div style={{ fontSize: 9, fontWeight: 600, position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: corVal }}>
                {valTxt}
              </div>
              <div style={{ width: '100%', height: h, background: cor, borderRadius: '4px 4px 0 0', minHeight: 3, opacity: tooltip?.m === m ? .7 : 1, transition: 'opacity .12s' }} />
              <div style={{ fontSize: 9, color: fut ? '#D1D5DB' : '#9CA3AF' }}>{m}</div>
            </div>
          );
        })}

        {tooltip && (
          <div style={{ position: 'fixed', background: '#111827', color: 'white', fontSize: 11, fontWeight: 500, padding: '6px 11px', borderRadius: 7, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 200, left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}>
            {tooltip.m} · <span style={{ color: tooltip.pos ? '#86EFAC' : '#FCA5A5' }}>
              {tooltip.pos ? '+' : '-'}R$ {Math.abs(tooltip.val).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 7, borderTop: '1px solid #F7F8FA' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ cor: '#86EFAC', txt: 'Positivo' }, { cor: '#FCA5A5', txt: 'Negativo' }, { cor: '#F1F5F9', txt: 'Sem dados' }].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#6B7280' }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: l.cor }} />{l.txt}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 500, color: totalAcum >= 0 ? '#16A34A' : '#EF4444' }}>
          Acumulado: {fmtS(totalAcum)}
        </div>
      </div>
    </div>
  );
}

function RadarFinanceiro() {
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);
  const total = Math.ceil(INSIGHTS.length / 2);

  const transRadar = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 350);
  }, []);

  useEffect(() => {
    const t = setInterval(() => transRadar((idx + 1) % total), 5000);
    return () => clearInterval(t);
  }, [idx, total, transRadar]);

  const i1 = INSIGHTS[idx * 2];
  const i2 = INSIGHTS[(idx * 2 + 1) % INSIGHTS.length];

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Radar Financeiro
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#3B82F6', background: '#EFF6FF', padding: '2px 7px', borderRadius: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1.5s infinite' }} />
            Ao vivo
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity .4s, transform .4s' }}>
        {[i1, i2].map((ins, i) => (
          <div key={i} style={{ padding: '9px 11px', borderRadius: 8, border: `1px solid ${COR_BORDA[ins.tipo]}`, background: BG_RI[ins.tipo] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: COR_DOT[ins.tipo], flexShrink: 0 }} />
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: COR_CAT_TXT[ins.tipo] }}>{ins.cat}</div>
            </div>
            <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.45, marginBottom: 4 }}>{ins.txt}</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#3B82F6', cursor: 'pointer' }}>{ins.cta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} onClick={() => transRadar(i)}
            style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? '#3B82F6' : '#E9ECEF', cursor: 'pointer', transition: 'background .2s' }} />
        ))}
      </div>
    </div>
  );
}

function PMA() {
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);

  const transPMA = useCallback((next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 300);
  }, []);

  useEffect(() => {
    const t = setInterval(() => transPMA((idx + 1) % PMAS.length), 5000);
    return () => clearInterval(t);
  }, [idx, transPMA]);

  return (
    <div style={S.pma}>
      <div style={{ ...S.pmaDot, animation: 'pulse 1.5s infinite' }} />
      <span style={S.pmaLbl}>Ação agora</span>
      <span style={{ ...S.pmaTxt, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(-5px)', transition: 'opacity .4s, transform .4s' }}>
        {PMAS[idx].txt}
      </span>
      <button style={S.pmaBtn}>{PMAS[idx].btn}</button>
      <div style={{ display: 'flex', gap: 4 }}>
        {PMAS.map((_, i) => (
          <div key={i} style={S.pnaDot(i === idx)} onClick={() => transPMA(i)} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [ativo, setAtivo]                 = useState(3);
  const [modalGuardado, setModalGuardado] = useState(false);
  const [modalReserva, setModalReserva]   = useState(false);
  const [saldoGuardado, setSaldoGuardado] = useState(756);
  const [saldoReserva, setSaldoReserva]   = useState(1800);

  const d      = DADOS_MOCK[ativo];
  const status = d?.status || 'atencao';
  const pct    = d ? Math.round(d.s / TETO * 100) : 0;

  const gaugeColor = pct > 100 ? '#EF4444' : pct > 80 ? '#F59E0B' : '#16A34A';
  const gaugeBadge = pct > 100
    ? { bg: '#FEE2E2', cor: '#991B1B', txt: 'Teto ultrapassado!' }
    : pct > 80
    ? { bg: '#FEF3C7', cor: '#92400E', txt: `⚠ Atenção — ${pct}% usado` }
    : { bg: '#DCFCE7', cor: '#15803D', txt: `✓ ${pct}% — dentro do limite` };

  const pctReserva   = Math.round(saldoReserva / 12000 * 100);
  const mesesReserva = (saldoReserva / 700).toFixed(1);

  const LOG_GUARDADO = [
    { desc: 'Saldo inicial 2026', val: 'R$ 0',    cor: '#3B82F6', data: 'Jan/2026' },
    { desc: 'Aporte CDB',         val: '+R$ 400', cor: '#16A34A', data: 'Fev/2026' },
    { desc: 'Atualização manual', val: '+R$ 356', cor: '#16A34A', data: 'Abr/2026' },
    { desc: 'Saldo atual',        val: `R$ ${saldoGuardado.toLocaleString('pt-BR')}`, cor: '#3B82F6', data: '' },
  ];
  const LOG_RESERVA = [
    { desc: 'Saldo inicial 2026', val: 'R$ 1.200', cor: '#3B82F6', data: 'Jan/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Fev/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Mar/2026' },
    { desc: 'Aporte mensal',      val: '+R$ 200',  cor: '#16A34A', data: 'Abr/2026' },
    { desc: 'Saldo atual',        val: `R$ ${saldoReserva.toLocaleString('pt-BR')}`, cor: '#0F766E', data: '' },
  ];

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.8);} }
      .btn-edit-wrap:hover .btn-edit-inner { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Layout>
      <div style={S.page}>

        {/* Header */}
        <div style={S.ph}>
          <div>
            <div style={S.pt}>Visão Mensal</div>
            <div style={S.ps}>
              <span>{MESES_F[ativo]} 2026 · Well e Amanda</span>
              {d && (
                <span style={S.diagInline(status)}>
                  {BADGE_MAP[status]} · {d.score}/100
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button style={S.bs}>Exportar</button>
            <button style={S.bp}>+ Lançamento</button>
          </div>
        </div>

        {/* Seletor de meses */}
        <div style={S.msWrap}>
          {MESES.map((m, i) => {
            const md  = DADOS_MOCK[i];
            const fut = !md;
            const pos = md && md.sd >= 0;
            const on  = i === ativo;
            return (
              <div key={i} style={S.mc(on, pos, fut)} onClick={() => !fut && setAtivo(i)}>
                {i === 3 && md ? '→ ' : ''}{m}
                {md && <span style={S.mcScore(md.cor)}>{md.score}</span>}
              </div>
            );
          })}
        </div>

        {/* PMA */}
        <PMA />

        {/* Cards destaque */}
        <div style={S.dest}>
          <div className="btn-edit-wrap" style={S.dc('#1D4ED8')}>
            <button className="btn-edit-inner" onClick={() => setModalGuardado(true)}
              style={{ ...S.btnEdit, opacity: 0, transition: 'opacity .15s' }}>
              <IcoEdit /> Editar
            </button>
            <div style={S.dcLbl('#BFDBFE')}>Dinheiro guardado</div>
            <div style={S.dcVal('white')}>{fmt(saldoGuardado)}</div>
            <div style={S.dcSub('#93C5FD')}>Investimentos além da reserva</div>
            <div style={S.dcBar}>
              <div style={{ height: '100%', width: `${Math.min(saldoGuardado / 10000 * 100, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} />
            </div>
          </div>

          <div className="btn-edit-wrap" style={S.dc('#0F766E')}>
            <button className="btn-edit-inner" onClick={() => setModalReserva(true)}
              style={{ ...S.btnEdit, opacity: 0, transition: 'opacity .15s' }}>
              <IcoEdit /> Editar
            </button>
            <div style={S.dcLbl('#99F6E4')}>Reserva de segurança</div>
            <div style={S.dcVal('white')}>{fmt(saldoReserva)}</div>
            <div style={S.dcSub('#5EEAD4')}>{pctReserva}% da meta · {mesesReserva} meses</div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}>
              <div style={{ height: '100%', width: `${Math.min(pctReserva, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} />
            </div>
          </div>

          <div style={S.dc('#6D28D9')}>
            <div style={S.dcLbl('#DDD6FE')}>Metas ativas</div>
            <div style={S.dcVal('white')}>3 metas</div>
            <div style={S.dcSub('#C4B5FD')}>Viagem 68% · Carro 32% · Reserva 15%</div>
            <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
              <div style={{ height: 3, flex: 68, background: 'rgba(255,255,255,.7)', borderRadius: 1 }} />
              <div style={{ height: 3, flex: 32, background: 'rgba(255,255,255,.2)', borderRadius: 1 }} />
            </div>
          </div>

          <div style={S.dc('#B45309')}>
            <div style={S.dcLbl('#FDE68A')}>Limite restante</div>
            <div style={S.dcVal('white')}>{fmt(Math.max(0, TETO - (d?.s || 0)))}</div>
            <div style={S.dcSub('#FCD34D')}>{100 - pct}% do teto · {fmt(TETO)}/mês</div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={S.kpis}>
          <div style={S.kpi}>
            <div style={S.kpiAcc('#3B82F6')} />
            <div style={S.kpiLbl}>Entradas</div>
            <div style={S.kpiVal('#111827')}>{d ? fmt(d.e) : '—'}</div>
            <div style={S.kpiSub}>Salário + extras</div>
            <div style={S.kpiTrend('#16A34A')}>→ estável vs mês anterior</div>
          </div>
          <div style={S.kpi}>
            <div style={S.kpiAcc('#EF4444')} />
            <div style={S.kpiLbl}>Saídas</div>
            <div style={S.kpiVal('#DC2626')}>{d ? fmt(d.s) : '—'}</div>
            <div style={S.kpiSub}>Cartões lideram (50%)</div>
            <div style={S.kpiTrend('#16A34A')}>↓ -13% vs mês anterior</div>
          </div>
          <div style={S.kpi}>
            <div style={S.kpiAcc('#16A34A')} />
            <div style={S.kpiLbl}>Saldo</div>
            <div style={S.kpiVal(d && d.sd >= 0 ? '#16A34A' : '#EF4444')}>{d ? fmt(d.sd) : '—'}</div>
            <div style={S.kpiSub}>8,2% da renda guardada</div>
            <div style={S.kpiTrend('#3B82F6')}>↑ melhor mês do ano</div>
          </div>
          <div style={{ ...S.kpi, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#111827', marginBottom: 8 }}>Teto de gastos</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: '#111827', textAlign: 'center', marginBottom: 2 }}>{pct}%</div>
            <div style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>do orçamento utilizado</div>
            <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: gaugeColor, borderRadius: 4, transition: 'width .4s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280', marginBottom: 6 }}>
              <span>Gasto: <strong style={{ color: '#DC2626' }}>{d ? fmt(d.s) : '—'}</strong></span>
              <span>Teto: {fmt(TETO)}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 500, padding: '4px 8px', borderRadius: 5, background: gaugeBadge.bg, color: gaugeBadge.cor }}>
              {gaugeBadge.txt}
            </div>
          </div>
        </div>

        {/* Gráfico + Categorias + Saúde */}
        <div style={S.charts}>
          <GraficoSaldo dados={DADOS_MOCK} />

          <div style={S.card}>
            <div style={{ ...S.cardTitle, fontSize: 11 }}>Categorias</div>
            {[
              { cor: '#EF4444', nome: 'Cartões', pct: 100, val: 'R$ 3.306' },
              { cor: '#3B82F6', nome: 'Mercado', pct: 24,  val: 'R$ 784' },
              { cor: '#16A34A', nome: 'Casa',    pct: 13,  val: 'R$ 437' },
              { cor: '#F59E0B', nome: 'Carro',   pct: 3,   val: 'R$ 94' },
              { cor: '#A78BFA', nome: 'Outros',  pct: 4,   val: 'R$ 116' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: i < 4 ? 7 : 0 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: c.cor, flexShrink: 0 }} />
                <div style={{ fontSize: 10, color: '#6B7280', width: 55 }}>{c.nome}</div>
                <div style={{ flex: 1, height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#111827', minWidth: 52, textAlign: 'right' }}>{c.val}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #F7F8FA', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280' }}>
              <span>Total</span><span style={{ fontWeight: 500, color: '#DC2626' }}>R$ 6.637</span>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ ...S.cardTitle, fontSize: 11 }}>Saúde financeira</div>
            {[
              { lbl: 'Poupança',      val: '8,2%',      cor: '#F59E0B', pct: 41, ctx: 'Meta 20% · Jan–Abr 2026' },
              { lbl: 'Controle teto', val: '94%',       cor: '#F59E0B', pct: 94, ctx: 'R$ 363 disponíveis' },
              { lbl: 'Metas',         val: '38%',       cor: '#3B82F6', pct: 38, ctx: '3 metas ativas' },
              { lbl: 'Reserva',       val: '1,8 meses', cor: '#EF4444', pct: 30, ctx: 'Ideal 6 meses · crítico' },
            ].map((sf, i) => (
              <div key={i} style={{ marginBottom: i < 3 ? 9 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#6B7280' }}>{sf.lbl}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: sf.cor }}>{sf.val}</span>
                </div>
                <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sf.pct}%`, background: sf.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{sf.ctx}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={S.bot}>
          <div style={S.card}>
            <div style={{ ...S.cardTitle, fontSize: 11 }}>Comparativos</div>
            {[
              { lbl: 'vs Mês anterior',  items: [{ l: 'Ent.', v: '+9%',  c: '#16A34A', d: '+R$600' }, { l: 'Saí.', v: '-13%', c: '#16A34A', d: '-R$790' }, { l: 'Saldo', v: 'R$589', c: '#3B82F6', d: 'melhor' }] },
              { lbl: 'vs Média Jan–Abr', items: [{ l: 'Ent.', v: '+5%',  c: '#16A34A', d: 'vs 6.846' }, { l: 'Saí.', v: '-3%', c: '#16A34A', d: 'vs 6.657' }, { l: 'Poup.', v: '8,2%', c: '#F59E0B', d: 'meta 20%' }] },
            ].map((grupo, gi) => (
              <div key={gi}>
                <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>{grupo.lbl}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, background: '#F7F8FA', borderRadius: 7, padding: 8, marginBottom: 8 }}>
                  {grupo.items.map((item, ii) => (
                    <div key={ii} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>{item.l}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: item.c }}>{item.v}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{item.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <RadarFinanceiro />

          <div style={S.card}>
            <div style={{ ...S.cardTitle, fontSize: 11 }}>
              Metas em andamento
              <span style={{ fontSize: 10, color: '#3B82F6', cursor: 'pointer' }}>ver todas</span>
            </div>
            {[
              { nome: 'Viagem',  pct: 68, cor: '#3B82F6', ctx: 'Faltam R$ 1.600 · Dez/2026',  ctxCor: '#9CA3AF' },
              { nome: 'Carro',   pct: 32, cor: '#16A34A', ctx: 'Faltam R$ 10.200 · Jun/2027', ctxCor: '#9CA3AF' },
              { nome: 'Reserva', pct: 15, cor: '#EF4444', ctx: 'Em risco — ritmo lento',       ctxCor: '#EF4444' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '7px 0', borderBottom: i < 2 ? '1px solid #F7F8FA' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#111827' }}>{m.nome}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: m.cor }}>{m.pct}%</span>
                </div>
                <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.cor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: m.ctxCor, marginTop: 2 }}>{m.ctx}</div>
              </div>
            ))}
          </div>

          <div style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Score financeiro</div>
            <div style={{ fontSize: 40, fontWeight: 500, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }}>{d?.score || 71}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>/100</div>
            <div style={{ fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 20, marginBottom: 12, background: BG_MAP[status], color: COR_MAP[status] }}>
              {BADGE_MAP[status]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'left' }}>
              {[
                { cor: '#16A34A', txt: 'Saldo positivo',    ok: true },
                { cor: '#16A34A', txt: 'Melhor mês do ano', ok: true },
                { cor: '#F59E0B', txt: 'Teto em 94%',       ok: false },
                { cor: '#EF4444', txt: 'Reserva crítica',   ok: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: item.cor }}>
                  {item.ok ? <IcoCheck /> : <IcoWarn />} {item.txt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo anual */}
        <div style={S.ra}>
          <div><div style={S.raT}>Resumo 2026</div><div style={S.raS}>Jan – Abr</div></div>
          {[
            { l: 'Entradas',    v: 'R$ 27.382', cor: '#BFDBFE' },
            { l: 'Saídas',      v: 'R$ 26.626', cor: '#FECACA' },
            { l: 'Saldo',       v: 'R$ 756',    cor: '#86EFAC' },
            { l: 'Score médio', v: '63/100',     cor: '#FDE68A' },
            { l: 'Melhor mês',  v: 'Abril ↑',   cor: 'white' },
            { l: 'Pior mês',    v: 'Fevereiro',  cor: '#FECACA' },
            { l: 'Diagnóstico', v: '🟡 Em recuperação', cor: '#FDE68A' },
          ].map((item, i) => (
            <div key={i} style={S.raI}>
              <div style={S.raL}>{item.l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: item.cor }}>{item.v}</div>
            </div>
          ))}
        </div>

        {modalGuardado && (
          <ModalEdicao
            titulo="Dinheiro guardado"
            subtitulo="Investimentos além da reserva de segurança"
            saldoAtual={saldoGuardado}
            metaValor={null}
            onSalvar={setSaldoGuardado}
            onClose={() => setModalGuardado(false)}
            logItems={LOG_GUARDADO}
          />
        )}
        {modalReserva && (
          <ModalEdicao
            titulo="Reserva de segurança"
            subtitulo="Valor guardado para emergências"
            saldoAtual={saldoReserva}
            metaValor={12000}
            onSalvar={setSaldoReserva}
            onClose={() => setModalReserva(false)}
            logItems={LOG_RESERVA}
          />
        )}

      </div>
    </Layout>
  );
}
