import React, { useState } from 'react';
import Layout from '../Components/Layout/Layout';

const card = { background: 'white', borderRadius: 11, border: '1px solid #F1F3F5', padding: '20px 22px', marginBottom: 12 };
const inp  = { width: '100%', padding: '9px 11px', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#111827' };
const lbl  = { display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4 };
const hint = { fontSize: 10, color: '#9CA3AF', marginTop: 3 };

function Modal({ titulo, subtitulo, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 380, boxShadow: '0 16px 48px rgba(0,0,0,.12)', border: '1px solid #E9ECEF' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{titulo}</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>{subtitulo}</div>
        {children}
      </div>
    </div>
  );
}

function ModalBtns({ onCancel, onConfirm, confirmLabel = 'Salvar' }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #E9ECEF', borderRadius: 7, fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
      <button onClick={onConfirm} style={{ flex: 1, padding: 8, background: '#3B82F6', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>{confirmLabel}</button>
    </div>
  );
}

function ConfigItem({ ico, icoBg, icoColor, titulo, valor, btnLabel = 'Editar', btnStyle = 'default', onClick }) {
  const btnStyles = {
    default: { background: 'white', color: '#374151', borderColor: '#E2E8F0' },
    blue:    { background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' },
    green:   { background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' },
  };
  const bs = btnStyles[btnStyle] || btnStyles.default;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', border: '1px solid #F1F3F5', borderRadius: 9, marginBottom: 8, background: '#FAFAFA' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: icoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {ico(icoColor)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>{titulo}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{valor}</div>
      </div>
      <button onClick={onClick}
        style={{ fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 6, border: `1px solid ${bs.borderColor}`, background: bs.background, color: bs.color, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all .12s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        {btnLabel}
      </button>
    </div>
  );
}

const IcoTeto     = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>;
const IcoPoupanca = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>;
const IcoReserva  = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>;
const IcoCartao   = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2zm-7 7h5v-2h-5v2z"/></svg>;
const IcoUser     = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const IcoLock     = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>;
const IcoNot      = (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill={c}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>;

export default function ConfiguracoesPage() {
  const [teto, setTeto]           = useState(7000);
  const [poupanca, setPoupanca]   = useState(20);
  const [reserva, setReserva]     = useState(12000);
  const [limCartao, setLimCartao] = useState('');

  const [modalTeto, setModalTeto]         = useState(false);
  const [modalPoupanca, setModalPoupanca] = useState(false);
  const [modalReserva, setModalReserva]   = useState(false);
  const [modalCartao, setModalCartao]     = useState(false);
  const [modalSenha, setModalSenha]       = useState(false);
  const [modalPerfil, setModalPerfil]     = useState(false);

  const [formTeto, setFormTeto]         = useState(teto);
  const [formPoupanca, setFormPoupanca] = useState(poupanca);
  const [formReserva, setFormReserva]   = useState(reserva);
  const [formCartao, setFormCartao]     = useState(limCartao);

  const rendaEstimada = 7226;
  const margemTeto    = Math.max(0, rendaEstimada - formTeto);

  return (
    <Layout>
      <div style={{ padding: '18px 24px', maxWidth: 900, margin: '0 auto', background: '#F7F8FA', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', letterSpacing: '-.4px' }}>Configurações</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>Gerencie suas preferências e limites financeiros</div>
        </div>

        {/* Limites e orçamento */}
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Limites e orçamento</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Defina os limites que guiam seu planejamento mensal</div>
          </div>
          <ConfigItem
            ico={IcoTeto} icoBg="#FEF3C7" icoColor="#D97706"
            titulo="Teto mensal de gastos"
            valor={`R$ ${teto.toLocaleString('pt-BR')}/mês · baseado na renda líquida`}
            btnLabel="Editar" btnStyle="blue"
            onClick={() => { setFormTeto(teto); setModalTeto(true); }}
          />
          <ConfigItem
            ico={IcoPoupanca} icoBg="#F0FDF4" icoColor="#16A34A"
            titulo="Meta de poupança mensal"
            valor={`${poupanca}% da renda · R$ ${Math.round(rendaEstimada * poupanca / 100).toLocaleString('pt-BR')}/mês`}
            btnLabel="Editar"
            onClick={() => { setFormPoupanca(poupanca); setModalPoupanca(true); }}
          />
          <ConfigItem
            ico={IcoReserva} icoBg="#EFF6FF" icoColor="#3B82F6"
            titulo="Meta da reserva de emergência"
            valor={`R$ ${reserva.toLocaleString('pt-BR')} · 6 meses de despesas`}
            btnLabel="Editar"
            onClick={() => { setFormReserva(reserva); setModalReserva(true); }}
          />
          <ConfigItem
            ico={IcoCartao} icoBg="#FEF2F2" icoColor="#EF4444"
            titulo="Limite mensal — Cartões"
            valor={limCartao ? `R$ ${Number(limCartao).toLocaleString('pt-BR')}/mês` : 'Sem limite definido · opcional'}
            btnLabel={limCartao ? 'Editar' : 'Definir'}
            onClick={() => { setFormCartao(limCartao); setModalCartao(true); }}
          />
        </div>

        {/* Perfil e conta */}
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Perfil e conta</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Informações pessoais e segurança</div>
          </div>
          <ConfigItem ico={IcoUser} icoBg="#F3F4F6" icoColor="#6B7280" titulo="Nome e e-mail" valor="Well e Amanda · wellbiruel@gmail.com" btnLabel="Editar" onClick={() => setModalPerfil(true)} />
          <ConfigItem ico={IcoLock} icoBg="#F3F4F6" icoColor="#6B7280" titulo="Senha" valor="Última alteração há 30 dias" btnLabel="Alterar" onClick={() => setModalSenha(true)} />
        </div>

        {/* Notificações */}
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Notificações</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Escolha quando e como ser avisado</div>
          </div>
          {[
            { lbl: 'Teto de gastos próximo do limite', sub: 'Avisar quando ultrapassar 80% do teto', on: true },
            { lbl: 'Metas em risco', sub: 'Avisar quando o ritmo de aporte estiver abaixo do necessário', on: true },
            { lbl: 'Reserva crítica', sub: 'Avisar quando a reserva estiver abaixo de 3 meses', on: true },
            { lbl: 'Resumo mensal', sub: 'Receber diagnóstico financeiro todo dia 1', on: false },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid #F1F3F5', borderRadius: 9, marginBottom: i < 3 ? 8 : 0, background: '#FAFAFA' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {IcoNot('#3B82F6')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 2 }}>{n.lbl}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{n.sub}</div>
              </div>
              <div onClick={() => {}} style={{ width: 36, height: 20, borderRadius: 10, background: n.on ? '#3B82F6' : '#E9ECEF', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: n.on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Modal Teto */}
        {modalTeto && (
          <Modal titulo="Teto mensal de gastos" subtitulo="Limite máximo de saídas que você se permite por mês" onClose={() => setModalTeto(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Valor do teto (R$)</label>
              <input style={inp} type="number" value={formTeto} onChange={e => setFormTeto(Number(e.target.value))}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              <div style={hint}>Use a renda líquida como referência · renda estimada: R$ {rendaEstimada.toLocaleString('pt-BR')}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Válido a partir de</label>
              <input style={inp} type="month" defaultValue="2026-05" />
            </div>
            <div style={{ background: '#EFF6FF', borderRadius: 7, padding: '10px 12px', fontSize: 12, color: '#1D4ED8', lineHeight: 1.5, marginBottom: 4 }}>
              Com renda de R$ {rendaEstimada.toLocaleString('pt-BR')}, um teto de R$ {formTeto.toLocaleString('pt-BR')} deixa <strong>R$ {margemTeto.toLocaleString('pt-BR')} de margem</strong> para poupança e imprevistos.
            </div>
            <ModalBtns onCancel={() => setModalTeto(false)} confirmLabel="Salvar teto" onConfirm={() => { setTeto(formTeto); setModalTeto(false); }} />
          </Modal>
        )}

        {/* Modal Poupança */}
        {modalPoupanca && (
          <Modal titulo="Meta de poupança mensal" subtitulo="Percentual da renda que você quer guardar todo mês" onClose={() => setModalPoupanca(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Percentual da renda (%)</label>
              <input style={inp} type="number" min="0" max="100" value={formPoupanca} onChange={e => setFormPoupanca(Number(e.target.value))}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              <div style={hint}>= R$ {Math.round(rendaEstimada * formPoupanca / 100).toLocaleString('pt-BR')}/mês · recomendado: mínimo 20%</div>
            </div>
            <ModalBtns onCancel={() => setModalPoupanca(false)} confirmLabel="Salvar meta" onConfirm={() => { setPoupanca(formPoupanca); setModalPoupanca(false); }} />
          </Modal>
        )}

        {/* Modal Reserva */}
        {modalReserva && (
          <Modal titulo="Meta da reserva de emergência" subtitulo="Valor alvo para sua reserva de segurança" onClose={() => setModalReserva(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Valor alvo (R$)</label>
              <input style={inp} type="number" value={formReserva} onChange={e => setFormReserva(Number(e.target.value))}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              <div style={hint}>Ideal: 6 meses de despesas · suas despesas médias: R$ {Math.round(7000).toLocaleString('pt-BR')}/mês</div>
            </div>
            <ModalBtns onCancel={() => setModalReserva(false)} confirmLabel="Salvar meta" onConfirm={() => { setReserva(formReserva); setModalReserva(false); }} />
          </Modal>
        )}

        {/* Modal Limite Cartão */}
        {modalCartao && (
          <Modal titulo="Limite mensal de cartões" subtitulo="Valor máximo em compras no cartão por mês (opcional)" onClose={() => setModalCartao(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Limite mensal (R$)</label>
              <input style={inp} type="number" placeholder="Ex: 3000" value={formCartao} onChange={e => setFormCartao(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              <div style={hint}>Deixe em branco para não definir limite · recomendado: máximo 40% das saídas</div>
            </div>
            <ModalBtns onCancel={() => setModalCartao(false)} confirmLabel="Salvar limite" onConfirm={() => { setLimCartao(formCartao); setModalCartao(false); }} />
          </Modal>
        )}

        {/* Modal Senha */}
        {modalSenha && (
          <Modal titulo="Alterar senha" subtitulo="Escolha uma senha forte com pelo menos 8 caracteres" onClose={() => setModalSenha(false)}>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Senha atual</label><input style={inp} type="password" placeholder="••••••••" /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Nova senha</label><input style={inp} type="password" placeholder="••••••••" /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Confirmar nova senha</label><input style={inp} type="password" placeholder="••••••••" /></div>
            <ModalBtns onCancel={() => setModalSenha(false)} confirmLabel="Alterar senha" onConfirm={() => setModalSenha(false)} />
          </Modal>
        )}

        {/* Modal Perfil */}
        {modalPerfil && (
          <Modal titulo="Editar perfil" subtitulo="Nome e e-mail da conta" onClose={() => setModalPerfil(false)}>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Nome</label><input style={inp} type="text" defaultValue="Well e Amanda" /></div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>E-mail</label><input style={inp} type="email" defaultValue="wellbiruel@gmail.com" /></div>
            <ModalBtns onCancel={() => setModalPerfil(false)} confirmLabel="Salvar" onConfirm={() => setModalPerfil(false)} />
          </Modal>
        )}

      </div>
    </Layout>
  );
}
