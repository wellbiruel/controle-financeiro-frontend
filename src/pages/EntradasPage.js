import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import api from '../services/api';

// ─── ESTILOS ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '0 20px 24px',
    backgroundColor: '#F3F4F6',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },

  // TOPO
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 0 4px',
  },
  titleBlock: {},
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '2px',
  },
  topButtons: {
    display: 'flex',
    gap: '10px',
  },
  btnExport: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #E9ECEF',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  btnNew: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563EB',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,.3)',
  },

  // KPI CARDS
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '14px 16px',
    border: '0.5px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'relative',
    overflow: 'hidden',
  },
  kpiAccent: (color) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: color,
    borderRadius: '10px 10px 0 0',
  }),
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '.06em',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginTop: '4px',
  },
  kpiValue: (color) => ({
    fontSize: '22px',
    fontWeight: '700',
    color: color || '#111827',
    lineHeight: 1.1,
    letterSpacing: '-.5px',
  }),
  kpiSub: {
    fontSize: '12px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  kpiUp: { color: '#16A34A', fontWeight: '600' },
  kpiDown: { color: '#EF4444', fontWeight: '600' },

  // FILTROS
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '0.5px solid #E5E7EB',
    padding: '12px 16px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  chip: (active) => ({
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: active ? 'none' : '1px solid #E5E7EB',
    backgroundColor: active ? '#2563EB' : '#F9FAFB',
    color: active ? '#fff' : '#374151',
    transition: 'all .15s',
  }),
  monthChip: (active) => ({
    padding: '4px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: active ? '#2563EB' : 'transparent',
    color: active ? '#fff' : '#6B7280',
    transition: 'all .15s',
  }),
  searchInput: {
    flex: 1,
    minWidth: '180px',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    backgroundColor: '#fff',
    fontFamily: 'inherit',
  },
  btnFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // CARD BASE
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '16px 18px',
    border: '0.5px solid #E5E7EB',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  cardLink: {
    fontSize: '12px',
    color: '#2563EB',
    cursor: 'pointer',
    fontWeight: '500',
  },
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },

  // LAYOUT PRINCIPAL (2 colunas)
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '16px',
    alignItems: 'flex-start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  chartsSubRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },

  // GRÁFICO BARRAS
  chartBarsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    height: '150px',
    gap: '5px',
    paddingTop: '20px',
    position: 'relative',
  },
  chartBarWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarLabel: {
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '5px',
  },
  chartLegend: {
    display: 'flex',
    gap: '14px',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '0.5px solid #F3F4F6',
  },
  legendDot: (color) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    marginRight: '4px',
    flexShrink: 0,
  }),
  legendText: {
    fontSize: '11px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
  },
  chartInsights: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '0.5px solid #F3F4F6',
  },
  insightItem: {
    flex: 1,
    textAlign: 'center',
  },
  insightLabel: {
    fontSize: '10px',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
  },
  insightValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    marginTop: '2px',
  },

  // DONUT
  donutSvgWrap: {
    position: 'relative',
    width: '130px',
    height: '130px',
    margin: '0 auto 14px',
  },
  donutCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
  },
  donutTotalLabel: {
    fontSize: '10px',
    color: '#9CA3AF',
  },
  donutLegend: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  donutLegendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donutLegendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#374151',
  },
  donutPct: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#111827',
  },
  donutVal: {
    fontSize: '11px',
    color: '#6B7280',
  },

  // DICAS
  dicaItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    marginBottom: '8px',
  },
  dicaIcon: (color) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: color + '18',
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '15px',
  }),
  dicaText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#111827',
  },
  dicaSub: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '1px',
  },
  dicaLink: {
    display: 'block',
    textAlign: 'center',
    color: '#2563EB',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '6px',
    cursor: 'pointer',
  },

  // INSIGHT BANNER
  insightBanner: {
    backgroundColor: '#EFF6FF',
    border: '0.5px solid #BFDBFE',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  insightBannerText: {
    fontSize: '13px',
    color: '#1E40AF',
    fontWeight: '500',
  },

  // TABELA
  tableTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
    padding: '7px 10px',
    borderBottom: '0.5px solid #F3F4F6',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 10px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '0.5px solid #F9FAFB',
    verticalAlign: 'middle',
  },
  tdValue: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: '13px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    padding: '3px',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'color .15s',
  },
  verTodas: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#2563EB',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '12px',
  },

  // FORMULÁRIO (coluna direita — sempre visível)
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '18px',
    border: '0.5px solid #E5E7EB',
    position: 'sticky',
    top: '24px',
  },
  formTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  formGroupRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px',
  },
  formGroupInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  },
  formInput: {
    padding: '8px 10px',
    borderRadius: '7px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
  },
  formSelect: {
    padding: '8px 10px',
    borderRadius: '7px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    width: '100%',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#F9FAFB',
    borderRadius: '7px',
    marginBottom: '12px',
  },
  checkLabel: {
    fontSize: '12px',
    color: '#374151',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  btnSave: {
    width: '100%',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563EB',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background .15s',
    boxShadow: '0 2px 8px rgba(37,99,235,.25)',
    fontFamily: 'inherit',
  },
  formError: {
    color: '#DC2626',
    fontSize: '12px',
    padding: '9px 10px',
    backgroundColor: '#FEF2F2',
    borderRadius: '7px',
    marginBottom: '10px',
  },
  formSuccess: {
    color: '#16A34A',
    fontSize: '12px',
    padding: '9px 10px',
    backgroundColor: '#F0FDF4',
    borderRadius: '7px',
    marginBottom: '10px',
  },

  // FOOTER BANNER
  footerBanner: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '16px 20px',
    border: '0.5px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  footerMain: {
    flex: 1,
    minWidth: '180px',
  },
  footerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  footerSub: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '3px',
  },
  footerCards: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  footerMiniCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerPill: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '20px',
    background: color + '12',
    border: `1px solid ${color}30`,
    fontSize: '12px',
    fontWeight: '500',
    color: color,
  }),

  // LOADING / SKELETON
  skeleton: {
    background: '#F1F5F9',
    borderRadius: '10px',
    animation: 'pulse 1.5s infinite',
  },
  emptyState: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: '32px',
    fontSize: '13px',
  },

  // MODAL (para edição)
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '24px',
    width: '500px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,.18)',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6B7280',
    lineHeight: 1,
  },

  badge: (tipo) => {
    const map = {
      'Salário':     { bg: '#DCFCE7', color: '#16A34A' },
      'Renda Extra': { bg: '#FFF7ED', color: '#EA580C' },
      'Outros':      { bg: '#EDE9FE', color: '#7C3AED' },
    };
    const s = map[tipo] || { bg: '#F3F4F6', color: '#374151' };
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: s.bg,
      color: s.color,
    };
  },
};

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const TIPOS = ['Todos', 'Salário', 'Renda Extra', 'Outros'];

const CATEGORIAS = {
  'Salário':     ['Salário principal', 'Adiantamento', 'Comissão CLT', 'Bônus'],
  'Renda Extra': ['Freelance', 'Venda', 'Comissão', 'Bônus', 'Cashback', 'Trabalho Extra'],
  'Outros':      ['Aluguel', 'Dividendos', 'Reembolso', 'Presente', 'Restituição', 'Investimentos'],
};

const FORMAS      = ['Conta Corrente', 'PIX', 'Dinheiro', 'Boleto', 'Investimento', 'Outro'];
const RECORRENCIAS = ['Única', 'Mensal', 'Quinzenal', 'Semanal', 'Anual'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d.split('T')[0] + 'T12:00:00');
  return dt.toLocaleDateString('pt-BR');
};

const today = () => new Date().toISOString().split('T')[0];

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function DonutChart({ total, salario, rendaExtra, outros }) {
  const CX = 65, CY = 65, R = 50, stroke = 20;
  const circ = 2 * Math.PI * R;

  const slices = [
    { value: salario,    color: '#22C55E', label: 'Salário' },
    { value: rendaExtra, color: '#F97316', label: 'Renda Extra' },
    { value: outros,     color: '#A78BFA', label: 'Outros' },
  ].filter(s => s.value > 0);

  let offset = 0;
  const segments = slices.map(s => {
    const pct  = total > 0 ? s.value / total : 0;
    const dash = pct * circ;
    const seg  = { ...s, dash, gap: circ - dash, offset };
    offset += dash;
    return seg;
  });

  if (total === 0) {
    return (
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      </svg>
    );
  }

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={-seg.offset}
        />
      ))}
    </svg>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────

function BarChart({ graficoAnual, mesAtual }) {
  if (!graficoAnual || graficoAnual.length === 0) return null;

  const maxVal = Math.max(...graficoAnual.map(m => Math.max(m.realizado || 0, m.previsto || 0)), 1);

  return (
    <div>
      <div style={styles.chartBarsRow}>
        {graficoAnual.map((m, i) => {
          const isFuture = i + 1 > mesAtual;
          const height   = Math.round(((m.realizado || 0) / maxVal) * 130);
          const heightP  = Math.round(((m.previsto  || 0) / maxVal) * 130);
          return (
            <div key={i} style={styles.chartBarWrap} title={`${MESES[i]}: ${fmt(m.realizado || 0)}`}>
              {(m.realizado || 0) > 0 && (
                <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: '600', marginBottom: '2px', position: 'absolute', top: 0 }}>
                  {m.realizado >= 1000 ? `${(m.realizado / 1000).toFixed(1)}k` : fmt(m.realizado)}
                </div>
              )}
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                <div style={{
                  width: '16px',
                  height: `${Math.max(height, 2)}px`,
                  borderRadius: '3px 3px 0 0',
                  backgroundColor: isFuture ? '#DBEAFE' : '#2563EB',
                  transition: 'height .4s ease',
                }} />
                {(m.previsto || 0) > 0 && isFuture && (
                  <div style={{
                    width: '9px',
                    height: `${Math.max(heightP, 2)}px`,
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: '#BFDBFE',
                    border: '1px dashed #93C5FD',
                    transition: 'height .4s ease',
                  }} />
                )}
              </div>
              <div style={styles.chartBarLabel}>{MESES[i]}</div>
            </div>
          );
        })}
      </div>
      <div style={styles.chartLegend}>
        <span style={styles.legendText}>
          <span style={styles.legendDot('#2563EB')} /> Realizado
        </span>
        <span style={styles.legendText}>
          <span style={{ ...styles.legendDot('#BFDBFE'), border: '1px dashed #93C5FD' }} /> Previsto
        </span>
      </div>
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Skeleton({ h = 80 }) {
  return <div style={{ ...styles.skeleton, height: h }} />;
}

// ─── FORM ENTRADA ────────────────────────────────────────────────────────────

const emptyForm = {
  tipo:              '',
  categoria:         '',
  descricao:         '',
  fonte:             '',
  valor:             '',
  data_recebimento:  today(),
  forma_recebimento: '',
  recorrencia:       'Única',
  impacta_media_base: true,
  observacao:        '',
};

function FormEntrada({ editData, onSuccess, onCancel, compact = false }) {
  const [form, setForm]       = useState(editData ? { ...emptyForm, ...editData } : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm(editData ? { ...emptyForm, ...editData } : emptyForm);
  }, [editData]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const categoriaOpts = CATEGORIAS[form.tipo] || [];

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!form.tipo)                      return setError('Selecione o tipo.');
    if (!form.descricao.trim())          return setError('Informe a descrição.');
    if (!form.valor || isNaN(parseFloat(form.valor.toString().replace(',', '.')))) return setError('Informe um valor válido.');
    if (!form.data_recebimento)          return setError('Informe a data de recebimento.');

    const payload = {
      descricao:         form.descricao,
      valor:             parseFloat(form.valor.toString().replace(',', '.')),
      tipo:              'entrada',
      data:              form.data_recebimento,
      categoria:         form.categoria,
      fonte:             form.fonte,
      forma_recebimento: form.forma_recebimento,
      recorrencia:       form.recorrencia,
      observacao:        form.observacao,
      impacta_media_base: form.impacta_media_base,
    };

    try {
      setLoading(true);
      if (editData?.id) {
        await api.put(`/transacoes/${editData.id}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      setSuccess(editData?.id ? 'Entrada atualizada!' : 'Entrada salva com sucesso!');
      if (!editData?.id) setForm(emptyForm);
      setTimeout(() => { setSuccess(''); onSuccess && onSuccess(); }, 1200);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const ig = styles.formGroupInner;

  return (
    <div>
      {/* TIPO */}
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Tipo *</label>
        <select style={styles.formSelect} value={form.tipo}
          onChange={e => { set('tipo', e.target.value); set('categoria', ''); }}>
          <option value="">Selecione o tipo</option>
          {['Salário', 'Renda Extra', 'Outros'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* DESCRIÇÃO */}
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Descrição *</label>
        <input style={styles.formInput} placeholder="Ex: Salário Maio, Freelance..."
          value={form.descricao} onChange={e => set('descricao', e.target.value)} />
      </div>

      {/* CATEGORIA + VALOR */}
      <div style={styles.formGroupRow}>
        <div style={ig}>
          <label style={styles.formLabel}>Categoria</label>
          <select style={styles.formSelect} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            <option value="">Selecione</option>
            {categoriaOpts.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={ig}>
          <label style={styles.formLabel}>Valor (R$) *</label>
          <input style={styles.formInput} placeholder="0,00" type="number" min="0" step="0.01"
            value={form.valor} onChange={e => set('valor', e.target.value)} />
        </div>
      </div>

      {/* DATA + FORMA */}
      <div style={styles.formGroupRow}>
        <div style={ig}>
          <label style={styles.formLabel}>Data de recebimento *</label>
          <input style={styles.formInput} type="date"
            value={form.data_recebimento} onChange={e => set('data_recebimento', e.target.value)} />
        </div>
        <div style={ig}>
          <label style={styles.formLabel}>Forma de recebimento</label>
          <select style={styles.formSelect} value={form.forma_recebimento} onChange={e => set('forma_recebimento', e.target.value)}>
            <option value="">Selecione</option>
            {FORMAS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* FONTE + RECORRÊNCIA */}
      <div style={styles.formGroupRow}>
        <div style={ig}>
          <label style={styles.formLabel}>Fonte / Origem</label>
          <input style={styles.formInput} placeholder="Ex: Empresa, Cliente..."
            value={form.fonte} onChange={e => set('fonte', e.target.value)} />
        </div>
        <div style={ig}>
          <label style={styles.formLabel}>Recorrência</label>
          <select style={styles.formSelect} value={form.recorrencia} onChange={e => set('recorrencia', e.target.value)}>
            {RECORRENCIAS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* OBSERVAÇÃO */}
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Observação (opcional)</label>
        <input style={styles.formInput} placeholder="Adicionar observação..."
          value={form.observacao} onChange={e => set('observacao', e.target.value)} />
      </div>

      {/* CHECKBOX */}
      <div style={styles.checkRow}>
        <input type="checkbox" id="impacta" checked={form.impacta_media_base}
          onChange={e => set('impacta_media_base', e.target.checked)}
          style={{ marginTop: '2px', cursor: 'pointer', accentColor: '#2563EB' }} />
        <label htmlFor="impacta" style={styles.checkLabel}>
          <strong>Impacta média futura</strong><br />
          <span style={{ fontSize: '11px' }}>Desmarque para bônus que não representam renda recorrente.</span>
        </label>
      </div>

      {error   && <div style={styles.formError}>{error}</div>}
      {success && <div style={styles.formSuccess}>✓ {success}</div>}

      <div style={{ display: 'flex', gap: '8px' }}>
        {onCancel && (
          <button onClick={onCancel}
            style={{ ...styles.btnSave, backgroundColor: '#F3F4F6', color: '#374151', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '11px 16px' }}>
            Cancelar
          </button>
        )}
        <button onClick={handleSubmit} disabled={loading}
          style={{ ...styles.btnSave, flex: 1, opacity: loading ? .75 : 1 }}>
          {loading ? 'Salvando...' : editData?.id ? 'Atualizar entrada' : 'Salvar entrada'}
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function EntradasPage() {
  const navigate = useNavigate();
  const hoje     = new Date();

  const [mes,        setMes]        = useState(hoje.getMonth() + 1);
  const [ano]                       = useState(hoje.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [busca,      setBusca]      = useState('');
  const [resumo,     setResumo]     = useState(null);
  const [entradas,   setEntradas]   = useState([]);
  const [loadingResumo,   setLoadingResumo]   = useState(true);
  const [loadingEntradas, setLoadingEntradas] = useState(true);
  const [editData,   setEditData]   = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [pagina,     setPagina]     = useState(1);
  const POR_PAGINA = 10;

  // Carrega KPIs via /entradas/resumo (endpoint dedicado); silencia se não existir
  const carregarResumo = useCallback(async () => {
    try {
      setLoadingResumo(true);
      const r = await api.get(`/entradas/resumo?mes=${mes}&ano=${ano}`);
      setResumo(r.data);
    } catch {
      setResumo(null);
    } finally {
      setLoadingResumo(false);
    }
  }, [mes, ano]);

  // Carrega lista via /transacoes com filtros por mês, ano e tipo
  const carregarEntradas = useCallback(async () => {
    try {
      setLoadingEntradas(true);
      const tipo = tipoFiltro !== 'Todos' ? `&tipo=${encodeURIComponent(tipoFiltro)}` : '';
      const r    = await api.get(`/transacoes?mes=${mes}&ano=${ano}${tipo}`);
      setEntradas(Array.isArray(r.data) ? r.data : (r.data.entradas || []));
    } catch {
      setEntradas([]);
    } finally {
      setLoadingEntradas(false);
    }
  }, [mes, ano, tipoFiltro]);

  useEffect(() => { carregarResumo(); },   [carregarResumo]);
  useEffect(() => { carregarEntradas(); setPagina(1); }, [carregarEntradas]);

  const entradasFiltradas = useMemo(() => {
    if (!busca.trim()) return entradas;
    const q = busca.toLowerCase();
    return entradas.filter(e =>
      (e.descricao || '').toLowerCase().includes(q) ||
      (e.categoria || '').toLowerCase().includes(q) ||
      (e.fonte     || '').toLowerCase().includes(q)
    );
  }, [entradas, busca]);

  const totalPages    = Math.ceil(entradasFiltradas.length / POR_PAGINA);
  const entradasPag   = entradasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta entrada?')) return;
    try {
      await api.delete(`/transacoes/${id}`);
      carregarEntradas();
      carregarResumo();
    } catch {
      alert('Erro ao excluir.');
    }
  };

  const handleEdit = (entrada) => {
    const tipoUI = Object.keys(CATEGORIAS).find(t =>
      CATEGORIAS[t].includes(entrada.categoria)
    ) || '';
    setEditData({
      ...entrada,
      tipo:             tipoUI,
      valor:            entrada.valor?.toString(),
      data_recebimento: (entrada.data_recebimento || entrada.data || '').split('T')[0],
    });
    setModalOpen(true);
  };

  const handleDuplicate = (entrada) => {
    const tipoUI = Object.keys(CATEGORIAS).find(t =>
      CATEGORIAS[t].includes(entrada.categoria)
    ) || '';
    setEditData({ ...entrada, id: undefined, tipo: tipoUI, data_recebimento: today() });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditData(null); };

  const onFormSuccess = () => {
    carregarEntradas();
    carregarResumo();
    closeModal();
  };

  // Dados derivados
  const r          = resumo || {};
  const total      = r.totalMes    || 0;
  const salario    = r.salario     || 0;
  const rendaExtra = r.rendaExtra  || 0;
  const outros     = r.outros      || 0;
  const media      = r.mediaMensal || 0;
  const comparativo     = r.comparativoMensal || 0;
  const graficoAnual    = r.graficoAnual || [];
  const insightTexto    = (r.insights || [])[0] || 'Seus lançamentos estão sendo analisados para gerar insights personalizados.';

  const pctSalario = total > 0 ? ((salario    / total) * 100).toFixed(1) : '0';
  const pctExtra   = total > 0 ? ((rendaExtra / total) * 100).toFixed(1) : '0';
  const pctOutros  = total > 0 ? ((outros     / total) * 100).toFixed(1) : '0';

  const melhorMes = graficoAnual.length > 0
    ? MESES[(graficoAnual.reduce((a, b) => ((a.realizado || 0) > (b.realizado || 0) ? a : b)).mes || mes) - 1]
    : '-';

  return (
    <Layout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={styles.page}>

        {/* HEADER */}
        <div style={styles.topRow}>
          <div style={styles.titleBlock}>
            <h1 style={styles.pageTitle}>Entradas</h1>
            <p style={styles.pageSubtitle}>Gerencie todas as suas receitas e aumente sua clareza financeira.</p>
          </div>
          <div style={styles.topButtons}>
            <button style={styles.btnExport} onClick={() => alert('Exportar em breve')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
            <button style={styles.btnNew} onClick={() => { setEditData(null); setModalOpen(true); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova entrada
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={styles.kpiRow}>
          {/* Total */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiAccent('#3B82F6')} />
            <div style={styles.kpiLabel}>Total no mês</div>
            {loadingResumo ? <Skeleton h={30} /> : <div style={styles.kpiValue('#2563EB')}>{fmt(total)}</div>}
            <div style={styles.kpiSub}>
              {comparativo !== 0 && (
                <span style={comparativo > 0 ? styles.kpiUp : styles.kpiDown}>
                  {comparativo > 0 ? '↑' : '↓'} {Math.abs(comparativo).toFixed(0)}%
                </span>
              )}
              <span>vs {MESES[(mes - 2 + 12) % 12]}/{ano}</span>
            </div>
          </div>

          {/* Salário */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiAccent('#22C55E')} />
            <div style={styles.kpiLabel}>Salário</div>
            {loadingResumo ? <Skeleton h={30} /> : <div style={styles.kpiValue('#16A34A')}>{fmt(salario)}</div>}
            <div style={styles.kpiSub}>{pctSalario}% do total</div>
          </div>

          {/* Renda Extra */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiAccent('#F97316')} />
            <div style={styles.kpiLabel}>Renda Extra</div>
            {loadingResumo ? <Skeleton h={30} /> : <div style={styles.kpiValue('#EA580C')}>{fmt(rendaExtra)}</div>}
            <div style={styles.kpiSub}>{pctExtra}% do total</div>
          </div>

          {/* Outros */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiAccent('#A78BFA')} />
            <div style={styles.kpiLabel}>Outros</div>
            {loadingResumo ? <Skeleton h={30} /> : <div style={styles.kpiValue('#7C3AED')}>{fmt(outros)}</div>}
            <div style={styles.kpiSub}>{pctOutros}% do total</div>
          </div>

          {/* Média Mensal */}
          <div style={styles.kpiCard}>
            <div style={styles.kpiAccent('#0891B2')} />
            <div style={styles.kpiLabel}>Média mensal ({ano})</div>
            {loadingResumo ? <Skeleton h={30} /> : <div style={styles.kpiValue('#0891B2')}>{fmt(media)}</div>}
            <div style={styles.kpiSub}>Base: Jan a {MESES[mes - 1]}/{ano}</div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Tipo:</span>
            {TIPOS.map(t => (
              <button key={t} style={styles.chip(tipoFiltro === t)} onClick={() => setTipoFiltro(t)}>{t}</button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Mês:</span>
            {MESES.map((m, i) => (
              <button key={m} style={styles.monthChip(mes === i + 1)} onClick={() => setMes(i + 1)}>{m}</button>
            ))}
          </div>
          <input
            style={styles.searchInput}
            placeholder="Buscar descrição, categoria ou fonte…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button style={styles.btnFilter}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros
          </button>
        </div>

        {/* GRID PRINCIPAL: esquerda flex:1 + direita 340px */}
        <div style={styles.mainGrid}>

          {/* COLUNA ESQUERDA */}
          <div style={styles.leftCol}>

            {/* Gráfico de barras */}
            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <span style={styles.cardTitle}>Evolução das entradas ({ano})</span>
                <span style={styles.cardLink} onClick={() => navigate('/relatorios')}>Ver relatório →</span>
              </div>
              {loadingResumo ? (
                <Skeleton h={170} />
              ) : (
                <>
                  <BarChart graficoAnual={graficoAnual} mesAtual={mes} />
                  <div style={styles.chartInsights}>
                    <div style={styles.insightItem}>
                      <div style={styles.insightLabel}>Melhor mês</div>
                      <div style={styles.insightValue}>{melhorMes}</div>
                    </div>
                    <div style={styles.insightItem}>
                      <div style={styles.insightLabel}>Crescimento acumulado</div>
                      <div style={styles.insightValue}>{comparativo > 0 ? `+${comparativo.toFixed(0)}%` : `${comparativo.toFixed(0)}%`}</div>
                    </div>
                    <div style={styles.insightItem}>
                      <div style={styles.insightLabel}>Média mensal</div>
                      <div style={styles.insightValue}>{fmt(media)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Donut + Dicas lado a lado */}
            <div style={styles.chartsSubRow}>
              {/* Donut */}
              <div style={styles.card}>
                <div style={styles.cardTitleRow}>
                  <span style={styles.cardTitle}>Entradas por categoria</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{MESES[mes - 1]}</span>
                </div>
                {loadingResumo ? <Skeleton h={160} /> : (
                  <>
                    <div style={styles.donutSvgWrap}>
                      <DonutChart total={total} salario={salario} rendaExtra={rendaExtra} outros={outros} />
                      <div style={styles.donutCenter}>
                        <div style={styles.donutTotal}>{fmt(total)}</div>
                        <div style={styles.donutTotalLabel}>Total</div>
                      </div>
                    </div>
                    <div style={styles.donutLegend}>
                      {[
                        { label: 'Salário',     color: '#22C55E', pct: pctSalario, val: salario },
                        { label: 'Renda Extra', color: '#F97316', pct: pctExtra,   val: rendaExtra },
                        { label: 'Outros',      color: '#A78BFA', pct: pctOutros,  val: outros },
                      ].map(item => (
                        <div key={item.label} style={styles.donutLegendRow}>
                          <div style={styles.donutLegendLeft}>
                            <span style={styles.legendDot(item.color)} />
                            {item.label}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={styles.donutPct}>{item.pct}%</div>
                            <div style={styles.donutVal}>{fmt(item.val)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Dicas rápidas */}
              <div style={styles.card}>
                <div style={{ ...styles.cardTitle, marginBottom: '14px' }}>Dicas rápidas</div>
                {[
                  { icon: '📅', color: '#2563EB', text: 'Mantenha os lançamentos em dia', sub: 'Melhora relatórios e previsões.' },
                  { icon: '💡', color: '#EA580C', text: 'Separe salário fixo da renda extra', sub: 'Entenda sua real capacidade de poupar.' },
                  { icon: '🎯', color: '#16A34A', text: 'Use a média como referência', sub: 'Defina metas realistas de poupança.' },
                ].map((d, i) => (
                  <div key={i} style={styles.dicaItem}>
                    <div style={styles.dicaIcon(d.color)}>{d.icon}</div>
                    <div>
                      <div style={styles.dicaText}>{d.text}</div>
                      <div style={styles.dicaSub}>{d.sub}</div>
                    </div>
                  </div>
                ))}
                <span style={styles.dicaLink} onClick={() => navigate('/relatorios')}>Ver todas as dicas →</span>
              </div>
            </div>

            {/* Insight banner */}
            <div style={styles.insightBanner}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>💬</span>
              <span style={styles.insightBannerText}>{insightTexto}</span>
            </div>

            {/* Tabela Últimas entradas */}
            <div style={styles.card}>
              <div style={styles.tableTitle}>Últimas entradas</div>

              {loadingEntradas ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} h={44} />)}
                </div>
              ) : entradasPag.length === 0 ? (
                <div style={styles.emptyState}>
                  Nenhuma entrada encontrada para o período selecionado.
                </div>
              ) : (
                <>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Data', 'Descrição', 'Categoria', 'Fonte', 'Tipo', 'Valor', 'Forma de recebimento', 'Ações'].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entradasPag.map((e) => (
                        <tr key={e.id}
                          onMouseEnter={ev => ev.currentTarget.style.backgroundColor = '#FAFAFA'}
                          onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={styles.td}>{fmtDate(e.data_recebimento || e.data)}</td>
                          <td style={styles.td}>{e.descricao}</td>
                          <td style={styles.td}>{e.categoria || '-'}</td>
                          <td style={styles.td}>{e.fonte || '-'}</td>
                          <td style={styles.td}><span style={styles.badge(e.tipo)}>{e.tipo}</span></td>
                          <td style={{ ...styles.td, ...styles.tdValue }}>{fmt(e.valor)}</td>
                          <td style={styles.td}>{e.forma_recebimento || '-'}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button style={styles.actionBtn} title="Editar"    onClick={() => handleEdit(e)}>✏️</button>
                              <button style={styles.actionBtn} title="Duplicar"  onClick={() => handleDuplicate(e)}>📋</button>
                              <button style={styles.actionBtn} title="Excluir"   onClick={() => handleDelete(e.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '14px', justifyContent: 'center' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPagina(p)} style={{
                          padding: '5px 10px', borderRadius: '7px', border: '1px solid #E5E7EB',
                          backgroundColor: pagina === p ? '#2563EB' : '#fff',
                          color: pagina === p ? '#fff' : '#374151',
                          cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
                        }}>{p}</button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <span style={styles.verTodas} onClick={() => navigate('/transacoes')}>
                Ver todas as transações →
              </span>
            </div>
          </div>

          {/* COLUNA DIREITA — formulário sempre visível */}
          <div style={styles.formCard}>
            <div style={styles.formTitle}>Adicionar nova entrada</div>
            <FormEntrada onSuccess={onFormSuccess} />
          </div>
        </div>

        {/* FOOTER BANNER */}
        <div style={styles.footerBanner}>
          <div style={styles.footerMain}>
            <div style={styles.footerTitle}>Organize suas entradas com clareza</div>
            <div style={styles.footerSub}>
              Lançamentos organizados ajudam a entender seus ganhos, planejar melhor e alcançar seus objetivos.
            </div>
          </div>
          <div style={styles.footerCards}>
            {[
              { label: 'Dados protegidos',   color: '#2563EB', icon: '🔒' },
              { label: 'Visão clara',        color: '#16A34A', icon: '📊' },
              { label: 'Decisões melhores',  color: '#EA580C', icon: '📈' },
            ].map(c => (
              <div key={c.label} style={styles.footerPill(c.color)}>
                <span>{c.icon}</span>
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL — edição / duplicação */}
      {modalOpen && (
        <div style={styles.modalOverlay}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={styles.modalBox}>
            <div style={styles.modalTitle}>
              <span>{editData?.id ? 'Editar entrada' : 'Nova entrada'}</span>
              <button style={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <FormEntrada
              editData={editData}
              onSuccess={onFormSuccess}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
