export interface Transaction {
  id: string;
  type: 'entry' | 'exit';
  category: string;
  amount: number;
  paymentMethod: 'pix' | 'cash' | 'transfer';
  description: string;
  field?: string;
  month?: string;
  startDate?: string;
  documentNumber?: string;
  date: string;
  createdBy: string;
}

export interface Registration {
  id: string;
  field: string;
  month: string;
  category: string;
  amount: number;
  date: string;
  createdBy: string;
}

export interface Prebenda {
  id: string;
  type: 'entry' | 'exit';
  pastor: string;
  amount: number;
  month: string;
  field?: string;
  description: string;
  paymentMethod: 'pix' | 'cash' | 'transfer';
  documentNumber?: string;
  isAuxilio?: boolean;
  isPrebenda?: boolean;
  date: string;
  createdBy: string;
}

export interface Payment {
  id: string;
  category: string;
  amount: number;
  paymentMethod: 'pix' | 'cash' | 'transfer';
  description: string;
  field?: string;
  month?: string;
  date: string;
  createdBy: string;
}

export interface PastorRegistration {
  id: string;
  pastorName: string;
  spouseName: string;
  currentField: string;
  fieldPeriod: string;
  children: Child[];
  birthDate: string;
  description: string;
  phone: string;
  previousFields: PreviousField[];
  date: string;
  createdBy: string;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string;
}

export interface PreviousField {
  id: string;
  fieldName: string;
  year: string;
}

export interface ObreiroRegistration {
  id: string;
  nomeCompleto: string;
  setor: string;
  campo: string;
  campoMissionario?: string;
  tipo: 'pastor' | 'missionaria' | 'evangelista' | 'jubilado';
  pagamento: {
    tipo: 'dinheiro' | 'banco';
    banco?: {
      agencia: string;
      contaPoupanca?: string;
      contaCorrente?: string;
    };
  };
  observacoes?: string;
  date: string;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'client' | 'usuario';
  fullName?: string;
  email?: string;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

// NOVA INTERFACE PARA FAIXAS DE DOCUMENTOS
export interface DocumentRange {
  id: string;
  name: string;
  startNumber: string;
  endNumber: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ReportFilter {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  type?: 'entry' | 'exit' | 'all';
  paymentMethod?: string;
  field?: string;
}

export const SECTORS = {
  'Setor 01': ['Boa Vista'],
  'Setor 02': ['Bonfim', 'Manoá', 'São Francisco', 'Nova Esperança'],
  'Setor 03': ['Cantá', 'Serra Grande 1', 'Serra Grande 2'],
  'Setor 04': ['Fly Hill', 'Normandia', 'Kaicumbay'],
  'Setor 05': ['São José', 'Vila Central', 'Felix Pinto'],
  'Setor 06': ['Uiramutã', 'Água Fria'],
  'Setor 07': ['Três Corações', 'Araçá'],
  'Setor 08': ['Pacaraima', 'Boca da Mata', 'Santa Helena', 'Surumú'],
  'Setor 09': ['Alto Alegre', 'Samauma', 'Vila Reslândia'],
  'Setor 10': ['Vista Alegre', 'Passarão', 'Lago Grande'],
  'Setor 11': ['Mucajaí', 'Roxinho', 'Tamandaré'],
  'Setor 12': ['Caracaraí', 'Petrolina do Norte', 'Vista Alegre'],
  'Setor 13': ['Caroebe', 'Entre Rios', 'Novo Caroebe', 'São Luizão'],
  'Setor 14': ['Rorainópolis Norte', 'Rorainópolis Sul', 'Martins Pereira'],
  'Setor 15': ['Santa Maria Boiaçu'],
  'Setor 16': ['Novo Caroebe', 'Novo Paraiso', 'Vila Moderna', 'Baruana'],
  'Setor 17': ['Remanço'],
  'Setor 18': ['Boqueirão', 'Taiano'],
  'Setor 19': ['Apiau', 'Campos Novos', 'Penha', 'Vila Nova'],
  'Setor 20': ['Amajari', 'Garagem', 'Tepequem', 'Vila Maracá'],
  'Setor 21': ['Agua Santa', 'Murupu', 'Truaru'],
  'Setor 22': ['Malacacheta', 'Taboca', 'Vila Vilena'],
  'Setor 23': ['São João da Baliza', 'São Luiz do Anaua', 'Serra Dourada'],
  'Setor 24': ['Equador', 'Jundia', 'Nova Colina'],
  'Setor 25': ['Iracema', 'São José'],
  'Setor 26': ['Recrear', 'São Silvestre'],
  'Setor 27': ['Napoleão', 'Raposa', 'Xumina'],
  'Setor 28': ['Cumanã-VE', 'Maturim-VE', 'Anaco-VE', 'Punta de Mata-VE', 'Carúpano'],
  'Setor 29': ['Colômbia'],
  'Setor 30': ['África'],
  'ADMINISTRATIVO': ['CEDADER']
};

export const FIELDS = Object.values(SECTORS).flat();

// GARANTINDO QUE TODOS OS 12 MESES ESTEJAM DISPONÍVEIS
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const PASTORS = [
  'Pr. Isamar Pessoa Ramalho'
];

export const CATEGORIES = {
  entry: [
    'Fundo Convencional',
    'Oferta Missionária',
    '1% S.O.S BAIXO RIO BRANCO'
  ],
  exit: [
    'Missões África',
    'Missões Guiana',
    'Missões Venezuela',
    'Missões Colômbia',
    'Missões Baixo Rio Branco',
    'Missões Indígenas',
    'Passagem',
    'Aluguel',
    'Hospedagem',
    'Jubilado',
    'Pr. Isamar Pessoa Ramalho',
    'Alimentação',
    'Gasolina',
    'Evento',
    'Construção',
    'Ajuda Social',
    'Frete',
    'Missões Urbanas',
    'Outras'
  ]
};

export const PAYMENT_CATEGORIES = [
  'Missionário Indígena',
  'Missão Urbana',
  'Jubilado',
  'Venezuela',
  'África',
  'Panamá',
  'Guiana Inglesa',
  'Energia',
  'Água',
  'Aluguel',
  'Terreno',
  'Outros'
];

export const PAYMENT_METHODS = ['pix', 'cash', 'transfer'] as const;

export interface FinancialGoal {
  id: string;
  field: string;
  year: number;
  monthlyGoals: {
    [key: string]: number; // Janeiro: 1000, Fevereiro: 1200, etc.
  };
  annualGoal: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface GoalProgress {
  field: string;
  year: number;
  month: string;
  goalAmount: number;
  actualAmount: number;
  percentage: number;
  status: 'below' | 'on-track' | 'exceeded';
}