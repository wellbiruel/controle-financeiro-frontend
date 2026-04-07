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
      console.error('Erro ao buscar transações:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  if (!user) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Olá, {user.nome || user.email}! 👋</h1>
        <div>
          <button onClick={() => navigate('/transacoes')} style={{ padding: '8px 16px', marginRight: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>+ Transações</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#28a745', color: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Receitas</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>R$ {totalReceitas.toFixed(2)}</p>
        </div>