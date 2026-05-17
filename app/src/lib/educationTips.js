export const educationTips = [
  {
    id: 'taxa-poupanca',
    term: 'Taxa de poupança',
    termDefinition: 'Percentual da sua renda que você consegue guardar (investir) todo mês.',
    title: 'O que é taxa de poupança?',
    body: 'É o quanto da sua renda você guarda. Uma boa referência é começar com 10% e subir gradualmente até 20% ou 30%.',
  },
  {
    id: 'juros-compostos',
    term: 'Juros compostos',
    termDefinition: 'Juros que rendem sobre o valor original mais os juros já acumulados ao longo do tempo.',
    title: 'Por que juros compostos importam?',
    body: 'O dinheiro rende sobre o dinheiro que já rendeu. Por isso começar cedo, mesmo com pouco, tem mais impacto do que começar tarde com muito.',
  },
  {
    id: 'reserva-emergencia',
    term: 'Reserva de emergência',
    termDefinition: 'Dinheiro guardado em aplicações líquidas para cobrir imprevistos sem precisar se endividar.',
    title: 'Quanto guardar na reserva de emergência?',
    body: 'O ideal é ter entre 3 e 6 meses dos seus gastos essenciais em aplicações de liquidez diária, como Tesouro Selic ou CDB com resgate imediato.',
  },
  {
    id: 'orcamento-50-30-20',
    term: 'Regra 50/30/20',
    termDefinition: 'Divisão simples do orçamento: 50% necessidades, 30% desejos, 20% poupança e investimentos.',
    title: 'Regra 50/30/20 para o orçamento',
    body: 'Divida sua renda em: 50% gastos essenciais, 30% estilo de vida e 20% para investir. Não é regra rígida, mas serve como ponto de partida.',
  },
  {
    id: 'cdb-tesouro-poupanca',
    term: 'Renda fixa',
    termDefinition: 'Investimentos com regra de remuneração conhecida no momento da aplicação.',
    title: 'Poupança, CDB ou Tesouro?',
    body: 'A poupança quase sempre rende menos que a inflação. Tesouro Selic e CDBs de liquidez diária costumam render mais, com segurança parecida.',
  },
  {
    id: 'diversificacao',
    term: 'Diversificação',
    termDefinition: 'Distribuir investimentos em ativos diferentes para reduzir risco.',
    title: 'Por que diversificar?',
    body: 'Concentrar tudo em um único ativo aumenta o risco. Misturar renda fixa, ações e fundos imobiliários ajuda a suavizar os altos e baixos.',
  },
  {
    id: 'inflacao',
    term: 'Inflação',
    termDefinition: 'Perda do poder de compra do dinheiro ao longo do tempo.',
    title: 'Seu dinheiro parado perde valor',
    body: 'Com inflação de 4% ao ano, R$ 1.000 guardados sem render viram, em 10 anos, o equivalente a cerca de R$ 675 em poder de compra.',
  },
  {
    id: 'custo-oportunidade',
    term: 'Custo de oportunidade',
    termDefinition: 'O que você deixa de ganhar ao escolher um gasto ou investimento em vez de outro.',
    title: 'Todo gasto tem um custo oculto',
    body: 'Um gasto de R$ 300 hoje, se investido a 10% ao ano, viraria cerca de R$ 780 em 10 anos. Pense no que o dinheiro poderia virar antes de gastar.',
  },
  {
    id: 'aporte-recorrente',
    term: 'Aporte recorrente',
    termDefinition: 'Hábito de investir um valor fixo em períodos regulares, independentemente do cenário.',
    title: 'Consistência vence valor',
    body: 'Investir R$ 200 todo mês por 20 anos tende a render mais que um aporte único alto e sem continuidade. O hábito pesa mais que o timing.',
  },
  {
    id: 'liquidez',
    term: 'Liquidez',
    termDefinition: 'Facilidade de transformar um investimento em dinheiro rapidamente, sem grandes perdas.',
    title: 'Liquidez antes de rentabilidade',
    body: 'Investimentos muito rentáveis podem ter prazos longos. Antes de buscar retorno alto, tenha parte do patrimônio em ativos de alta liquidez.',
  },
];

export function getDailyTipIndex(totalTips) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % totalTips;
}
