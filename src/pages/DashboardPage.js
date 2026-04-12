import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import api from '../services/api';
import Layout from '../Components/Layout/Layout';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      buscarTransacoes();
    }
  }, [navigate]);

  const buscarTransacoes = async () => {
    try {
      const response = await api.get('/transacoes');
      setTransacoes(response.data);
    } catch (err) {
      console.error('Erro ao buscar transacoes:', err);
    }
  };

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  if (!user) return null;

  return (
    <Layout>
      <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              Olá, {user.nome || user.email}! Aqui está seu resumo financeiro.
            </p>
          </div>
          <button
            onClick={() => navigate('/transacoes')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#1B3A6B', color: 'white', border: 'none',
              borderRadius: '8px', padding: '9px 16px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer'
            }}
          >
            + Nova Transação
          </button>
        </div>

        {/* Cards de resumo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          
          {/* Receitas */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receitas</p>
                <p style={{ fontSize: '26px', fontWeight: '600', color: '#16A34A', margin: 0 }}>
                  R$ {totalReceitas.toFixed(2)}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="#16A34A" width="20" height="20">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Despesas */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Despesas</p>
                <p style={{ fontSize: '26px', fontWeight: '600', color: '#DC2626', margin: 0 }}>
                  R$ {totalDespesas.toFixed(2)}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="#DC2626" width="20" height="20">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Saldo */}
          <div style={{ background: saldo >= 0 ? '#1B3A6B' : '#7F1D1D', borderRadius: '12px', border: 'none', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo</p>
                <p style={{ fontSize: '26px', fontWeight: '600', color: 'white', margin: 0 }}>
                  R$ {saldo.toFixed(2)}
                </p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '12px 0 0' }}>
              {saldo >= 0 ? 'Saldo positivo ✓' : 'Saldo negativo — atenção!'}
            </p>
          </div>
        </div>

        {/* Transações recentes */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
              Transações Recentes
            </h2>
            <button
              onClick={() => navigate('/transacoes')}
              style={{ fontSize: '12px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              Ver todas →
            </button>
          </div>

          {transacoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Nenhuma transação ainda.</p>
              <button
                onClick={() => navigate('/transacoes')}
                style={{ marginTop: '12px', background: '#1B3A6B', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}
              >
                Adicionar primeira transação
              </button>
            </div>
          ) : (
            <div>
              {/* Header da tabela */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 110px', padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descrição</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Valor</span>
              </div>

              {transacoes.slice(0, 6).map((t, index) => (
                <div
                  key={t.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 110px',
                    padding: '12px', alignItems: 'center',
                    borderBottom: index < Math.min(transacoes.length, 6) - 1 ? '1px solid #F8FAFC' : 'none',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: t.tipo === 'receita' ? '#DCFCE7' : '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg viewBox="0 0 24 24" fill={t.tipo === 'receita' ? '#16A34A' : '#DC2626'} width="14" height="14">
                        {t.tipo === 'receita'
                          ? <path d="M7 14l5-5 5 5z"/>
                          : <path d="M7 10l5 5 5-5z"/>
                        }
                      </svg>
                    </div>
                    <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: '500' }}>{t.descricao}</span>
                  </div>
                  <span style={{
                    fontSize: '12px', color: '#64748B',
                    background: '#F1F5F9', borderRadius: '6px',
                    padding: '3px 8px', display: 'inline-block', width: 'fit-content'
                  }}>
                    {t.categoria || 'Sem categoria'}
                  </span>
                  <span style={{
                    fontSize: '14px', fontWeight: '600', textAlign: 'right',
                    color: t.tipo === 'receita' ? '#16A34A' : '#DC2626'
                  }}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default DashboardPage;