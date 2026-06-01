export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "guest";
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export type BabyGender = "boy" | "girl" | "surprise";

export interface ScoreDetails {
  gender: number;
  firstName: number;
  birthDate: number;
  weight: number;
  height: number;
}

export interface Pronostic {
  id: number;
  authorName: string;
  gender: BabyGender;
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  message?: string;
  score: number | null;
  scoreDetails: ScoreDetails | null;
  createdAt: string;
}

export interface CreatePronosticDto {
  projectId: number;
  authorName: string;
  gender: BabyGender;
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  message?: string;
}

export interface BirthResult {
  id: number;
  gender: "boy" | "girl";
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  revealedAt: string;
}

export interface ProjectMemberInfo {
  id: number;
  user: { id: number; name: string; email: string };
  joinedAt: string;
}

export interface Project {
  id: number;
  name: string;
  inviteToken: string;
  owner: { id: number; name: string };
  birthResult: BirthResult | null;
  winner: Pronostic | null;
  memberCount: number;
  members?: ProjectMemberInfo[];
  createdAt: string;
}

export interface Contribution {
  id: number;
  amount: number;
  participantName: string;
  userId: number | null;
  createdAt: string;
}

export interface BirthListItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
  contributions: Contribution[];
  createdAt: string;
}

export interface CreateBirthListItemDto {
  projectId: number;
  name: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
}

export interface CreateContributionDto {
  amount: number;
  participantName?: string;
}

export interface RevealResultDto {
  gender: "boy" | "girl";
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
}
