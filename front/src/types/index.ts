export interface IUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'guest';
  createdAt: string;
}

export interface IAuthResponse {
  access_token: string;
  user: IUser;
}

export type BabyGender = 'boy' | 'girl' | 'surprise';

export interface IScoreDetails {
  gender: number;
  firstName: number;
  birthDate: number;
  weight: number;
  height: number;
}

export interface IPronostic {
  id: number;
  userId: number | null;
  authorName: string;
  gender: BabyGender;
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  message?: string;
  score: number | null;
  scoreDetails: IScoreDetails | null;
  createdAt: string;
}

export interface ICreatePronosticDto {
  projectId: number;
  authorName: string;
  gender: BabyGender;
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  message?: string;
}

export interface IBirthResult {
  id: number;
  gender: 'boy' | 'girl';
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  revealedAt: string;
}

export interface IProjectMemberInfo {
  id: number;
  user: { id: number; name: string; email: string };
  joinedAt: string;
  isAdmin: boolean;
}

export interface IProject {
  id: number;
  name: string;
  inviteToken: string;
  adminInviteToken: string;
  owner: { id: number; name: string };
  birthResult: IBirthResult | null;
  winner: IPronostic | null;
  memberCount: number;
  members?: IProjectMemberInfo[];
  termDate?: string | null;
  hint?: string | null;
  pronosticsEnabled: boolean;
  birthListEnabled: boolean;
  createdAt: string;
}

export interface IUpdateProjectDto {
  name?: string;
  termDate?: string | null;
  hint?: string | null;
  pronosticsEnabled?: boolean;
  birthListEnabled?: boolean;
}

export interface IContribution {
  id: number;
  amount: number;
  participantName: string;
  userId: number | null;
  createdAt: string;
}

export interface IBirthListItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
  contributions: IContribution[];
  createdAt: string;
}

export interface ICreateBirthListItemDto {
  projectId: number;
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
}

export interface ICreateContributionDto {
  amount: number;
  participantName?: string;
}

export interface IRevealResultDto {
  gender: 'boy' | 'girl';
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
}
