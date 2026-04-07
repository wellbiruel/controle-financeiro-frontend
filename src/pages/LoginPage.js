import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(email, senha, nome);
        alert('Registro realizado! Faça login.');
        setIsRegister(false);
      } else {
        await login(email, senha);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '320px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          {isRegister ? 'Criar Conta' : 'Login'}
        </h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isRegister && (
            <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>
            {isRegister ? 'Registrar' : 'Entrar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}
          <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: '5px' }}>
            {isRegister ? 'Faça login' : 'Registre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;