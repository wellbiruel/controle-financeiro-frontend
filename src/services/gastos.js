import api from './api';

export const criarGasto = async (gasto) => {
  try {
    const response = await api.post('/gastos', gasto);
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Erro ao criar gasto.';
  }
};

export const listarGastos = async (usuarioId, mes, ano) => {
  try {
    const response = await api.get('/gastos', {
      params: { usuarioId, mes, ano }
    });
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Erro ao listar gastos.';
  }
};

export const deletarGasto = async (id) => {
  try {
    const response = await api.delete(`/gastos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data.message || 'Erro ao deletar gasto.';
  }
};