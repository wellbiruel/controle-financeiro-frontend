import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import api from '../services/api';
import Layout from '../Components/Layout/Layout';

function FluxoAnualPage() {
  const [user, setUser] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      buscarGrupos();
    }
  }, [navigate]);

  const buscarGrupos = async () => {
    try {
      const response = await api.get('/fluxo/grupos');
      setGrupos(response.data);
    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1>Fluxo Anual</h1>
        {/* Conteúdo será implementado */}
      </div>
    </Layout>
  );
}

export default FluxoAnualPage;
