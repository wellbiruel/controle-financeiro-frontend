# FinanControl — Design System

## Hierarquia de cards (OBRIGATÓRIO em todos os cards)

1. Label seção    — 10px · 600 · uppercase · #9CA3AF · marginBottom: 2px
2. Título         — 13px · 500 · #111827 · marginBottom: 2px  
3. Subtítulo      — 11px · #9CA3AF · marginBottom: 10px
── separação visual ──
4. Nome do item   — 14px · 600 · #111827 (SOMENTE quando existe, nunca mostrar "—")
5. Valor principal — 22px · 500 · cor semântica · lineHeight: 1 · marginBottom: 4px
6. Contexto       — 11px · #9CA3AF · marginBottom: 8px
7. Barra          — height: 4px · bg #F3F4F6 · marginBottom: 8px (se aplicável)
8. Badge/alerta   — inline-flex · padding 3px 8px · borderRadius 6px (se aplicável)
9. Link rodapé    — 12px · #2563EB · fontWeight 500 · marginTop: auto

## SEM accent bars no topo dos cards
## Cards usam display: flex · flexDirection: column
## SEM position: relative · SEM overflow: hidden (exceto quando necessário)

## Cores semânticas
- Verde:   #16A34A (positivo, crescimento, reserva ok)
- Vermelho: #EF4444 (negativo, alerta crítico, saídas)
- Âmbar:  #F59E0B (atenção, teto, limite)
- Azul:   #2563EB (investimentos, links)
- Roxo:   #8B5CF6 (metas)
- Cinza:  #6B7280 (neutro)

## Regras UX
- NUNCA mostrar "—" antes do valor — omitir o nome quando não há dado
- Barra SEMPRE após valor e contexto, NUNCA antes
- Badge SEMPRE após barra
- Link SEMPRE no rodapé com marginTop: auto
- Sem bordas internas entre colunas side-by-side
