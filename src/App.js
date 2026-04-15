import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransacoesPage from './pages/TransacoesPage';
import CartaoCreditoPage from './pages/CartaoCreditoPage';
import CategoriasPage from './pages/CategoriasPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import FluxoAnualPage from './pages/FluxoAnualPage';
import ImportacaoPage from './pages/ImportacaoPage';
import EntradasPage from './pages/EntradasPage';
import SaidasPage from './pages/SaidasPage';
import MetasPage from './pages/MetasPage';
import { getCurrentUser } from './services/auth';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = getCurrentUser();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/transacoes" element={<PrivateRoute><TransacoesPage /></PrivateRoute>} />
        <Route path="/cartao" element={<PrivateRoute><CartaoCreditoPage /></PrivateRoute>} />
        <Route path="/categorias" element={<PrivateRoute><CategoriasPage /></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute><RelatoriosPage /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute><ConfiguracoesPage /></PrivateRoute>} />
        <Route path="/fluxo" element={<PrivateRoute><FluxoAnualPage /></PrivateRoute>} />
        <Route path="/importar" element={<PrivateRoute><ImportacaoPage /></PrivateRoute>} />
        <Route path="/entradas" element={<PrivateRoute><EntradasPage /></PrivateRoute>} />
        <Route path="/saidas" element={<PrivateRoute><SaidasPage /></PrivateRoute>} />
        <Route path="/metas" element={<PrivateRoute><MetasPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;