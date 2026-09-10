export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const brlExact = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export type EventStatus = "Orçamento" | "Confirmado" | "Em preparação" | "Realizado" | "Cancelado";

export type EventItem = {
  nome: string;
  qtd: number;
  preco: number;
};

export type Evento = {
  id: string;
  cliente: string;
  clienteId: string;
  tipo: string;
  tema: string;
  data: string;
  dataCurta: string;
  inicio: string;
  fim: string;
  montagem: string;
  desmontagem: string;
  local: string;
  endereco: string;
  deslocamento: string;
  convidados: number;
  status: EventStatus;
  total: number;
  pago: number;
  custos: number;
  observacoes: string;
  itens: EventItem[];
  conflito?: string;
};

export const eventos: Evento[] = [
  {
    id: "evt-helena",
    cliente: "Helena Prado",
    clienteId: "cli-helena",
    tipo: "Aniversário infantil",
    tema: "Jardim Encantado",
    data: "Qui, 14 de junho",
    dataCurta: "14/06",
    inicio: "08:00",
    fim: "14:00",
    montagem: "07:00",
    desmontagem: "15:00",
    local: "Espaço Central",
    endereco: "Rua das Palmeiras, 220 · São Paulo",
    deslocamento: "~35 min",
    convidados: 45,
    status: "Em preparação",
    total: 4200,
    pago: 2100,
    custos: 1560,
    observacoes: "Bolo entregue pela cliente às 09h. Portão de serviço nos fundos.",
    itens: [
      { nome: "Painel redondo floral", qtd: 1, preco: 900 },
      { nome: "Arco de balões desconstruído", qtd: 1, preco: 750 },
      { nome: "Mesa provençal + toalha", qtd: 1, preco: 600 },
      { nome: "Carrinho de doces", qtd: 1, preco: 450 },
      { nome: "Kit mobiliário infantil (mesa + 6 cadeiras)", qtd: 4, preco: 250 },
      { nome: "Cordão de luzes 10m", qtd: 2, preco: 150 },
    ],
    conflito: "Montagem 07:00 colide com o casamento Igor & Ana (09:00)",
  },
  {
    id: "evt-igor",
    cliente: "Igor Menezes",
    clienteId: "cli-igor",
    tipo: "Casamento",
    tema: "Clássico terracota",
    data: "Qui, 14 de junho",
    dataCurta: "14/06",
    inicio: "09:00",
    fim: "12:00",
    montagem: "06:30",
    desmontagem: "13:30",
    local: "Sítio Bela Vista",
    endereco: "Estrada do Campo, km 8 · Cotia",
    deslocamento: "~55 min",
    convidados: 90,
    status: "Confirmado",
    total: 12800,
    pago: 6400,
    custos: 5900,
    observacoes: "Cerimônia ao ar livre, prever plano B de chuva.",
    itens: [
      { nome: "Cenário de cerimônia com flores", qtd: 1, preco: 4200 },
      { nome: "Lounge externo", qtd: 2, preco: 1600 },
      { nome: "Mesa de bolo + aparadores", qtd: 1, preco: 1800 },
      { nome: "Iluminação decorativa", qtd: 1, preco: 1900 },
    ],
    conflito: "Mesmo dia da festa da Helena — responsável único",
  },
  {
    id: "evt-technova",
    cliente: "TechNova S.A.",
    clienteId: "cli-technova",
    tipo: "Corporativo",
    tema: "Confraternização minimalista",
    data: "Sáb, 16 de junho",
    dataCurta: "16/06",
    inicio: "15:00",
    fim: "22:00",
    montagem: "11:00",
    desmontagem: "23:00",
    local: "Ginásio Norte",
    endereco: "Av. Industrial, 1400 · Guarulhos",
    deslocamento: "~40 min",
    convidados: 120,
    status: "Confirmado",
    total: 9800,
    pago: 1200,
    custos: 4300,
    observacoes: "Nota fiscal em nome da matriz. Entrada de carga até 12h.",
    itens: [
      { nome: "Painel corporativo com logo", qtd: 1, preco: 2400 },
      { nome: "Mobiliário lounge", qtd: 6, preco: 480 },
      { nome: "Balcões de bebida", qtd: 2, preco: 700 },
      { nome: "Decoração de mesas", qtd: 12, preco: 180 },
    ],
  },
  {
    id: "evt-marina",
    cliente: "Marina Coelho",
    clienteId: "cli-marina",
    tipo: "Chá revelação",
    tema: "Nuvens e balões",
    data: "Dom, 24 de junho",
    dataCurta: "24/06",
    inicio: "16:00",
    fim: "21:00",
    montagem: "13:00",
    desmontagem: "22:00",
    local: "Salão Recanto",
    endereco: "Rua Ipê Amarelo, 87 · Santo André",
    deslocamento: "~25 min",
    convidados: 60,
    status: "Orçamento",
    total: 6800,
    pago: 0,
    custos: 2900,
    observacoes: "Cliente aguarda resposta há 3 dias. Negociando desconto à vista.",
    itens: [
      { nome: "Painel de nuvens", qtd: 1, preco: 1800 },
      { nome: "Balões orgânicos", qtd: 3, preco: 900 },
      { nome: "Mesa principal + carrinho", qtd: 1, preco: 1400 },
    ],
  },
  {
    id: "evt-familia-souza",
    cliente: "Família Souza",
    clienteId: "cli-souza",
    tipo: "Aniversário infantil",
    tema: "Circo vintage",
    data: "Sáb, 25 de maio",
    dataCurta: "25/05",
    inicio: "14:00",
    fim: "20:00",
    montagem: "10:00",
    desmontagem: "21:00",
    local: "Condomínio Vista Verde",
    endereco: "Al. dos Ipês, 55 · São Bernardo",
    deslocamento: "~30 min",
    convidados: 50,
    status: "Realizado",
    total: 5400,
    pago: 5400,
    custos: 2350,
    observacoes: "Cliente recorrente há 4 anos. Sempre fecha em maio.",
    itens: [
      { nome: "Cenário circo completo", qtd: 1, preco: 3200 },
      { nome: "Carrinho de pipoca", qtd: 1, preco: 700 },
      { nome: "Mobiliário infantil", qtd: 6, preco: 250 },
    ],
  },
];

export const statusTone: Record<EventStatus, string> = {
  Orçamento: "bg-ink/8 text-ink/70 ring-1 ring-ink/20",
  Confirmado: "bg-brand/12 text-brand ring-1 ring-brand/30",
  "Em preparação": "bg-accent/12 text-accent ring-1 ring-accent/30",
  Realizado: "bg-ink text-cream",
  Cancelado: "bg-ink/5 text-ink/40 ring-1 ring-ink/15",
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  desde: string;
  recorrente: boolean;
  movimentado: number;
  ultimoEvento: string;
  proximaOportunidade: string;
  preferencias: string[];
  datas: { label: string; valor: string }[];
  observacoes: string;
  eventos: { titulo: string; data: string; valor: number; status: EventStatus }[];
  orcamentos: { titulo: string; data: string; valor: number; status: string }[];
};

export const clientes: Cliente[] = [
  {
    id: "cli-souza",
    nome: "Família Souza",
    telefone: "(11) 98812-4477",
    desde: "2022",
    recorrente: true,
    movimentado: 19400,
    ultimoEvento: "Circo vintage · 25/05",
    proximaOportunidade: "Aniversário do Théo · maio/2027",
    preferencias: ["Paleta terrosa", "Sem personagens licenciados", "Montagem cedo"],
    datas: [
      { label: "Aniversário Théo", valor: "22/05" },
      { label: "Aniversário Lia", valor: "03/11" },
    ],
    observacoes: "Fecham festa todos os anos em maio. Pagamento em 3x no cartão.",
    eventos: [
      { titulo: "Circo vintage", data: "25/05/2026", valor: 5400, status: "Realizado" },
      { titulo: "Safári", data: "20/05/2025", valor: 4900, status: "Realizado" },
      { titulo: "Fundo do mar", data: "18/05/2024", valor: 4300, status: "Realizado" },
    ],
    orcamentos: [
      { titulo: "Chá de bebê Lia", data: "12/02/2026", valor: 2800, status: "Recusado" },
    ],
  },
  {
    id: "cli-helena",
    nome: "Helena Prado",
    telefone: "(11) 99741-2093",
    desde: "2025",
    recorrente: false,
    movimentado: 4200,
    ultimoEvento: "Jardim Encantado · 14/06",
    proximaOportunidade: "Formatura infantil · dez/2026",
    preferencias: ["Tons pastel", "Flores naturais"],
    datas: [{ label: "Aniversário Manu", valor: "14/06" }],
    observacoes: "Prefere contato por ligação no fim da tarde.",
    eventos: [
      { titulo: "Jardim Encantado", data: "14/06/2026", valor: 4200, status: "Em preparação" },
    ],
    orcamentos: [
      { titulo: "Jardim Encantado", data: "02/05/2026", valor: 4200, status: "Aprovado" },
    ],
  },
  {
    id: "cli-technova",
    nome: "TechNova S.A.",
    telefone: "(11) 3344-8100",
    desde: "2024",
    recorrente: true,
    movimentado: 26200,
    ultimoEvento: "Kickoff anual · 12/01",
    proximaOportunidade: "Festa de fim de ano · dez/2026",
    preferencias: ["Identidade da marca", "Nota fiscal", "Pagamento em 30 dias"],
    datas: [{ label: "Confraternização", valor: "dezembro" }],
    observacoes: "Contato: Renata, RH. Aprovação passa por compras.",
    eventos: [
      { titulo: "Confraternização", data: "16/06/2026", valor: 9800, status: "Confirmado" },
      { titulo: "Kickoff anual", data: "12/01/2026", valor: 8400, status: "Realizado" },
    ],
    orcamentos: [
      { titulo: "Confraternização", data: "28/04/2026", valor: 9800, status: "Aprovado" },
    ],
  },
  {
    id: "cli-marina",
    nome: "Marina Coelho",
    telefone: "(11) 98120-5566",
    desde: "2026",
    recorrente: false,
    movimentado: 0,
    ultimoEvento: "—",
    proximaOportunidade: "Chá revelação · 24/06",
    preferencias: ["Azul e cinza", "Decoração discreta"],
    datas: [{ label: "Chá revelação", valor: "24/06" }],
    observacoes: "Orçamento enviado há 3 dias, aguardando retorno.",
    eventos: [],
    orcamentos: [
      { titulo: "Nuvens e balões", data: "11/06/2026", valor: 6800, status: "Pendente" },
    ],
  },
  {
    id: "cli-igor",
    nome: "Igor Menezes",
    telefone: "(11) 99003-7712",
    desde: "2026",
    recorrente: false,
    movimentado: 6400,
    ultimoEvento: "—",
    proximaOportunidade: "Casamento · 14/06",
    preferencias: ["Terracota", "Flores secas"],
    datas: [{ label: "Casamento", valor: "14/06" }],
    observacoes: "Noiva Ana acompanha todas as decisões.",
    eventos: [
      { titulo: "Casamento Igor & Ana", data: "14/06/2026", valor: 12800, status: "Confirmado" },
    ],
    orcamentos: [
      { titulo: "Casamento clássico", data: "20/03/2026", valor: 12800, status: "Aprovado" },
    ],
  },
];

export type ItemEstoque = {
  id: string;
  nome: string;
  categoria: string;
  total: number;
  disponivel: number;
  reservado: number;
  emUso: number;
  custo: number;
  referencia: number;
  alerta?: string;
};

export const categorias = [
  "Todos",
  "Decoração",
  "Painéis",
  "Balões",
  "Mobiliário",
  "Carrinhos",
  "Acessórios",
];

export const estoque: ItemEstoque[] = [
  {
    id: "itm-painel-redondo",
    nome: "Painel redondo 1,80m",
    categoria: "Painéis",
    total: 3,
    disponivel: 0,
    reservado: 2,
    emUso: 1,
    custo: 380,
    referencia: 900,
    alerta: "Reservado para Helena (14/06) e Igor (14/06) no mesmo dia",
  },
  {
    id: "itm-carrinho-doces",
    nome: "Carrinho de doces branco",
    categoria: "Carrinhos",
    total: 2,
    disponivel: 1,
    reservado: 1,
    emUso: 0,
    custo: 240,
    referencia: 450,
  },
  {
    id: "itm-mesa-provencal",
    nome: "Mesa provençal grande",
    categoria: "Mobiliário",
    total: 4,
    disponivel: 2,
    reservado: 2,
    emUso: 0,
    custo: 180,
    referencia: 600,
  },
  {
    id: "itm-baloes",
    nome: "Kit balões orgânicos",
    categoria: "Balões",
    total: 12,
    disponivel: 9,
    reservado: 3,
    emUso: 0,
    custo: 90,
    referencia: 300,
  },
  {
    id: "itm-cadeiras",
    nome: "Cadeira infantil",
    categoria: "Mobiliário",
    total: 40,
    disponivel: 16,
    reservado: 18,
    emUso: 6,
    custo: 22,
    referencia: 45,
  },
  {
    id: "itm-luzes",
    nome: "Cordão de luzes 10m",
    categoria: "Acessórios",
    total: 8,
    disponivel: 0,
    reservado: 4,
    emUso: 4,
    custo: 60,
    referencia: 150,
    alerta: "Sem unidades livres para novos eventos até 17/06",
  },
  {
    id: "itm-arranjos",
    nome: "Arranjo de flores secas",
    categoria: "Decoração",
    total: 20,
    disponivel: 11,
    reservado: 9,
    emUso: 0,
    custo: 35,
    referencia: 90,
  },
];

export type Titulo = {
  id: string;
  cliente: string;
  evento: string;
  valor: number;
  pago: number;
  vencimento: string;
  forma: string;
  status: "Em dia" | "Vence hoje" | "Atrasado" | "Parcial";
};

export const contasReceber: Titulo[] = [
  {
    id: "rec-1",
    cliente: "Helena Prado",
    evento: "Jardim Encantado",
    valor: 2100,
    pago: 0,
    vencimento: "14/06",
    forma: "Pix na entrega",
    status: "Vence hoje",
  },
  {
    id: "rec-2",
    cliente: "TechNova S.A.",
    evento: "Confraternização",
    valor: 8600,
    pago: 1200,
    vencimento: "20/06",
    forma: "Boleto 30 dias",
    status: "Parcial",
  },
  {
    id: "rec-3",
    cliente: "Igor Menezes",
    evento: "Casamento Igor & Ana",
    valor: 6400,
    pago: 0,
    vencimento: "13/06",
    forma: "Cartão 3x",
    status: "Atrasado",
  },
  {
    id: "rec-4",
    cliente: "Família Souza",
    evento: "Circo vintage",
    valor: 1800,
    pago: 1800,
    vencimento: "30/05",
    forma: "Pix",
    status: "Em dia",
  },
];

export const contasPagar = [
  {
    id: "pag-1",
    nome: "Fornecedor de balões",
    categoria: "Compras",
    valor: 1240,
    vencimento: "16/06",
  },
  {
    id: "pag-2",
    nome: "Combustível e pedágio",
    categoria: "Deslocamento",
    valor: 640,
    vencimento: "18/06",
  },
  { id: "pag-3", nome: "Aluguel do galpão", categoria: "Fixo", valor: 1800, vencimento: "20/06" },
  {
    id: "pag-4",
    nome: "Manutenção do carrinho",
    categoria: "Manutenção",
    valor: 260,
    vencimento: "27/06",
  },
];

export const despesasCategoria = [
  { nome: "Materiais", valor: 5200 },
  { nome: "Deslocamento", valor: 2100 },
  { nome: "Mão de obra extra", valor: 3800 },
  { nome: "Fixo", valor: 3000 },
];

export const fluxoCaixa = [
  { mes: "Jan", entrada: 12400, saida: 8900 },
  { mes: "Fev", entrada: 9800, saida: 7400 },
  { mes: "Mar", entrada: 15200, saida: 10100 },
  { mes: "Abr", entrada: 13900, saida: 9800 },
  { mes: "Mai", entrada: 17600, saida: 12300 },
  { mes: "Jun", entrada: 18900, saida: 14100 },
];

export const catalogoServicos = [
  { nome: "Painel redondo floral", referencia: 900 },
  { nome: "Arco de balões desconstruído", referencia: 750 },
  { nome: "Mesa provençal + toalha", referencia: 600 },
  { nome: "Carrinho de doces", referencia: 450 },
  { nome: "Cordão de luzes 10m", referencia: 150 },
];
