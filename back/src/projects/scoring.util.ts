export interface ScoreDetails {
  gender: number;
  firstName: number;
  birthDate: number;
  weight: number;
  height: number;
}

export const MAX_SCORE = 110;

function toUTCDay(d: Date | string): number {
  const date = new Date(d);
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      (1000 * 60 * 60 * 24),
  );
}

export function calculateScore(
  pronostic: {
    gender: string;
    firstName: string;
    birthDate: Date | string;
    weightGrams: number;
    heightCm: number;
  },
  result: {
    gender: string;
    firstName: string;
    birthDate: Date | string;
    weightGrams: number;
    heightCm: number;
  },
): { total: number; details: ScoreDetails } {
  const details: ScoreDetails = {
    gender: 0,
    firstName: 0,
    birthDate: 0,
    weight: 0,
    height: 0,
  };

  // Genre : 20 pts
  if (pronostic.gender === result.gender) details.gender = 20;

  // Prénom : 30 pts (insensible à la casse)
  if (
    pronostic.firstName.trim().toLowerCase() ===
    result.firstName.trim().toLowerCase()
  )
    details.firstName = 30;

  // Date de naissance : max 30 pts
  const diffDays = Math.abs(toUTCDay(pronostic.birthDate) - toUTCDay(result.birthDate));
  if (diffDays === 0) details.birthDate = 30;
  else if (diffDays <= 1) details.birthDate = 20;
  else if (diffDays <= 3) details.birthDate = 10;
  else if (diffDays <= 7) details.birthDate = 5;

  // Poids : max 20 pts
  const diffWeight = Math.abs(pronostic.weightGrams - result.weightGrams);
  if (diffWeight <= 50) details.weight = 20;
  else if (diffWeight <= 200) details.weight = 15;
  else if (diffWeight <= 500) details.weight = 10;
  else if (diffWeight <= 1000) details.weight = 5;

  // Taille : max 10 pts
  const diffHeight = Math.abs(pronostic.heightCm - result.heightCm);
  if (diffHeight === 0) details.height = 10;
  else if (diffHeight <= 1) details.height = 7;
  else if (diffHeight <= 2) details.height = 5;
  else if (diffHeight <= 3) details.height = 2;

  const total = Object.values(details).reduce((s, v) => s + v, 0);
  return { total, details };
}
