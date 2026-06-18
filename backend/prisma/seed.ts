/**
 * Seed de demonstração — Gestão Financeira Corporativa.
 *
 * Popula um usuário de teste com categorias e movimentações realistas de uma
 * empresa de tecnologia de médio porte ao longo de 4 meses. É idempotente:
 * pode ser executado várias vezes (recria os dados do usuário seed).
 *
 * Execução: `npm run seed`  (ou `npx prisma db seed`)
 */
import { PrismaClient, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_USER = {
  name: 'Marina Costa',
  email: 'marina.costa@fincorp.com.br',
  password: 'fincorp123',
};

const CATEGORIES = [
  { name: 'Receita de Clientes', description: 'Pagamentos e contratos de clientes' },
  { name: 'Folha de Pagamento', description: 'Salários e encargos da equipe' },
  { name: 'Fornecedores', description: 'Compras e contratos com fornecedores' },
  { name: 'Infraestrutura & Cloud', description: 'Servidores, cloud e serviços técnicos' },
  { name: 'Marketing & Vendas', description: 'Campanhas, anúncios e aquisição' },
  { name: 'Impostos & Taxas', description: 'Tributos e obrigações fiscais' },
  { name: 'Aluguel & Escritório', description: 'Locação e custos do escritório' },
  { name: 'Software & Assinaturas', description: 'Ferramentas e licenças SaaS' },
  { name: 'Viagens & Deslocamento', description: 'Passagens, hospedagem e transporte' },
  { name: 'Reembolsos', description: 'Reembolsos a colaboradores' },
] as const;

type CategoryName = (typeof CATEGORIES)[number]['name'];

interface SeedTx {
  description: string;
  value: string;
  type: TransactionType;
  category: CategoryName;
  date: string; // YYYY-MM-DD
}

/** Lançamentos que se repetem todo mês (custos e receitas recorrentes). */
function recurring(month: string): SeedTx[] {
  return [
    { description: 'Mensalidade SaaS — Cliente Acme Ltda', value: '12000.00', type: 'income', category: 'Receita de Clientes', date: `${month}-05` },
    { description: 'Contrato de suporte — Cliente Beta Tech', value: '8500.00', type: 'income', category: 'Receita de Clientes', date: `${month}-10` },
    { description: 'Folha de pagamento da equipe', value: '45800.00', type: 'expense', category: 'Folha de Pagamento', date: `${month}-05` },
    { description: 'Aluguel do escritório — Sala 1203', value: '6500.00', type: 'expense', category: 'Aluguel & Escritório', date: `${month}-08` },
    { description: 'AWS — infraestrutura cloud', value: '3240.00', type: 'expense', category: 'Infraestrutura & Cloud', date: `${month}-12` },
    { description: 'DAS — Simples Nacional', value: '9870.00', type: 'expense', category: 'Impostos & Taxas', date: `${month}-20` },
    { description: 'Google Workspace — plano Business', value: '540.00', type: 'expense', category: 'Software & Assinaturas', date: `${month}-02` },
    { description: 'Slack — plano Pro', value: '420.00', type: 'expense', category: 'Software & Assinaturas', date: `${month}-02` },
    { description: 'Figma — licenças de design', value: '280.00', type: 'expense', category: 'Software & Assinaturas', date: `${month}-02` },
  ];
}

/** Lançamentos pontuais que dão textura ao histórico. */
const ONE_OFF: SeedTx[] = [
  // Março
  { description: 'Projeto de migração — Cliente Gamma Varejo', value: '28500.00', type: 'income', category: 'Receita de Clientes', date: '2026-03-18' },
  { description: 'Google Ads — campanha de aquisição Q1', value: '5200.00', type: 'expense', category: 'Marketing & Vendas', date: '2026-03-14' },
  { description: 'Notebooks Dell — 3 unidades para devs', value: '14400.00', type: 'expense', category: 'Fornecedores', date: '2026-03-22' },
  // Abril
  { description: 'Consultoria de dados — Cliente Delta Saúde', value: '16750.00', type: 'income', category: 'Receita de Clientes', date: '2026-04-09' },
  { description: 'Meta Ads — campanha institucional', value: '3600.00', type: 'expense', category: 'Marketing & Vendas', date: '2026-04-15' },
  { description: 'Passagens aéreas — visita a cliente (GRU–POA)', value: '2380.00', type: 'expense', category: 'Viagens & Deslocamento', date: '2026-04-11' },
  { description: 'Reembolso — almoço de negócios com cliente', value: '540.00', type: 'expense', category: 'Reembolsos', date: '2026-04-16' },
  // Maio
  { description: 'Licenciamento anual — Cliente Acme Ltda', value: '42000.00', type: 'income', category: 'Receita de Clientes', date: '2026-05-06' },
  { description: 'Projeto MVP — Cliente Épsilon Logística', value: '33500.00', type: 'income', category: 'Receita de Clientes', date: '2026-05-21' },
  { description: 'Hospedagem — evento Tech Summit', value: '1890.00', type: 'expense', category: 'Viagens & Deslocamento', date: '2026-05-13' },
  { description: 'Mobiliário — 5 estações de trabalho', value: '9750.00', type: 'expense', category: 'Fornecedores', date: '2026-05-19' },
  { description: 'LinkedIn Recruiter — contratação sênior', value: '1450.00', type: 'expense', category: 'Marketing & Vendas', date: '2026-05-24' },
  // Junho (parcial)
  { description: 'Onboarding de novos clientes (lote)', value: '18900.00', type: 'income', category: 'Receita de Clientes', date: '2026-06-05' },
  { description: 'Reembolso — deslocamento equipe comercial', value: '870.00', type: 'expense', category: 'Reembolsos', date: '2026-06-09' },
  { description: 'Renovação de domínio + certificado SSL', value: '320.00', type: 'expense', category: 'Infraestrutura & Cloud', date: '2026-06-03' },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  const passwordHash = await bcrypt.hash(SEED_USER.password, 10);
  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: { name: SEED_USER.name, password: passwordHash },
    create: {
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: passwordHash,
    },
  });

  // Idempotência: limpa os dados anteriores do usuário seed.
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // Categorias.
  const categoryIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({
      data: { name: c.name, description: c.description, userId: user.id },
    });
    categoryIds[c.name] = created.id;
  }

  // Transações: recorrentes (mar–jun) + pontuais.
  const months = ['2026-03', '2026-04', '2026-05', '2026-06'];
  const allTx: SeedTx[] = [
    ...months.flatMap((m) => recurring(m)),
    ...ONE_OFF,
  ];

  await prisma.transaction.createMany({
    data: allTx.map((t) => ({
      description: t.description,
      value: t.value,
      type: t.type,
      date: new Date(`${t.date}T00:00:00Z`),
      categoryId: categoryIds[t.category],
      userId: user.id,
    })),
  });

  const income = allTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.value), 0);
  const expense = allTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.value), 0);

  console.log(`✅ Seed concluído.`);
  console.log(`   Usuário: ${SEED_USER.email} / ${SEED_USER.password}`);
  console.log(`   Categorias: ${CATEGORIES.length}`);
  console.log(`   Transações: ${allTx.length}`);
  console.log(
    `   Entradas: R$ ${income.toFixed(2)} | Saídas: R$ ${expense.toFixed(2)} | Saldo: R$ ${(income - expense).toFixed(2)}`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
