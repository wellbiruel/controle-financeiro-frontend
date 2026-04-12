import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout/Layout';
import { criarGasto, listarGastos, deletarGasto } from '../services/gastos';
import '../Styles/Transacoes.css';

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('saida');
  const [categoria, setCategoria] = useState('Alimentação');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    carregarTransacoes();
  }, [mes, ano]);

  const carregarTransacoes = async () => {
    try {
      const usuarioId = localStorage.getItem('usuario_id');
      const dados = await listarGastos(usuarioId, mes, ano);
      setTransacoes(dados);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usuarioId = localStorage.getItem('usuario_id');
      await criarGasto({
        usuario_id: usuarioId,
        tipo,
        categoria,
        descricao,
        valor: parseFloat(valor),
        data,
      });

      setDescricao('');
      setValor('');
      setData(new Date().toISOString().split('T')[0]);
      carregarTransacoes();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deletar?')) {
      await deletarGasto(id);
      carregarTransacoes();
    }
  };

  return (
    <Layout>
      <div className="transacoes-container">
        <h1>Transações</h1>

        <form onSubmit={handleSubmit} className="form-transacao">
          <div className="form-group">
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="saida">Saída</option>
              <option value="entrada">Entrada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option>Alimentação</option>
              <option>Transporte</option>
              <option>Saúde</option>
              <option>Lazer</option>
              <option>Salário</option>
            </select>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Almoço"
              required
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar Transação'}
          </button>
        </form>

        <div className="historico">
          <h2>Histórico - {mes}/{ano}</h2>
          {transacoes.length === 0 ? (
            <p>Sem transações</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td>{t.descricao}</td>
                    <td>{t.categoria}</td>
                    <td className={t.tipo}>{t.tipo}</td>
                    <td>R$ {parseFloat(t.valor).toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleDelete(t.id)} className="btn-delete">
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}