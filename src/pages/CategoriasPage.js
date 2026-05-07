import { useState, useEffect, useCallback } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const S = {
  page:    { padding: '0 20px 24px', background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter',sans-serif" },
  topRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0 4px' },
  title:   { fontSize: '22px', fontWeight: '600', color: '#111827', margin: 0 },
  sub:     { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  btnNew:  { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,.3)' },

  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '16px' },
  card:    { background: '#fff', borderRadius: '12px', border: '0.5px solid #E5E7EB', padding: '20px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  cardTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', textTransform: 'uppercase', letterSpacing: '.05em' },
  cardCount: { fontSize: '12px', color: '#6B7280', background: '#F3F4F6', borderRadius: '20px', padding: '2px 8px' },
  seedBtn: { fontSize: '12px', color: '#2563EB', background: 'none', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontWeight: '500' },

  chips:   { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip:    { display: 'flex', alignItems: 'center', gap: '4px', background: '#F3F4F6', border: '0.5px solid #E5E7EB', borderRadius: '20px', padding: '4px 10px', fontSize: '13px', color: '#374151' },
  chipBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#9CA3AF', padding: '0 2px', lineHeight: 1 },
  empty:   { fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal:   { background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,.2)' },
  mTitle:  { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
  label:   { fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' },
  input:   { width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', boxSizing: 'border-box', outline: 'none' },
  select:  { width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', color: '#111827', boxSizing: 'border-box', background: '#fff' },
  mRow:    { display: 'flex', gap: '8px', marginTop: '16px' },
  btnCancel: { flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  btnSave:   { flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  errMsg:  { fontSize: '12px', color: '#DC2626', marginTop: '8px' },

  TIPO_LABEL: { saida: 'Saídas', entrada: 'Entradas' },
  TIPO_COLOR: { saida: '#EF4444', entrada: '#22C55E' },
};

const TIPO_DOT = { saida: '#EF4444', entrada: '#22C55E', geral: '#6B7280' };

export default function CategoriasPage() {
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [nome, setNome]               = useState('');
  const [tipoModal, setTipoModal]     = useState('saida');
  const [saving, setSaving]           = useState(false);
  const [errModal, setErrModal]       = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/categorias');
      setCategorias(r.data);
    } catch { /* silently fail */ }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const saidas   = categorias.filter(c => c.tipo === 'saida');
  const entradas = categorias.filter(c => c.tipo === 'entrada');

  const openCreate = (tipo) => {
    setModal({ mode: 'create' });
    setTipoModal(tipo);
    setNome('');
    setErrModal('');
  };

  const openEdit = (cat) => {
    setModal({ mode: 'edit', cat });
    setTipoModal(cat.tipo);
    setNome(cat.nome);
    setErrModal('');
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!nome.trim()) return setErrModal('Nome é obrigatório.');
    setSaving(true);
    setErrModal('');
    try {
      if (modal.mode === 'create') {
        await api.post('/categorias', { nome: nome.trim(), tipo: tipoModal });
      } else {
        await api.put(`/categorias/${modal.cat.id}`, { nome: nome.trim() });
      }
      setModal(null);
      carregar();
    } catch (e) {
      setErrModal(e?.response?.data?.error || 'Erro ao salvar.');
    }
    setSaving(false);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Excluir a categoria "${cat.nome}"?`)) return;
    try {
      await api.delete(`/categorias/${cat.id}`);
      carregar();
    } catch (e) {
      alert(e?.response?.data?.error || 'Erro ao excluir.');
    }
  };

  const handleSeed = async (tipo) => {
    try {
      const r = await api.post('/categorias/seed', { tipo });
      if (r.data.criadas === 0) alert('Todas as categorias padrão já existem.');
      else { carregar(); }
    } catch {
      alert('Erro ao adicionar categorias padrão.');
    }
  };

  const renderSection = (titulo, lista, tipo, dotColor) => (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
          <span style={S.cardTitle}>{titulo}</span>
          <span style={S.cardCount}>{lista.length}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={S.seedBtn} onClick={() => handleSeed(tipo)}>+ Padrões</button>
          <button style={{ ...S.seedBtn, background: dotColor, color: '#fff', borderColor: dotColor }} onClick={() => openCreate(tipo)}>+ Nova</button>
        </div>
      </div>
      {lista.length === 0 ? (
        <span style={S.empty}>Nenhuma categoria. Clique em "+ Padrões" para adicionar as categorias sugeridas.</span>
      ) : (
        <div style={S.chips}>
          {lista.map(cat => (
            <span key={cat.id} style={S.chip}>
              {cat.nome}
              <button style={S.chipBtn} title="Renomear" onClick={() => openEdit(cat)}>✏️</button>
              <button style={S.chipBtn} title="Excluir" onClick={() => handleDelete(cat)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div style={S.page}>
        <div style={S.topRow}>
          <div>
            <h1 style={S.title}>Categorias</h1>
            <p style={S.sub}>Gerencie as categorias das suas transações</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Carregando…</p>
        ) : (
          <div style={S.grid}>
            {renderSection('Saídas', saidas, 'saida', '#EF4444')}
            {renderSection('Entradas', entradas, 'entrada', '#22C55E')}
          </div>
        )}

        {modal && (
          <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <div style={S.modal}>
              <div style={S.mTitle}>
                {modal.mode === 'create' ? 'Nova categoria' : `Renomear "${modal.cat.nome}"`}
              </div>

              <label style={S.label}>Nome</label>
              <input
                style={S.input}
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
                placeholder="Ex: Mercado, Academia…"
              />

              {modal.mode === 'create' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={S.label}>Tipo</label>
                  <select style={S.select} value={tipoModal} onChange={e => setTipoModal(e.target.value)}>
                    <option value="saida">Saída</option>
                    <option value="entrada">Entrada</option>
                  </select>
                </div>
              )}

              {errModal && <div style={S.errMsg}>{errModal}</div>}

              <div style={S.mRow}>
                <button style={S.btnCancel} onClick={closeModal}>Cancelar</button>
                <button style={{ ...S.btnSave, opacity: saving ? .7 : 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
