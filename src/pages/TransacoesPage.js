import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getCurrentUser, logout } from '../services/auth';

function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) navigate('/login');
    buscarTransacoes();
  }, []);

  const buscarTransacoes = async () => {
    try {
      const response = await api.get('/transacoes');
      setTransacoes(response.data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/transacoes', { descricao, valor: parseFloat(valor), tipo, data });
      setSuccess('Transação adicionada com sucesso!');
      setDescricao('');
      setValor('');
      setData('');
      buscarTransacoes();
    } catch (err) {
      setError('Erro ao adicionar transação.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Transações</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', marginRight: '10px', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: '#fff', color: '#007bff', cursor: 'pointer' }}>Dashboard</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>Nova Transação</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="number" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>Adicionar Transação</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>Histórico</h2>
        {transacoes.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Nenhuma transação ainda.</p>
        ) : (
          transacoes.map((t) => (
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

export default TransacoesPage;