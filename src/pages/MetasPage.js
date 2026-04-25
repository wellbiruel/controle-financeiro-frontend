import { useState } from 'react';
import Layout from '../Components/Layout/Layout';

const fmt = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (atual, meta) => meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;

const ICONES = ['✈️','🚗','🏦','🏠','📱','🎓','🏖️','💍','🖥️','🌎'];

const METAS_INICIAIS = [
  {
    id: 1, nome: 'Viagem Europa', icone: '✈️',
    meta: 12000, atual: 8160, aporte: 800,
    prazo: 'Dez/2025', descricao: 'Intercâmbio de 30 dias pela Europa',
  },
  {
    id: 2, nome: 'Carro Novo', icone: '🚗',
    meta: 25000, atual: 8000, aporte: 1200,
    prazo: 'Jun/2026', descricao: 'Entrada para financiamento',
  },
  {
    id: 3, nome: 'Reserva de Emergência', icone: '🏦',
    meta: 18000, atual: 2700, aporte: 500,
    prazo: 'Dez/2026', descricao: '6 meses de despesas cobertas',
  },
];

const getStatus = (p) => {
  if (p >= 100) return { txt: 'Concluída',   bg: '#DCFCE7', color: '#166534' };
  if (p >= 60)  return { txt: 'No prazo',    bg: '#EFF6FF', color: '#1D4ED8' };
  if (p >= 30)  return { txt: 'Progredindo', bg: '#FEF3C7', color: '#92400E' };
  return           { txt: 'Ritmo lento', bg: '#FEE2E2', color: '#991B1B' };
};

const getBarColor = (p) =>
  p >= 80 ? '#22C55E' : p >= 50 ? '#3B82F6' : p >= 30 ? '#F59E0B' : '#EF4444';

const FORM_VAZIO = { nome: '', icone: '✈️', meta: '', aporte: '', prazo: '', descricao: '' };

export default function MetasPage() {
  const [metas,     setMetas]     = useState(METAS_INICIAIS);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(FORM_VAZIO);
  const [erroForm,  setErroForm]  = useState('');

  const totalGuardado = metas.reduce((s, m) => s + m.atual, 0);
  const metaMaisProxima = [...metas].sort((a, b) => pct(b.atual, b.meta) - pct(a.atual, a.meta))[0];
  const aporteTotal = metas.reduce((s, m) => s + m.aporte, 0);

  const handleSalvar = () => {
    if (!form.nome || !form.meta || !form.aporte) {
      setErroForm('Preencha nome, valor alvo e aporte mensal.');
      return;
    }
    const nova = {
      id:       Date.now(),
      nome:     form.nome,
      icone:    form.icone,
      meta:     +form.meta,
      atual:    0,
      aporte:   +form.aporte,
      prazo:    form.prazo || '—',
      descricao:form.descricao,
    };
    setMetas(prev => [...prev, nova]);
    setShowModal(false);
    setForm(FORM_VAZIO);
    setErroForm('');
  };

  return (
    <Layout>
      <div style={{ padding: '20px 24px', background: '#F1F5F9', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Metas financeiras</h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0' }}>
              Acompanhe seus objetivos e progresso
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
          >
            + Nova meta
          </button>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Metas ativas</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>{metas.filter(m => pct(m.atual, m.meta) < 100).length}</p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>{metas.length} no total</p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total guardado</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#16A34A' }}>{fmt(totalGuardado)}</p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>de {fmt(metas.reduce((s, m) => s + m.meta, 0))}</p>
          </div>
          <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Meta mais próxima</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              {metaMaisProxima ? metaMaisProxima.nome : '—'}
            </p>
            {metaMaisProxima && (
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                {pct(metaMaisProxima.atual, metaMaisProxima.meta)}% concluída
              </p>
            )}
          </div>
        </div>

        {/* ── Grid principal ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'start' }}>

          {/* ── Lista de metas ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metas.map(meta => {
              const p      = pct(meta.atual, meta.meta);
              const status = getStatus(p);
              const barClr = getBarColor(p);
              const falta  = Math.max(0, meta.meta - meta.atual);
              const mesesRestantes = meta.aporte > 0 ? Math.ceil(falta / meta.aporte) : null;
              return (
                <div key={meta.id} style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Ícone */}
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {meta.icone}
                    </div>

                    {/* Conteúdo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{meta.nome}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                            Prazo: {meta.prazo} · Aporte: {fmt(meta.aporte)}/mês
                            {mesesRestantes ? ` · ~${mesesRestantes} meses restantes` : ''}
                          </p>
                        </div>
                        <span style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px', flexShrink: 0, marginLeft: '8px' }}>
                          {status.txt}
                        </span>
                      </div>

                      {/* Progresso */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{fmt(meta.atual)}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{p}% de {fmt(meta.meta)}</span>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p}%`, background: barClr, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                        <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                          Faltam {fmt(falta)} para concluir
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card "Criar nova meta" */}
            <div
              onClick={() => setShowModal(true)}
              style={{
                background: 'white', borderRadius: '10px',
                border: '1.5px dashed #93C5FD',
                padding: '20px 18px', cursor: 'pointer', textAlign: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#3B82F6' }}>Criar nova meta</p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#94A3B8' }}>Defina seu próximo objetivo financeiro</p>
            </div>
          </div>

          {/* ── Sidebar direita ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Resumo geral */}
            <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resumo geral</p>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {metas.map(m => {
                  const p = pct(m.atual, m.meta);
                  return (
                    <div key={m.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{m.icone}</span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{m.nome}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: getBarColor(p) }}>{p}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: getBarColor(p), borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aporte mensal total */}
            <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #E2E8F0', padding: '14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aporte mensal total</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#3B82F6' }}>{fmt(aporteTotal)}</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>distribuído em {metas.length} meta{metas.length !== 1 ? 's' : ''}</p>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {metas.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{m.icone} {m.nome}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A' }}>{fmt(m.aporte)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próxima conclusão */}
            {metaMaisProxima && (
              <div style={{ background: '#EFF6FF', borderRadius: '10px', border: '1px solid #C7D2FE', padding: '14px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Próxima conclusão</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '26px' }}>{metaMaisProxima.icone}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1D4ED8' }}>{metaMaisProxima.nome}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#3B82F6' }}>{pct(metaMaisProxima.atual, metaMaisProxima.meta)}% concluída</p>
                  </div>
                </div>
                <div style={{ height: '7px', background: 'rgba(99,102,241,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(metaMaisProxima.atual, metaMaisProxima.meta)}%`, background: '#3B82F6', borderRadius: '4px' }} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#1D4ED8' }}>
                  Faltam {fmt(Math.max(0, metaMaisProxima.meta - metaMaisProxima.atual))} · Prazo: {metaMaisProxima.prazo}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ── Modal: Nova meta ── */}
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Nova meta</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Ícone */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '6px' }}>Ícone</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ICONES.map(ic => (
                      <button
                        key={ic}
                        onClick={() => setForm(f => ({ ...f, icone: ic }))}
                        style={{ fontSize: '18px', width: '36px', height: '36px', borderRadius: '8px', border: `2px solid ${form.icone === ic ? '#3B82F6' : '#E2E8F0'}`, background: form.icone === ic ? '#EFF6FF' : 'white', cursor: 'pointer' }}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nome */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Nome da meta *</label>
                  <input
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Viagem Europa"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* Valor alvo */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Valor alvo (R$) *</label>
                    <input
                      type="number" min="0"
                      value={form.meta}
                      onChange={e => setForm(f => ({ ...f, meta: e.target.value }))}
                      placeholder="0,00"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  {/* Aporte */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Aporte mensal (R$) *</label>
                    <input
                      type="number" min="0"
                      value={form.aporte}
                      onChange={e => setForm(f => ({ ...f, aporte: e.target.value }))}
                      placeholder="0,00"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Prazo e descrição */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Prazo</label>
                    <input
                      value={form.prazo}
                      onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))}
                      placeholder="Ex: Dez/2025"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Descrição</label>
                    <input
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Opcional"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {erroForm && <p style={{ margin: 0, fontSize: '12px', color: '#DC2626', background: '#FEE2E2', padding: '6px 10px', borderRadius: '6px' }}>{erroForm}</p>}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => { setShowModal(false); setForm(FORM_VAZIO); setErroForm(''); }}
                  style={{ background: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Criar meta
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
