import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';
import api from '../services/api';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Ola, {user.nome || user.email}!</h1>
        <div>
          <button onClick={() => navigate('/transacoes')} style={{ padding: '8px 16px', marginRight: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>
            Transacoes
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#28a745', color: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Receitas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Despesas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: saldo >= 0 ? '#007bff' : '#dc3545', color: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Saldo</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Transacoes Recentes</h2>
        {transacoes.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Nenhuma transacao ainda.</p>
        ) : (
          transacoes.slice(0, 5).map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
              <span>{t.descricao}</span>
              <span style={{ color: t.tipo === 'receita' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DashboardPage;