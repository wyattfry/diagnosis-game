import {
  diseases,
  starterCases,
  patientNamePool,
  identityPool,
  redHerringChoices,
  ambiguousReplies,
  complaintPools,
} from "../gameData";
import type {
  Disease,
  GameState,
  InterviewChoice,
  PatientProfile,
  ResearchDifficulty,
  SexAssignedAtBirth,
  StarterCase,
} from "../types";
import { createId, randomFloat, randomFrom, randomInt, clampFloat, sampleWithoutReplacement, shuffle, uniqueStrings } from "./utils";

const MAX_TEMP = 41.5;
const MIN_TEMP = 35.0;

function sampleDemographics(): { age: number; sexAssignedAtBirth: SexAssignedAtBirth } {
  return {
    age: randomInt(14, 84),
    sexAssignedAtBirth: Math.random() < 0.5 ? "F" : "M",
  };
}

const diseaseById = new Map<string, Disease>(diseases.map((disease) => [disease.id, disease]));

function gaussianAgeWeight(age: number, peak: number, spread: number) {
  const z = (age - peak) / spread;
  return Math.exp(-0.5 * z * z);
}

function caseWeight(activeCase: StarterCase, demographics: { age: number; sexAssignedAtBirth: SexAssignedAtBirth }) {
  const disease = diseaseById.get(activeCase.diagnosisId);
  const profile = disease?.profile?.demographics;
  if (!profile) return 1;
  const ageWeight = gaussianAgeWeight(demographics.age, profile.agePeak, profile.ageSpread);
  const sexWeight = profile.sexBias?.[demographics.sexAssignedAtBirth] ?? 1;
  return Math.max(0.03, ageWeight * sexWeight);
}

function chooseCase(demographics: { age: number; sexAssignedAtBirth: SexAssignedAtBirth }) {
  const weighted = starterCases.map((candidate) => ({
    candidate,
    weight: caseWeight(candidate, demographics),
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = randomFloat(0, totalWeight);
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.candidate;
  }
  return weighted[weighted.length - 1].candidate;
}

function buildVitals(
  basePatient: StarterCase["patient"],
  diagnosisId: string,
  demographics: { age: number; sexAssignedAtBirth: SexAssignedAtBirth }
) {
  const disease = diseaseById.get(diagnosisId);
  const profile = disease?.profile?.vitals;

  const heightCm = clampFloat(basePatient.heightCm + randomInt(-4, 4), 145, 205);
  const weightKg = clampFloat(basePatient.weightKg + randomInt(-7, 7), 42, 170);

  if (!profile) {
    return {
      heightCm,
      weightKg,
      bpm: clampFloat(basePatient.bpm + randomInt(-5, 6), 55, 140),
      temperatureC: clampFloat(basePatient.temperatureC + randomFloat(-0.3, 0.35), MIN_TEMP, MAX_TEMP),
      bp: basePatient.bp,
    };
  }

  const agePressureOffset = demographics.age >= 60 ? 6 : demographics.age <= 20 ? -2 : 0;
  const systolic = Math.round(randomFloat(profile.sys[0], profile.sys[1]) + agePressureOffset);
  const diastolic = Math.round(randomFloat(profile.dia[0], profile.dia[1]) + agePressureOffset * 0.4);

  return {
    heightCm,
    weightKg,
    bpm: Math.round(randomFloat(profile.bpm[0], profile.bpm[1])),
    temperatureC: Number(clampFloat(randomFloat(profile.temp[0], profile.temp[1]), MIN_TEMP, MAX_TEMP).toFixed(1)),
    bp: `${clampFloat(systolic, 88, 220)}/${clampFloat(diastolic, 50, 130)}`,
  };
}

function buildPatientProfile(
  basePatient: StarterCase["patient"],
  activeCase: StarterCase,
  demographics: { age: number; sexAssignedAtBirth: SexAssignedAtBirth }
): PatientProfile {
  const name = `${randomFrom(patientNamePool.first)} ${randomFrom(patientNamePool.last)}`;
  const identity = randomFrom(identityPool);
  const vitals = buildVitals(basePatient, activeCase.diagnosisId, demographics);
  const complaintOptions = (activeCase.complaintCategories ?? [])
    .flatMap((category) => complaintPools[category] ?? [])
    .filter(Boolean);
  const complaint = complaintOptions.length > 0 ? randomFrom(complaintOptions) : basePatient.complaint ?? "I am not feeling well.";

  return {
    ...basePatient,
    ...vitals,
    age: demographics.age,
    name,
    identity,
    complaint,
  };
}

function buildBorrowedQuestions(baseCase: StarterCase, count: number): InterviewChoice[] {
  const foreignQuestionTexts = uniqueStrings(
    starterCases
      .filter((candidate) => candidate.diagnosisId !== baseCase.diagnosisId)
      .flatMap((candidate) => candidate.interviewChoices.map((choice) => choice.text))
  );

  const selectedTexts = sampleWithoutReplacement(foreignQuestionTexts, count);
  return selectedTexts.map((text, index) => ({
    id: `borrowed-${baseCase.id}-${index}`,
    text,
    reveal: [],
    anxietyDelta: 3,
    painDelta: 0,
    responses: ambiguousReplies,
    repeatResponses: ambiguousReplies,
  }));
}

function getWrongQuestionRange(difficulty: ResearchDifficulty) {
  if (difficulty === "difficult") return { min: 5, max: 6 };
  if (difficulty === "medium") return { min: 4, max: 5 };
  return { min: 1, max: 2 };
}

function buildActiveCase(baseCase: StarterCase, difficulty: ResearchDifficulty = "easy"): StarterCase {
  const range = getWrongQuestionRange(difficulty);
  const wrongQuestionCount = randomInt(range.min, range.max);
  const redHerringCount = Math.min(redHerringChoices.length, Math.max(1, Math.round(wrongQuestionCount * 0.4)));
  const borrowedCount = Math.max(0, wrongQuestionCount - redHerringCount);

  const selectedRedHerrings = sampleWithoutReplacement(redHerringChoices, redHerringCount).map((choice, index) => ({
    ...choice,
    id: `${choice.id}-${baseCase.id}-${index}`,
  }));
  const borrowedQuestions = buildBorrowedQuestions(baseCase, borrowedCount);

  return {
    ...baseCase,
    interviewChoices: shuffle([...baseCase.interviewChoices, ...selectedRedHerrings, ...borrowedQuestions]),
  };
}

export function createInitialState(options: { difficulty?: ResearchDifficulty } = {}): GameState {
  const difficulty = options.difficulty ?? "easy";
  const demographics = sampleDemographics();
  const activeCase = buildActiveCase(chooseCase(demographics), difficulty);
  const patient = buildPatientProfile(activeCase.patient, activeCase, demographics);

  return {
    activeCase,
    patient,
    discoveredSymptoms: [],
    questionCounts: {},
    newlyRevealedChoices: [],
    anxiety: activeCase.startingAnxiety,
    pain: activeCase.startingPain,
    result: null,
    transcript: [
      {
        id: createId(),
        role: "system",
        text: `New patient assigned: ${patient.name}, ${patient.age}, ${patient.identity}.`,
      },
      {
        id: createId(),
        role: "patient",
        text: patient.complaint,
      },
    ],
  };
}
