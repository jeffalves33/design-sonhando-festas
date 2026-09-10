# Sonhando Festas

Protótipo mobile de gestão para Marcia Silva, com React, TypeScript, Vite, TanStack Router e Tailwind CSS.

## Executar

Requer Node.js 22.12+ e npm.

```sh
npm install
npm run dev
```

## Verificar e gerar versão de apresentação

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Também é possível executar todas as verificações com `npm run check`.

O build estático fica em `dist`. Em uma hospedagem estática, configure fallback das rotas para `index.html`.

## Funcionalidades

- Início, agenda diária/semanal/mensal, eventos e detalhes.
- Clientes com cadastro, preferências, datas importantes e histórico.
- Orçamentos em cinco etapas, preços personalizados, descontos e compartilhamento manual.
- Aprovação com bloqueio de conflito operacional e estoque insuficiente, reserva de itens e criação de conta a receber.
- Catálogo de itens físicos e serviços, fotos e disponibilidade por data.
- Financeiro, pagamentos parciais, contas a pagar/receber, parcelas mensais e fluxo por vencimento.
- Relatórios, exportação CSV, perfil, cópia JSON, restauração e retorno aos dados originais.
- Manifesto de aplicativo mobile com a `logo.jpg` como ícone e identidade visual.

## Dados e escopo

Demonstração com dados fictícios e data de referência de 14/06/2026. Alterações persistem no localStorage deste navegador (chave `sonhando-festas-v1`). A opção de exportação em Configurações permite guardar uma cópia JSON.

Não há backend, autenticação, sincronização entre dispositivos ou envio automático. O compartilhamento usa a folha nativa do dispositivo quando disponível; em outros navegadores, baixa uma proposta em texto. Para produção, implementar banco de dados, autenticação, backups e conciliação financeira.

Reservas físicas ocupam o dia inteiro e incluem o dia seguinte quando a desmontagem atravessa a meia-noite. Serviços não consomem estoque. Eventos cancelados ou realizados liberam as reservas. A agenda considera uma única responsável e inclui o deslocamento antes da montagem. O fluxo de caixa agrupa os recebimentos/pagamentos pelo vencimento da conta; não é um extrato bancário por data da transação.
# design-sonhando-festas
