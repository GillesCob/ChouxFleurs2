import type {
  IUser,
  IProject,
  IPronostic,
  IBirthListItem,
  IContribution,
  IRevealResultDto,
  ICreatePronosticDto,
  ICreateContributionDto,
  ICreateBirthListItemDto,
} from '@/types';

// ─── Utilisateur courant ──────────────────────────────────────────────────────

const MOCK_USER: IUser = {
  id: 1,
  email: 'gilles@example.com',
  name: 'Gilles',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// ─── Compteur d'IDs pour les nouvelles entités ────────────────────────────────

let nextId = 200;
const uid = () => ++nextId;

// ─── Projets ──────────────────────────────────────────────────────────────────

const projects: IProject[] = [
  {
    id: 1,
    name: 'Notre Bébé',
    inviteToken: 'token-notre-bebe',
    owner: { id: 1, name: 'Gilles' },
    birthResult: null,
    winner: null,
    memberCount: 5,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Bébé Martin',
    inviteToken: 'token-bebe-martin',
    owner: { id: 2, name: 'Sophie' },
    birthResult: null,
    winner: null,
    memberCount: 4,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

// ─── Pronostics (par projectId) ───────────────────────────────────────────────

const pronosticsStore: Record<number, IPronostic[]> = {
  1: [
    {
      id: 1,
      authorName: 'Gilles',
      gender: 'boy',
      birthDate: '2026-06-15',
      weightGrams: 3200,
      heightCm: 50,
      firstName: 'Emma',
      message: 'Allez les garçons !',
      score: null,
      scoreDetails: null,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 2,
      authorName: 'Alice',
      gender: 'girl',
      birthDate: '2026-06-20',
      weightGrams: 3000,
      heightCm: 48,
      firstName: 'Léa',
      message: 'Je sens que c\'est une fille !',
      score: null,
      scoreDetails: null,
      createdAt: '2026-03-05T14:30:00.000Z',
    },
    {
      id: 3,
      authorName: 'Bob',
      gender: 'surprise',
      birthDate: '2026-06-10',
      weightGrams: 3500,
      heightCm: 51,
      firstName: 'Hugo',
      score: null,
      scoreDetails: null,
      createdAt: '2026-03-08T09:15:00.000Z',
    },
    {
      id: 4,
      authorName: 'Charlotte',
      gender: 'girl',
      birthDate: '2026-06-25',
      weightGrams: 2900,
      heightCm: 49,
      firstName: 'Chloé',
      message: 'Fille à coup sûr !',
      score: null,
      scoreDetails: null,
      createdAt: '2026-03-10T16:45:00.000Z',
    },
    {
      id: 5,
      authorName: 'David',
      gender: 'boy',
      birthDate: '2026-06-18',
      weightGrams: 3400,
      heightCm: 52,
      firstName: 'Théo',
      score: null,
      scoreDetails: null,
      createdAt: '2026-03-12T11:00:00.000Z',
    },
  ],
  2: [
    {
      id: 6,
      authorName: 'Gilles',
      gender: 'boy',
      birthDate: '2026-07-10',
      weightGrams: 3100,
      heightCm: 50,
      firstName: 'Lucas',
      message: 'Bonne chance Sophie et Thomas !',
      score: null,
      scoreDetails: null,
      createdAt: '2026-04-01T10:00:00.000Z',
    },
  ],
};

// ─── Liste de naissance (par projectId) ──────────────────────────────────────

const birthListStore: Record<number, IBirthListItem[]> = {
  1: [
    {
      id: 10,
      name: 'Poussette 3-en-1',
      price: 599,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Poussette',
      productUrl: 'https://example.com',
      description: 'Poussette modulable : nacelle + siège + cosy',
      contributions: [
        { id: 101, amount: 150, participantName: 'Gilles', userId: 1, createdAt: '2026-03-15T10:00:00.000Z' },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 11,
      name: 'Lit à barreaux évolutif',
      price: 349,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Lit',
      productUrl: 'https://example.com',
      description: 'Convertible en lit junior jusqu\'à 6 ans',
      contributions: [
        { id: 102, amount: 100, participantName: 'Alice', userId: null, createdAt: '2026-03-16T10:00:00.000Z' },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 12,
      name: 'Transat bébé',
      price: 89,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Transat',
      productUrl: 'https://example.com',
      description: 'Transat vibrant avec mélodie intégrée',
      contributions: [
        { id: 103, amount: 89, participantName: 'Bob', userId: null, createdAt: '2026-03-17T10:00:00.000Z' },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 13,
      name: 'Babyphone vidéo',
      price: 189,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Babyphone',
      productUrl: 'https://example.com',
      description: 'Caméra HD avec vision nocturne et talkie-walkie',
      contributions: [
        { id: 104, amount: 50, participantName: 'Charlotte', userId: null, createdAt: '2026-03-18T10:00:00.000Z' },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 14,
      name: 'Siège auto groupe 0+',
      price: 199,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Siege+auto',
      productUrl: 'https://example.com',
      description: '0 à 13 kg, homologué i-Size',
      contributions: [
        { id: 105, amount: 80, participantName: 'David', userId: null, createdAt: '2026-03-19T10:00:00.000Z' },
      ],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 15,
      name: 'Chaise haute évolutive',
      price: 249,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Chaise+haute',
      productUrl: 'https://example.com',
      description: 'Réglable en hauteur, plateau amovible',
      contributions: [],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 16,
      name: 'Baignoire avec support',
      price: 59,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Baignoire',
      productUrl: 'https://example.com',
      contributions: [],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 17,
      name: 'Mobile musical',
      price: 45,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Mobile',
      productUrl: 'https://example.com',
      description: '3 mélodies et lumières douces',
      contributions: [],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 18,
      name: "Tapis d'éveil",
      price: 79,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Tapis+eveil',
      productUrl: 'https://example.com',
      description: 'Arche et jouets détachables',
      contributions: [],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      id: 19,
      name: 'Gigoteuse TOG 2.5',
      price: 39,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Gigoteuse',
      productUrl: 'https://example.com',
      description: 'Taille 6-18 mois',
      contributions: [],
      createdAt: '2026-01-20T00:00:00.000Z',
    },
  ],
  2: [
    {
      id: 20,
      name: "Portique d'éveil",
      price: 129,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Portique',
      productUrl: 'https://example.com',
      description: 'Sons, lumières et hochets détachables',
      contributions: [
        { id: 201, amount: 40, participantName: 'Gilles', userId: 1, createdAt: '2026-04-10T10:00:00.000Z' },
      ],
      createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
      id: 21,
      name: "Coussin d'allaitement",
      price: 69,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Coussin',
      productUrl: 'https://example.com',
      contributions: [],
      createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
      id: 22,
      name: 'Stérilisateur biberon',
      price: 89,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Sterilisateur',
      productUrl: 'https://example.com',
      description: 'Compatible tous types de biberons',
      contributions: [],
      createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
      id: 23,
      name: 'Porte-bébé ergonomique',
      price: 149,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Porte-bebe',
      productUrl: 'https://example.com',
      description: 'Positions face à face et dos à dos',
      contributions: [],
      createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
      id: 24,
      name: 'Veilleuse projection',
      price: 39,
      imageUrl: 'https://placehold.co/400x300/fdf2f8/9d174d?text=Veilleuse',
      productUrl: 'https://example.com',
      description: 'Projection étoiles au plafond',
      contributions: [],
      createdAt: '2026-02-05T00:00:00.000Z',
    },
  ],
};

// ─── Calcul de score ──────────────────────────────────────────────────────────

function calcScore(p: IPronostic, result: IRevealResultDto) {
  let gender = 0;
  let firstName = 0;
  let birthDate = 0;
  let weight = 0;
  let height = 0;

  if (p.gender === result.gender) gender = 20;

  const pName = p.firstName.toLowerCase().trim();
  const rName = result.firstName.toLowerCase().trim();
  if (pName === rName) firstName = 30;
  else if (pName[0] === rName[0]) firstName = 15;

  const diffDays =
    Math.abs(new Date(p.birthDate).getTime() - new Date(result.birthDate).getTime()) /
    86_400_000;
  if (diffDays === 0) birthDate = 30;
  else if (diffDays <= 3) birthDate = 20;
  else if (diffDays <= 7) birthDate = 10;

  const diffWeight = Math.abs(p.weightGrams - result.weightGrams);
  if (diffWeight <= 50) weight = 20;
  else if (diffWeight <= 150) weight = 10;

  const diffHeight = Math.abs(p.heightCm - result.heightCm);
  if (diffHeight <= 1) height = 10;
  else if (diffHeight <= 2) height = 5;

  return { gender, firstName, birthDate, weight, height };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function mockFetch<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  await new Promise<void>((r) => setTimeout(r, 80));

  const [pathname, queryString] = path.split('?');
  const params = new URLSearchParams(queryString ?? '');

  // Auth
  if (method === 'GET' && pathname === '/auth/me') {
    return MOCK_USER as T;
  }
  if (method === 'POST' && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return { access_token: 'mock-token', user: MOCK_USER } as unknown as T;
  }

  // Projets
  if (method === 'GET' && pathname === '/projects/my') {
    return projects as unknown as T;
  }
  if (method === 'POST' && pathname === '/projects') {
    const { name } = body as { name: string };
    const newProject: IProject = {
      id: uid(),
      name,
      inviteToken: `token-${Date.now()}`,
      owner: { id: 1, name: 'Gilles' },
      birthResult: null,
      winner: null,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    pronosticsStore[newProject.id] = [];
    birthListStore[newProject.id] = [];
    return newProject as unknown as T;
  }

  // Invitation
  const inviteInfoMatch = pathname.match(/^\/projects\/invite\/(.+)$/);
  if (method === 'GET' && inviteInfoMatch) {
    const token = inviteInfoMatch[1];
    const project = projects.find((p) => p.inviteToken === token);
    if (!project) throw new Error('Lien invalide ou expiré');
    return { id: project.id, name: project.name, owner: project.owner } as unknown as T;
  }
  const joinMatch = pathname.match(/^\/projects\/join\/(.+)$/);
  if (method === 'POST' && joinMatch) {
    return {} as T;
  }

  // Révéler les résultats
  const resultMatch = pathname.match(/^\/projects\/(\d+)\/result$/);
  if (method === 'POST' && resultMatch) {
    const projectId = parseInt(resultMatch[1]);
    const dto = body as IRevealResultDto;
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Projet introuvable');

    project.birthResult = { id: uid(), ...dto, revealedAt: new Date().toISOString() };

    const pList = pronosticsStore[projectId] ?? [];
    for (const p of pList) {
      const details = calcScore(p, dto);
      p.scoreDetails = details;
      p.score = Object.values(details).reduce((a, b) => a + b, 0);
    }
    if (pList.length > 0) {
      project.winner = pList.reduce((best, p) => (p.score! > best.score! ? p : best));
    }

    return {} as T;
  }

  // Pronostics
  if (method === 'GET' && pathname === '/pronostics') {
    const projectId = parseInt(params.get('projectId') ?? '0');
    return (pronosticsStore[projectId] ?? []) as unknown as T;
  }
  if (method === 'POST' && pathname === '/pronostics') {
    const dto = body as ICreatePronosticDto;
    const newP: IPronostic = {
      id: uid(),
      authorName: dto.authorName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      weightGrams: dto.weightGrams,
      heightCm: dto.heightCm,
      firstName: dto.firstName,
      message: dto.message,
      score: null,
      scoreDetails: null,
      createdAt: new Date().toISOString(),
    };
    if (!pronosticsStore[dto.projectId]) pronosticsStore[dto.projectId] = [];
    pronosticsStore[dto.projectId].push(newP);
    return newP as unknown as T;
  }
  const pronosticMatch = pathname.match(/^\/pronostics\/(\d+)$/);
  if (method === 'DELETE' && pronosticMatch) {
    const id = parseInt(pronosticMatch[1]);
    for (const arr of Object.values(pronosticsStore)) {
      const idx = arr.findIndex((p) => p.id === id);
      if (idx !== -1) { arr.splice(idx, 1); break; }
    }
    return {} as T;
  }

  // Liste de naissance
  if (method === 'GET' && pathname === '/birth-list') {
    const projectId = parseInt(params.get('projectId') ?? '0');
    return (birthListStore[projectId] ?? []) as unknown as T;
  }
  if (method === 'POST' && pathname === '/birth-list') {
    const dto = body as ICreateBirthListItemDto;
    const newItem: IBirthListItem = {
      id: uid(),
      name: dto.name,
      price: dto.price,
      imageUrl: dto.imageUrl,
      productUrl: dto.productUrl,
      description: dto.description,
      contributions: [],
      createdAt: new Date().toISOString(),
    };
    if (!birthListStore[dto.projectId]) birthListStore[dto.projectId] = [];
    birthListStore[dto.projectId].push(newItem);
    return newItem as unknown as T;
  }

  // Contributions
  const contribPostMatch = pathname.match(/^\/birth-list\/(\d+)\/contributions$/);
  if (method === 'POST' && contribPostMatch) {
    const itemId = parseInt(contribPostMatch[1]);
    const dto = body as ICreateContributionDto;
    const newC: IContribution = {
      id: uid(),
      amount: dto.amount,
      participantName: dto.participantName ?? 'Anonyme',
      userId: 1,
      createdAt: new Date().toISOString(),
    };
    for (const arr of Object.values(birthListStore)) {
      const item = arr.find((i) => i.id === itemId);
      if (item) { item.contributions.push(newC); break; }
    }
    return newC as unknown as T;
  }
  const contribDeleteMatch = pathname.match(/^\/birth-list\/contributions\/(\d+)$/);
  if (method === 'DELETE' && contribDeleteMatch) {
    const id = parseInt(contribDeleteMatch[1]);
    for (const arr of Object.values(birthListStore)) {
      for (const item of arr) {
        const idx = item.contributions.findIndex((c) => c.id === id);
        if (idx !== -1) { item.contributions.splice(idx, 1); break; }
      }
    }
    return {} as T;
  }
  const birthListDeleteMatch = pathname.match(/^\/birth-list\/(\d+)$/);
  if (method === 'DELETE' && birthListDeleteMatch) {
    const id = parseInt(birthListDeleteMatch[1]);
    for (const projectId of Object.keys(birthListStore)) {
      const arr = birthListStore[parseInt(projectId)];
      const idx = arr.findIndex((i) => i.id === id);
      if (idx !== -1) { arr.splice(idx, 1); break; }
    }
    return {} as T;
  }

  // Admin
  if (method === 'GET' && pathname === '/users') {
    return [MOCK_USER] as unknown as T;
  }

  throw new Error(`[mock] Route non gérée : ${method} ${path}`);
}
