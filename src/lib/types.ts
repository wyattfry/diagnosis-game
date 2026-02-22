export type SexAssignedAtBirth = "F" | "M";

export type Units = "metric" | "imperial";
export type ResearchDifficulty = "easy" | "medium" | "difficult";
export type TypingPhase = "idle" | "thinking" | "typing";

export interface DiseaseProfileDemographics {
  agePeak: number;
  ageSpread: number;
  sexBias: Record<SexAssignedAtBirth, number>;
}

export interface DiseaseProfileVitals {
  temp: [number, number];
  bpm: [number, number];
  sys: [number, number];
  dia: [number, number];
}

export interface DiseaseProfile {
  demographics: DiseaseProfileDemographics;
  vitals: DiseaseProfileVitals;
}

export interface Disease {
  id: string;
  name: string;
  tier: number;
  definition: string;
  description: string;
  treatment?: string;
  symptomIds: string[];
  tags: string[];
  profile: DiseaseProfile;
}

export interface InterviewChoice {
  id: string;
  text: string;
  reveal: string[];
  anxietyDelta: number;
  painDelta: number;
  responses?: string[];
  repeatResponses?: string[];
  requiresAny?: string[];
  requiresAll?: string[];
  note?: string;
}

export interface CasePatientTemplate {
  age: number;
  heightCm: number;
  weightKg: number;
  complaint: string;
  bp: string;
  bpm: number;
  temperatureC: number;
}

export interface StarterCase {
  id: string;
  patient: CasePatientTemplate;
  diagnosisId: string;
  complaintCategories?: string[];
  startingAnxiety: number;
  startingPain: number;
  interviewChoices: InterviewChoice[];
}

export interface PatientProfile extends CasePatientTemplate {
  age: number;
  name: string;
  identity: string;
}

export interface TranscriptEntry {
  id: string;
  role: "system" | "doctor" | "patient";
  text: string;
}

export interface GameResult {
  win: boolean;
  message: string;
}

export interface GameState {
  activeCase: StarterCase;
  patient: PatientProfile;
  discoveredSymptoms: string[];
  questionCounts: Record<string, number>;
  newlyRevealedChoices: InterviewChoice[];
  anxiety: number;
  pain: number;
  result: GameResult | null;
  transcript: TranscriptEntry[];
}
