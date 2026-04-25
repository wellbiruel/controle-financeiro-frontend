import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ── Ícones SVG por categoria de meta ─────────────────────────────────────────
const ICONES = {
  viagem: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
    </svg>
  ),
  carro: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
    </svg>
  ),
  casa: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  educacao: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  reserva: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  default: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
    </svg>
  ),
};

const MESES_NM = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function dataFutura(mesesRestantes) {
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(mesesRestantes));
  return MESES_NM[d.getMonth()] + '/' + d.getFullYear();
}

function fmt(v) {
  return 'R$ ' + Math.abs(Math.round(v)).toLocaleString('pt-BR');
}

function getIcone(nome = '') {
  const n = nome.toLowerCase();
  if (n.includes('viagem') || n.includes('férias') || n.includes('ferias') || n.includes('viajar')) return ICONES.viagem;
  if (n.includes('carro') || n.includes('veículo') || n.includes('veiculo') || n.includes('moto')) return ICONES.carro;
  if (n.includes('casa') || n.includes('imóvel') || n.includes('imovel') || n.includes('aparta') || n.includes('reserva')) return ICONES.reserva;
  if (n.includes('edu') || n.includes('curso') || n.includes('pós') || n.includes('facul')) return ICONES.educacao;
  return ICONES.default;
}

function getStatus(meta) {
  const { guardado, total, aporte, prazoMeses } = meta;
  const falta = total - guardado;
  if (!prazoMeses) {
    if (aporte < falta / 36) return 'critico';
    return 'atencao';
  }
  const necessario = falta / prazoMeses;
  if (aporte >= necessario) return 'ok';
  if (aporte >= necessario * 0.85) return 'atencao';
  return 'critico';
}

function getPrevisao(meta) {
  const falta = meta.total - meta.guardado;
  if (meta.aporte <= 0) return null;
  return Math.ceil(falta / meta.aporte);
}

// ── Componente de menu de ações (3 pontos) ────────────────────────────────────
function MenuAcoes({ metaId, aberto, onToggle, onAporte, onSimular, onEditar, onExcluir }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={onToggle}
        style={{
          width: 30, height: 30, borderRadius: 7,
          border: '1px solid #E9ECEF', background: 'white',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 3, cursor: 'pointer', transition: 'all .12s',
          color: '#6B7280',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E9ECEF'; }}
      >
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#9CA3AF' }} />
        ))}
      </button>
      {aberto && (
        <div style={{
          position: 'absolute', right: 0, top: 36,
          background: 'white', border: '1px solid #E9ECEF',
          borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,.10)',
          minWidth: 190, zIndex: 50, overflow: 'hidden',
        }}>
          {[
            { label: '+ Aporte extra', fn: onAporte, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> },
            { label: 'Testar cenário', fn: onSimular, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
          ].map(({ label, fn, icon }) => (
            <div key={label} onClick={() => { fn(); onToggle(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 12, color: '#374151', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: '#9CA3AF' }}>{icon}</span>{label}
            </div>
          ))}
          <div style={{ height: 1, background: '#F3F4F6', margin: '2px 0' }} />
          {[
            { label: 'Replanejar meta', fn: onEditar, color: '#374151', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            { label: 'Excluir meta', fn: onExcluir, color: '#EF4444', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> },
          ].map(({ label, fn, color, icon }) => (
            <div key={label} onClick={() => { fn(); onToggle(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 12, color, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card de meta individual ────────────────────────────────────────────────────
function MetaCard({ meta, menuAberto, onMenuToggle, onAporte, onSimular, onEditar, onExcluir }) {
  const status = getStatus(meta);
  const previsaoMeses = getPrevisao(meta);
  const previsaoData = previsaoMeses ? dataFutura(previsaoMeses) : '—';
  const falta = meta.total - meta.guardado;
  const pctFinanceiro = Math.round(meta.guardado / meta.total * 100);
  const pctTempo = meta.prazoMeses ? Math.round((meta.prazoMeses - (previsaoMeses || 0)) / meta.prazoMeses * 100) : 0;

  const necessario = meta.prazoMeses ? Math.ceil(falta / meta.prazoMeses) : null;
  const diff = necessario ? necessario - meta.aporte : null;
  const atrasadoMeses = previsaoMeses && meta.prazoMeses ? Math.max(0, previsaoMeses - meta.prazoMeses) : 0;

  const config = {
    ok:      { diagBg: '#F0FDF4', diagCor: '#15803D', diagTxt: 'Saudável',  barTempoCor: '#BBF7D0', cardBorder: '#E9ECEF' },
    atencao: { diagBg: '#FFFBEB', diagCor: '#D97706', diagTxt: 'Atenção',   barTempoCor: '#FDE68A', cardBorder: '#FDE68A' },
    critico: { diagBg: '#FEF2F2', diagCor: '#B91C1C', diagTxt: 'Crítico',   barTempoCor: '#FECACA', cardBorder: '#FECACA' },
  }[status];

  const tagCor = { ok: '#16A34A', atencao: '#D97706', critico: '#EF4444' }[status];
  const tagTxt = status === 'ok'
    ? '✓ No ritmo certo'
    : status === 'atencao'
    ? `⚠ Faltam ${fmt(diff)}/mês`
    : `✗ Aumente ${fmt(Math.abs(diff || 0))}/mês`;

  const diagMsg = status === 'ok'
    ? `Você conclui em ${previsaoData} conforme planejado. Continue assim!`
    : status === 'atencao'
    ? `Aumente ${fmt(diff || 0)}/mês para cumprir o prazo de ${meta.prazo || previsaoData}.`
    : `Você NÃO vai bater essa meta neste ritmo. Com ${fmt((necessario || 0) * 1.5)}/mês conclui em ${dataFutura(Math.ceil(falta / ((necessario || 1) * 1.5)))}.`;

  const barFinCor = { ok: '#3B82F6', atencao: '#16A34A', critico: '#F59E0B' }[status];
  const prevCor   = { ok: '#16A34A', atencao: '#D97706', critico: '#EF4444' }[status];
  const prevSub   = status === 'ok' ? 'Dentro do prazo' : atrasadoMeses > 0 ? `${atrasadoMeses} meses de atraso` : 'Ritmo lento';

  const icone = getIcone(meta.nome);

  return (
    <div style={{
      background: 'white', borderRadius: 12,
      border: `1px solid ${config.cardBorder}`,
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.05)',
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.05)'}
    >
      {/* Linha 1 – cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icone}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{meta.nome}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {meta.prazo ? `Prazo: ${meta.prazo} · ` : 'Sem prazo definido · '}
            <strong style={{ color: { ok: '#15803D', atencao: '#D97706', critico: '#EF4444' }[status], fontWeight: 600 }}>
              {status === 'ok' ? `${meta.prazoMeses || previsaoMeses} meses restantes · no ritmo certo` :
               status === 'atencao' ? `${meta.prazoMeses} meses restantes · ${atrasadoMeses} meses de atraso previsto` :
               'ritmo muito lento'}
            </strong>
          </div>
        </div>
        <MenuAcoes
          metaId={meta.id}
          aberto={menuAberto}
          onToggle={onMenuToggle}
          onAporte={onAporte}
          onSimular={onSimular}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      </div>

      {/* Linha 2 – 4 métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid #F3F4F6' }}>
        {/* Guardado */}
        <div style={{ padding: '13px 18px', borderRight: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Guardado</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: barFinCor, letterSpacing: '-.2px', marginBottom: 3 }}>{fmt(meta.guardado)}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>de {fmt(meta.total)}</div>
        </div>
        {/* Aporte */}
        <div style={{ padding: '13px 18px', borderRight: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Aporte atual</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#111827', letterSpacing: '-.2px', marginBottom: 3 }}>{fmt(meta.aporte)}/mês</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>Necessário: {fmt(necessario || meta.aporte)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, marginTop: 5, color: tagCor }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              {status === 'ok'
                ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                : <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>}
            </svg>
            {tagTxt}
          </div>
        </div>
        {/* Previsão */}
        <div style={{ padding: '13px 18px', borderRight: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Previsão de conclusão</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: prevCor, letterSpacing: '-.2px', marginBottom: 3 }}>{previsaoData}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>{prevSub}</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 5 }}>Faltam {fmt(falta)}</div>
        </div>
        {/* Diagnóstico */}
        <div style={{ padding: '13px 18px', background: config.diagBg }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Diagnóstico</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: config.diagCor, letterSpacing: '-.2px', marginBottom: 4 }}>{config.diagTxt}</div>
          <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.55 }}>{diagMsg}</div>
        </div>
      </div>

      {/* Linha 3 – barras */}
      <div style={{ padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: '#6B7280', width: 148, flexShrink: 0 }}>Progresso financeiro</div>
          <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctFinanceiro}%`, background: barFinCor, borderRadius: 4, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, minWidth: 130, textAlign: 'right', color: barFinCor }}>
            {pctFinanceiro}% · {fmt(meta.guardado)} / {fmt(meta.total)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: '#6B7280', width: 148, flexShrink: 0 }}>Tempo decorrido</div>
          <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: meta.prazoMeses ? `${Math.min(pctTempo, 100)}%` : '2%', background: config.barTempoCor, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, minWidth: 130, textAlign: 'right', color: { ok: '#16A34A', atencao: '#D97706', critico: '#EF4444' }[status] }}>
            {meta.prazoMeses ? `${meta.prazoMeses - (previsaoMeses || 0)} de ${meta.prazoMeses} meses` : 'sem prazo definido'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simulador ──────────────────────────────────────────────────────────────────
function Simulador({ meta, onClose }) {
  const [aporte, setAporte] = useState(meta.aporte);
  const falta = meta.total - meta.guardado;
  const meses = aporte > 0 ? Math.ceil(falta / aporte) : 999;
  const necessario = meta.prazoMeses ? Math.ceil(falta / meta.prazoMeses) : null;
  const sug1 = necessario || Math.ceil(falta / 24);
  const sug2 = Math.ceil(sug1 * 1.25);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 420, boxShadow: '0 16px 48px rgba(0,0,0,.15)', border: '1px solid #E9ECEF' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Simular cenário — {meta.nome}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#6B7280', width: 110 }}>Aporte mensal</div>
          <input type="range" min={50} max={Math.max(meta.total * 0.15, 1500)} step={50} value={aporte}
            onChange={e => setAporte(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#3B82F6', cursor: 'pointer' }}/>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', minWidth: 80, textAlign: 'right' }}>{fmt(aporte)}/mês</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Sugestões</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { val: sug1, lbl: necessario ? 'Cumpre no prazo' : 'Recomendado', cor: '#16A34A' },
              { val: sug2, lbl: 'Termina antes', cor: '#3B82F6' },
            ].map(s => (
              <div key={s.val} onClick={() => setAporte(s.val)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 11px', background: '#F7F8FA', borderRadius: 7, border: '1px solid #E9ECEF', cursor: 'pointer', transition: 'all .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E9ECEF'; e.currentTarget.style.background = '#F7F8FA'; }}>
                <span style={{ fontSize: 11, color: '#374151' }}>→ {fmt(s.val)}/mês — {s.lbl}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.cor }}>{dataFutura(Math.ceil(falta / s.val))}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { lbl: 'Conclusão', val: dataFutura(meses), cor: meses <= (meta.prazoMeses || 999) ? '#16A34A' : '#EF4444' },
            { lbl: 'Meses restantes', val: `${meses} meses`, cor: '#111827' },
            { lbl: 'Avaliação', val: meses <= 12 ? 'Excelente ✓' : meses <= 30 ? 'Aceitável' : 'Lento', cor: meses <= 12 ? '#16A34A' : meses <= 30 ? '#F59E0B' : '#EF4444' },
          ].map(r => (
            <div key={r.lbl} style={{ background: '#F7F8FA', borderRadius: 7, border: '1px solid #E9ECEF', padding: '9px 11px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{r.lbl}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: r.cor }}>{r.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px 0', background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal genérico ─────────────────────────────────────────────────────────────
function Modal({ titulo, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 380, boxShadow: '0 16px 48px rgba(0,0,0,.15)', border: '1px solid #E9ECEF' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 18 }}>{titulo}</div>
        {children}
      </div>
    </div>
  );
}

function Campo({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>{label}</label>
      <input {...props} style={{ width: '100%', padding: '8px 11px', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827', boxSizing: 'border-box', ...props.style }} />
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function MetasPage() {
  const navigate = useNavigate();

  const [metas, setMetas] = useState([
    { id: 1, nome: 'Reserva de emergência', guardado: 1800,  total: 12000, aporte: 200,  prazo: null,       prazoMeses: null },
    { id: 2, nome: 'Troca do carro',         guardado: 4800,  total: 15000, aporte: 600,  prazo: 'Jun/2027', prazoMeses: 14   },
    { id: 3, nome: 'Viagem de férias',        guardado: 3400,  total: 5000,  aporte: 400,  prazo: 'Dez/2026', prazoMeses: 4    },
  ]);

  const [menuAberto, setMenuAberto] = useState(null);
  const [simulando, setSimulando] = useState(null);
  const [modalAporte, setModalAporte] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalNova, setModalNova] = useState(false);
  const [modalAjuste, setModalAjuste] = useState(false);

  const [novoAporte, setNovoAporte] = useState({ valor: '', data: new Date().toISOString().split('T')[0], obs: '' });
  const [novaMeta, setNovaMeta] = useState({ nome: '', total: '', aporte: '', prazo: '' });
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fn = () => setMenuAberto(null);
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, []);

  const order = { critico: 0, atencao: 1, ok: 2 };
  const metasOrdenadas = [...metas].sort((a, b) => order[getStatus(a)] - order[getStatus(b)]);

  const totalGuardado = metas.reduce((s, m) => s + m.guardado, 0);
  const totalAporte   = metas.reduce((s, m) => s + m.aporte, 0);
  const rendaLivre    = 589;
  const excessoAporte = totalAporte - rendaLivre;
  const metasCriticas = metas.filter(m => getStatus(m) === 'critico').length;
  const metasOk       = metas.filter(m => getStatus(m) === 'ok').length;
  const proximaMeta   = metasOrdenadas.filter(m => getStatus(m) === 'ok')[0];

  const secoes = [
    { key: 'critico', cor: '#B91C1C', dot: '#EF4444', lbl: 'PRIORIDADE — ação necessária agora' },
    { key: 'atencao', cor: '#D97706', dot: '#F59E0B', lbl: 'ATENÇÃO — pequeno ajuste resolve'   },
    { key: 'ok',      cor: '#16A34A', dot: '#16A34A', lbl: 'NO PRAZO — continue assim'           },
  ];

  const btn = (label, onClick, style = {}) => (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #E9ECEF',
      background: 'white', color: '#374151', transition: 'all .12s', ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{label}</button>
  );

  return (
    <Layout>
      <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto', background: '#F7F8FA', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#111827', letterSpacing: '-.3px' }}>Metas financeiras</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Planeje e acompanhe seus objetivos</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {btn('Exportar', () => {})}
            {btn('+ Adicionar objetivo', () => setModalNova(true), { background: '#3B82F6', color: 'white', border: 'none' })}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
          {[
            { lbl: 'Metas ativas',       val: metas.length,        cor: '#3B82F6', sub: 'em andamento' },
            { lbl: 'Total guardado',      val: fmt(totalGuardado),  cor: '#16A34A', sub: `+${fmt(totalAporte)} este mês` },
            { lbl: 'Aporte mensal',       val: fmt(totalAporte),    cor: excessoAporte > 0 ? '#EF4444' : '#111827', sub: excessoAporte > 0 ? `${fmt(excessoAporte)} acima da capacidade` : 'dentro da capacidade', subCor: excessoAporte > 0 ? '#EF4444' : '#6B7280' },
            { lbl: 'Próxima conclusão',   val: proximaMeta?.nome || '—', cor: '#111827', valSz: 15, sub: proximaMeta ? `68% · ${proximaMeta.prazo}` : '—', subCor: '#3B82F6' },
          ].map((k, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, border: '1px solid #F1F3F5', padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{k.lbl}</div>
              <div style={{ fontSize: k.valSz || 19, fontWeight: 500, color: k.cor, marginBottom: 3 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: k.subCor || '#6B7280' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Alerta compacto */}
        {excessoAporte > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#B91C1C"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#B91C1C' }}>⚠ Aportes acima da capacidade</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>Excesso: {fmt(excessoAporte)}/mês — renda livre {fmt(rendaLivre)}, comprometido {fmt(totalAporte)}</div>
            </div>
            <button onClick={() => setModalAjuste(true)} style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Ajustar automaticamente →
            </button>
          </div>
        )}

        {/* Diagnóstico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { bg: '#DCFCE7', iconBg: '#DCFCE7', iconCor: '#16A34A', path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', title: `${metasOk} meta${metasOk !== 1 ? 's' : ''} no prazo`, sub: 'Seguindo o ritmo planejado' },
            { bg: '#FEE2E2', iconBg: '#FEE2E2', iconCor: '#EF4444', path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', title: `${metasCriticas} meta${metasCriticas !== 1 ? 's' : ''} em risco`, sub: 'Precisam de ação agora' },
            { bg: '#FEF3C7', iconBg: '#FEF3C7', iconCor: '#D97706', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', title: 'Estratégia', sub: excessoAporte > 0 ? <span style={{ color: '#3B82F6', cursor: 'pointer' }} onClick={() => setModalAjuste(true)}>Replanejar distribuição →</span> : 'Dentro da capacidade ✓' },
          ].map((d, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, border: '1px solid #F1F3F5', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: d.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={d.iconCor}><path d={d.path}/></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{d.title}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{d.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Metas por seção */}
        {secoes.map(sec => {
          const metasSec = metasOrdenadas.filter(m => getStatus(m) === sec.key);
          if (!metasSec.length) return null;
          return (
            <div key={sec.key} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: sec.cor, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #F1F3F5' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: sec.dot }} />
                {sec.lbl}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {metasSec.map(meta => (
                  <MetaCard
                    key={meta.id}
                    meta={meta}
                    menuAberto={menuAberto === meta.id}
                    onMenuToggle={e => { e.stopPropagation(); setMenuAberto(menuAberto === meta.id ? null : meta.id); }}
                    onAporte={() => setModalAporte(meta)}
                    onSimular={() => setSimulando(meta)}
                    onEditar={() => { setEditForm({ ...meta }); setModalEditar(meta); }}
                    onExcluir={() => setMetas(prev => prev.filter(m => m.id !== meta.id))}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Card adicionar nova meta */}
        <div
          onClick={() => setModalNova(true)}
          style={{ border: '1.5px dashed #D1D5DB', borderRadius: 12, padding: 22, textAlign: 'center', cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = '#F0F9FF'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 3 }}>Adicionar novo objetivo</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Imóvel · Aposentadoria · Educação · Viagem...</div>
        </div>

        {/* ── Modais ── */}

        {simulando && <Simulador meta={simulando} onClose={() => setSimulando(null)} />}

        {modalAporte && (
          <Modal titulo={`Registrar aporte — ${modalAporte.nome}`} onClose={() => setModalAporte(null)}>
            <Campo label="Valor (R$)" type="number" placeholder="0,00" value={novoAporte.valor} onChange={e => setNovoAporte(p => ({ ...p, valor: e.target.value }))} />
            <Campo label="Data" type="date" value={novoAporte.data} onChange={e => setNovoAporte(p => ({ ...p, data: e.target.value }))} />
            <Campo label="Observação (opcional)" type="text" placeholder="Ex: Bônus do trabalho" value={novoAporte.obs} onChange={e => setNovoAporte(p => ({ ...p, obs: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModalAporte(null)} style={{ flex: 1, padding: '8px 0', background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => {
                if (novoAporte.valor) {
                  setMetas(prev => prev.map(m => m.id === modalAporte.id ? { ...m, guardado: m.guardado + Number(novoAporte.valor) } : m));
                }
                setModalAporte(null);
              }} style={{ flex: 1, padding: '8px 0', background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Confirmar aporte</button>
            </div>
          </Modal>
        )}

        {modalEditar && (
          <Modal titulo="Replanejar meta" onClose={() => setModalEditar(null)}>
            <Campo label="Nome" type="text" value={editForm.nome} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} />
            <Campo label="Valor alvo (R$)" type="number" value={editForm.total} onChange={e => setEditForm(p => ({ ...p, total: Number(e.target.value) }))} />
            <Campo label="Valor já guardado (R$)" type="number" value={editForm.guardado} onChange={e => setEditForm(p => ({ ...p, guardado: Number(e.target.value) }))} />
            <Campo label="Aporte mensal (R$)" type="number" value={editForm.aporte} onChange={e => setEditForm(p => ({ ...p, aporte: Number(e.target.value) }))} />
            <Campo label="Prazo (ex: Jun/2027)" type="text" value={editForm.prazo || ''} onChange={e => setEditForm(p => ({ ...p, prazo: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModalEditar(null)} style={{ flex: 1, padding: '8px 0', background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => {
                setMetas(prev => prev.map(m => m.id === modalEditar.id ? { ...editForm } : m));
                setModalEditar(null);
              }} style={{ flex: 1, padding: '8px 0', background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Salvar</button>
            </div>
          </Modal>
        )}

        {modalNova && (
          <Modal titulo="Novo objetivo financeiro" onClose={() => setModalNova(false)}>
            <Campo label="Nome do objetivo" type="text" placeholder="Ex: Viagem para Europa" value={novaMeta.nome} onChange={e => setNovaMeta(p => ({ ...p, nome: e.target.value }))} />
            <Campo label="Valor alvo (R$)" type="number" placeholder="0,00" value={novaMeta.total} onChange={e => setNovaMeta(p => ({ ...p, total: e.target.value }))} />
            <Campo label="Aporte mensal planejado (R$)" type="number" placeholder="0,00" value={novaMeta.aporte} onChange={e => setNovaMeta(p => ({ ...p, aporte: e.target.value }))} />
            <Campo label="Prazo (ex: Dez/2027)" type="text" placeholder="opcional" value={novaMeta.prazo} onChange={e => setNovaMeta(p => ({ ...p, prazo: e.target.value }))} />
            <div style={{ background: '#F0F9FF', borderRadius: 7, padding: '9px 11px', fontSize: 11, color: '#1D4ED8', marginBottom: 4 }}>
              💡 Sugestões: Reserva de emergência · Imóvel · Aposentadoria · Educação
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setModalNova(false)} style={{ flex: 1, padding: '8px 0', background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => {
                if (novaMeta.nome && novaMeta.total) {
                  setMetas(prev => [...prev, { id: Date.now(), nome: novaMeta.nome, guardado: 0, total: Number(novaMeta.total), aporte: Number(novaMeta.aporte) || 0, prazo: novaMeta.prazo || null, prazoMeses: null }]);
                  setNovaMeta({ nome: '', total: '', aporte: '', prazo: '' });
                }
                setModalNova(false);
              }} style={{ flex: 1, padding: '8px 0', background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Criar objetivo</button>
            </div>
          </Modal>
        )}

        {modalAjuste && (
          <Modal titulo="Ajustar aportes automaticamente" onClose={() => setModalAjuste(false)}>
            <div style={{ background: '#FEF2F2', borderRadius: 7, padding: '10px 12px', marginBottom: 14, fontSize: 11, color: '#B91C1C' }}>
              Renda livre: {fmt(rendaLivre)}/mês · Aportes atuais: {fmt(totalAporte)} · Excesso: {fmt(excessoAporte)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Redistribuição sugerida:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {metas.map((m, i) => {
                const peso = [0.43, 0.34, 0.23][i] || 0.33;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 12px', background: '#F7F8FA', borderRadius: 7 }}>
                    <span>{m.nome}</span>
                    <span style={{ fontWeight: 500 }}>{fmt(Math.round(rendaLivre * peso))}/mês</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 12px', background: '#DCFCE7', borderRadius: 7, fontWeight: 500 }}>
                <span style={{ color: '#15803D' }}>Total</span>
                <span style={{ color: '#15803D' }}>{fmt(rendaLivre)}/mês ✓</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalAjuste(false)} style={{ flex: 1, padding: '8px 0', background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => setModalAjuste(false)} style={{ flex: 1, padding: '8px 0', background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Aplicar redistribuição</button>
            </div>
          </Modal>
        )}

      </div>
    </Layout>
  );
}
