import { useState, useRef, useCallback } from 'react';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

const STEPS = ['Upload', 'Validação', 'Confirmação'];

const c = {
  primary:    '#1B3A6B',
  bg:         '#F8FAFC',
  white:      'white',
  border:     '#E2E8F0',
  text:       '#0F172A',
  muted:      '#64748B',
  success:    '#16A34A',
  danger:     '#DC2626',
  successBg:  '#DCFCE7',
  dangerBg:   '#FEE2E2',
  warningBg:  '#FEF3C7',
};

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
      {STEPS.map((label, i) => {
        const num = i + 1;
        const ativo = num === step;
        const feito = num < step;
        return (
          <span key={label} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                background: feito ? c.success : ativo ? c.primary : c.border,
                color: feito || ativo ? 'white' : c.muted,
              }}>
                {feito ? '✓' : num}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: ativo ? '600' : '400',
                color: ativo ? c.primary : c.muted,
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 8px', marginBottom: '18px',
                background: feito ? c.success : c.border, transition: 'background 0.2s',
              }} />
            )}
          </span>
        );
      })}
    </div>
  );
}

function CardResumo({ label, valor, corValor = c.text }) {
  return (
    <div style={{
      background: c.white, borderRadius: '10px', border: `1px solid ${c.border}`, padding: '16px',
    }}>
      <p style={{
        fontSize: '11px', color: c.muted, margin: '0 0 6px',
        textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '20px', fontWeight: '700', color: corValor, margin: 0 }}>{valor}</p>
    </div>
  );
}

export default function ImportacaoPage() {
  const [step, setStep]         = useState(1);
  const [dragging, setDragging] = useState(false);
  const [arquivo, setArquivo]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [linhas, setLinhas]     = useState([]);
  const [resumo, setResumo]     = useState(null);
  const [erro, setErro]         = useState(null);
  const [importado, setImportado] = useState(null);
  const inputRef = useRef(null);

  /* ---------- Download modelo ---------- */
  const baixarModelo = async () => {
    try {
      const resp = await api.get('/importacao/modelo', { responseType: 'blob' });
      const url = URL.createObjectURL(resp.data);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = 'modelo_financeiro.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro('Erro ao baixar modelo. Verifique a conexão com o servidor.');
    }
  };

  /* ---------- Drag and drop ---------- */
  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validarESelecionarArquivo(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validarESelecionarArquivo = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setErro('Formato inválido. Use .xlsx, .xls ou .csv.');
      return;
    }
    setArquivo(file);
    setErro(null);
  };

  /* ---------- Preview ---------- */
  const enviarPreview = async () => {
    if (!arquivo) return;
    setLoading(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append('arquivo', arquivo);
      const resp = await api.post('/importacao/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLinhas(resp.data.linhas  ?? []);
      setResumo(resp.data.resumo  ?? {});
      setStep(2);
    } catch (e) {
      setErro(e.response?.data?.mensagem || 'Erro ao processar arquivo. Verifique o formato.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Confirmar ---------- */
  const confirmarImportacao = async () => {
    setLoading(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append('arquivo', arquivo);
      const resp = await api.post('/importacao/confirmar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportado(resp.data.importados ?? resumo?.validas ?? 0);
      setStep(3);
    } catch (e) {
      setErro(e.response?.data?.mensagem || 'Erro ao confirmar importação.');
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setStep(1);
    setArquivo(null);
    setLinhas([]);
    setResumo(null);
    setErro(null);
    setImportado(null);
  };

  /* =========================================================== */
  return (
    <Layout>
      <div style={{ padding: '28px 32px', background: c.bg, minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: c.text, margin: 0 }}>
            Importar Dados
          </h1>
          <p style={{ fontSize: '13px', color: c.muted, margin: '4px 0 0' }}>
            Importe transações a partir de planilhas .xlsx ou .csv.
          </p>
        </div>

        <div style={{ maxWidth: '860px' }}>
          <StepBar step={step} />

          {/* ===== STEP 1 — Upload ===== */}
          {step === 1 && (
            <div>
              {/* Download modelos */}
              <div style={{
                background: c.white, borderRadius: '12px', border: `1px solid ${c.border}`,
                padding: '20px', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: c.text, margin: '0 0 12px' }}>
                  1. Baixe o modelo e preencha com seus dados
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={baixarModelo}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      border: `1px solid ${c.border}`, background: c.white,
                      borderRadius: '8px', padding: '9px 16px', width: 'fit-content',
                      fontSize: '13px', fontWeight: '500', color: c.text, cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = c.bg}
                    onMouseLeave={e => e.currentTarget.style.background = c.white}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={c.primary}>
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Baixar modelo completo (.xlsx)
                  </button>
                  <p style={{ margin: 0, fontSize: '12px', color: c.muted }}>
                    O arquivo contém 3 abas: <strong>Saídas</strong>, <strong>Entradas</strong> e <strong>Exemplos</strong> (com dados de referência).
                  </p>
                </div>
              </div>

              {/* Drag and drop */}
              <div style={{
                background: c.white, borderRadius: '12px', border: `1px solid ${c.border}`,
                padding: '20px',
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: c.text, margin: '0 0 12px' }}>
                  2. Envie o arquivo preenchido
                </p>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? c.primary : c.border}`,
                    borderRadius: '10px', padding: '44px 20px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: dragging ? '#EFF6FF' : '#FAFAFA',
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24"
                    fill={dragging ? c.primary : '#CBD5E1'}
                    style={{ marginBottom: '12px' }}
                  >
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 5l-3-3v2H5v2h4v2l3-3z"/>
                  </svg>

                  {arquivo ? (
                    <>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: c.primary, margin: '0 0 4px' }}>
                        {arquivo.name}
                      </p>
                      <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>
                        {(arquivo.size / 1024).toFixed(1)} KB — clique para trocar
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: c.text, margin: '0 0 4px' }}>
                        Arraste o arquivo aqui ou clique para selecionar
                      </p>
                      <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>
                        Formatos aceitos: .xlsx, .xls, .csv
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files[0]) validarESelecionarArquivo(e.target.files[0]); }}
                />

                {erro && (
                  <p style={{
                    marginTop: '12px', fontSize: '13px', color: c.danger,
                    background: c.dangerBg, padding: '8px 12px', borderRadius: '8px',
                  }}>
                    {erro}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    onClick={enviarPreview}
                    disabled={!arquivo || loading}
                    style={{
                      background: arquivo && !loading ? c.primary : '#CBD5E1',
                      color: 'white', border: 'none', borderRadius: '8px',
                      padding: '10px 24px', fontSize: '13px', fontWeight: '500',
                      cursor: arquivo && !loading ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {loading ? 'Processando...' : 'Avançar →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2 — Preview / Validação ===== */}
          {step === 2 && resumo && (
            <div>
              {/* Resumo — linha 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <CardResumo label="Total de linhas" valor={resumo.total ?? 0} corValor={c.primary} />
                <CardResumo label="Válidas"         valor={resumo.validas ?? 0} corValor={c.success} />
                <CardResumo label="Inválidas"       valor={resumo.invalidas ?? 0} corValor={resumo.invalidas > 0 ? c.danger : c.muted} />
              </div>

              {/* Resumo — linha 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <CardResumo
                  label="Total entradas"
                  valor={`R$ ${parseFloat(resumo.total_entradas ?? 0).toFixed(2)}`}
                  corValor={c.success}
                />
                <CardResumo
                  label="Total saídas"
                  valor={`R$ ${parseFloat(resumo.total_saidas ?? 0).toFixed(2)}`}
                  corValor={c.danger}
                />
              </div>

              {/* Tabela de linhas */}
              <div style={{
                background: c.white, borderRadius: '12px', border: `1px solid ${c.border}`,
                overflow: 'hidden', marginBottom: '16px',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.border}` }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.text }}>
                    Preview das transações
                  </p>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: c.bg }}>
                        {['#', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map((h) => (
                          <th key={h} style={{
                            padding: '10px 14px', textAlign: h === 'Valor' ? 'right' : 'left',
                            fontSize: '11px', color: c.muted, fontWeight: '600',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0,
                            background: c.bg,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((l) => (
                        <tr key={l.linha} style={{
                          background: l.valida ? 'transparent' : '#FFF5F5',
                          borderBottom: `1px solid #F1F5F9`,
                        }}>
                          <td style={{ padding: '10px 14px', color: c.muted }}>{l.linha}</td>
                          <td style={{ padding: '10px 14px', color: l.data ? c.text : c.danger }}>
                            {l.data || <em style={{ color: c.danger }}>—</em>}
                          </td>
                          <td style={{ padding: '10px 14px', color: c.text }}>{l.descricao || '—'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            {l.categoria
                              ? <span style={{ background: '#F1F5F9', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', color: c.muted }}>{l.categoria}</span>
                              : '—'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {l.tipo && (
                              <span style={{
                                background: l.tipo === 'entrada' ? c.successBg : c.dangerBg,
                                color:      l.tipo === 'entrada' ? c.success   : c.danger,
                                borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: '500',
                              }}>
                                {l.tipo}
                              </span>
                            )}
                          </td>
                          <td style={{
                            padding: '10px 14px', textAlign: 'right', fontWeight: '600',
                            color: l.tipo === 'entrada' ? c.success : c.danger,
                          }}>
                            {l.valor != null
                              ? `R$ ${parseFloat(l.valor).toFixed(2)}`
                              : <em style={{ color: c.danger }}>—</em>}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {l.valida
                              ? <span style={{ color: c.success, fontSize: '12px', fontWeight: '600' }}>✓ OK</span>
                              : (
                                <span
                                  title={l.erros?.join(' | ')}
                                  style={{ color: c.danger, fontSize: '12px', fontWeight: '600', cursor: 'help', textDecoration: 'underline dotted' }}
                                >
                                  ✗ {l.erros?.[0] || 'Inválido'}
                                </span>
                              )
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aviso de inválidas */}
              {(resumo.invalidas ?? 0) > 0 && (
                <div style={{
                  background: c.warningBg, border: '1px solid #FDE68A', borderRadius: '8px',
                  padding: '10px 14px', fontSize: '13px', color: '#92400E', marginBottom: '14px',
                }}>
                  {resumo.invalidas} linha(s) inválida(s) serão ignoradas na importação.
                  Passe o mouse sobre o status para ver os erros.
                </div>
              )}

              {erro && (
                <p style={{ fontSize: '13px', color: c.danger, background: c.dangerBg, padding: '8px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                  {erro}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={reiniciar}
                  style={{
                    background: c.white, color: c.text, border: `1px solid ${c.border}`,
                    borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  ← Voltar
                </button>
                <button
                  onClick={confirmarImportacao}
                  disabled={loading || (resumo.validas ?? 0) === 0}
                  style={{
                    background: (resumo.validas ?? 0) > 0 && !loading ? c.primary : '#CBD5E1',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '10px 24px', fontSize: '13px', fontWeight: '500',
                    cursor: (resumo.validas ?? 0) > 0 && !loading ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading
                    ? 'Importando...'
                    : `Confirmar importação (${resumo.validas ?? 0} registro${(resumo.validas ?? 0) !== 1 ? 's' : ''})`}
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3 — Sucesso ===== */}
          {step === 3 && (
            <div style={{
              background: c.white, borderRadius: '12px', border: `1px solid ${c.border}`,
              padding: '56px 32px', textAlign: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: c.successBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={c.success}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.text, margin: '0 0 8px' }}>
                Importação concluída!
              </h2>
              <p style={{ fontSize: '14px', color: c.muted, margin: '0 0 32px' }}>
                <strong style={{ color: c.success }}>{importado} transações</strong> importadas com sucesso.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={reiniciar}
                  style={{
                    background: c.white, color: c.text, border: `1px solid ${c.border}`,
                    borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  Nova importação
                </button>
                <button
                  onClick={() => window.location.href = '/transacoes'}
                  style={{
                    background: c.primary, color: 'white', border: 'none',
                    borderRadius: '8px', padding: '10px 24px', fontSize: '13px',
                    fontWeight: '500', cursor: 'pointer',
                  }}
                >
                  Ver transações →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
