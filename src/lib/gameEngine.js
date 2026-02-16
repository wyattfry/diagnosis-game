import {
  diseases,
  starterCases,
  symptomLabels,
  patientNamePool,
  identityPool,
  redHerringChoices,
  ambiguousReplies,
  complaintPools,
} from "./gameData";

const MAX_STAT = 100;
const MAX_TEMP = 41.5;
const MIN_TEMP = 35.0;

function createId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(items) {
  return items[randomInt(0, items.length - 1)];
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min = 0, max = MAX_STAT) {
  return Math.max(min, Math.min(max, value));
}

function clampFloat(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sampleDemographics() {
  return {
    age: randomInt(14, 84),
    sexAssignedAtBirth: Math.random() < 0.5 ? "F" : "M",
  };
}

const diseaseById = new Map(diseases.map((disease) => [disease.id, disease]));

function gaussianAgeWeight(age, peak, spread) {
  const z = (age - peak) / spread;
  return Math.exp(-0.5 * z * z);
}

function caseWeight(activeCase, demographics) {
  const disease = diseaseById.get(activeCase.diagnosisId);
  const profile = disease?.profile?.demographics;
  if (!profile) return 1;
  const ageWeight = gaussianAgeWeight(demographics.age, profile.agePeak, profile.ageSpread);
  const sexWeight = profile.sexBias?.[demographics.sexAssignedAtBirth] ?? 1;
  return Math.max(0.03, ageWeight * sexWeight);
}

function chooseCase(demographics) {
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

function buildVitals(basePatient, diagnosisId, demographics) {
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

function buildPatientProfile(basePatient, activeCase, demographics) {
  const name = `${randomFrom(patientNamePool.first)} ${randomFrom(patientNamePool.last)}`;
  const identity = randomFrom(identityPool);
  const vitals = buildVitals(basePatient, activeCase.diagnosisId, demographics);
  const complaintOptions = (activeCase.complaintCategories ?? [])
    .flatMap((category) => complaintPools[category] ?? [])
    .filter(Boolean);
  const complaint =
    complaintOptions.length > 0
      ? randomFrom(complaintOptions)
      : basePatient.complaint ?? "I am not feeling well.";
  return {
    ...basePatient,
    ...vitals,
    age: demographics.age,
    name,
    identity,
    complaint,
  };
}

function sampleWithoutReplacement(items, count) {
  const pool = [...items];
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const idx = randomInt(0, pool.length - 1);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  return shuffled;
}

function uniqueStrings(items) {
  return [...new Set(items)];
}

function isLikelyYesNoQuestion(text) {
  if (!text) return false;
  const prompt = text.trim().toLowerCase();
  return /^(are|is|do|does|did|have|has|had|can|could|would|will|was|were)\b/.test(prompt);
}

const genericYesNoReplies = [
  "I think so.",
  "I can't remember.",
  "It's possible.",
  "Maybe, I guess.",
  "Kind of.",
  "Probably.",
  "Not really.",
  "I don't think so.",
  "More yes than no.",
  "Hard to say.",
];

const genericOpenReplies = [
  "Maybe, I guess.",
  "Kind of, sometimes.",
  "It's possible.",
  "I think so.",
  "I can't remember.",
  "Hard to pin down, honestly.",
  "Could go either way.",
];

function buildBorrowedQuestions(baseCase, count) {
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

function getWrongQuestionRange(difficulty) {
  if (difficulty === "difficult") return { min: 5, max: 6 };
  if (difficulty === "medium") return { min: 4, max: 5 };
  return { min: 1, max: 2 };
}

function buildActiveCase(baseCase, difficulty = "easy") {
  const range = getWrongQuestionRange(difficulty);
  const wrongQuestionCount = randomInt(range.min, range.max);
  const redHerringCount = Math.min(
    redHerringChoices.length,
    Math.max(1, Math.round(wrongQuestionCount * 0.4))
  );
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

function checkTerminalState(anxiety, pain) {
  if (anxiety >= MAX_STAT) {
    return { win: false, message: "Patient anxiety maxed out and they left the clinic." };
  }
  if (pain >= MAX_STAT) {
    return { win: false, message: "Patient pain reached critical level and they passed out." };
  }
  return null;
}

export function createInitialState(options = {}) {
  const difficulty = options.difficulty ?? "easy";
  const demographics = sampleDemographics();
  const activeCase = buildActiveCase(chooseCase(demographics), difficulty);
  const patient = buildPatientProfile(activeCase.patient, activeCase, demographics);

  return {
    activeCase,
    patient,
    discoveredSymptoms: [],
    questionCounts: {},
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

export function getAvailableChoices(state) {
  const discoveredSet = new Set(state.discoveredSymptoms);
  return state.activeCase.interviewChoices.filter((choice) => {
    const requiresAny = choice.requiresAny ?? [];
    const requiresAll = choice.requiresAll ?? [];
    const anyPass = requiresAny.length === 0 || requiresAny.some((symptom) => discoveredSet.has(symptom));
    const allPass = requiresAll.length === 0 || requiresAll.every((symptom) => discoveredSet.has(symptom));
    return anyPass && allPass;
  });
}

function pickPatientResponse(choice, repeatCount) {
  const yesNoPrompt = isLikelyYesNoQuestion(choice.text);
  const genericChance = repeatCount > 0 ? 0.5 : yesNoPrompt ? 0.35 : 0.2;
  if (Math.random() < genericChance) {
    return yesNoPrompt ? randomFrom(genericYesNoReplies) : randomFrom(genericOpenReplies);
  }

  if (repeatCount > 0 && Array.isArray(choice.repeatResponses) && choice.repeatResponses.length > 0) {
    return randomFrom(choice.repeatResponses);
  }
  if (Array.isArray(choice.responses) && choice.responses.length > 0) {
    return randomFrom(choice.responses);
  }
  return choice.note ?? "Okay.";
}

export function planPatientReply(state, choiceId) {
  const choice = state.activeCase.interviewChoices.find((entry) => entry.id === choiceId);
  if (!choice) return { responseText: "Okay." };
  const repeatCount = state.questionCounts[choice.id] ?? 0;
  return { responseText: pickPatientResponse(choice, repeatCount) };
}

export function applyDoctorChoice(state, choiceId) {
  if (state.result) return state;

  const choice = state.activeCase.interviewChoices.find((entry) => entry.id === choiceId);
  if (!choice) return state;

  return {
    ...state,
    transcript: [
      ...state.transcript,
      {
        id: createId(),
        role: "doctor",
        text: choice.text,
      },
    ],
  };
}

export function applyPatientReply(state, choiceId, responseText) {
  if (state.result) return state;

  const choice = state.activeCase.interviewChoices.find((entry) => entry.id === choiceId);
  if (!choice) return state;

  const repeatCount = state.questionCounts[choice.id] ?? 0;
  const repeatPenalty = repeatCount > 0 ? Math.min(10, repeatCount * 2) : 0;
  const resolvedText = responseText ?? pickPatientResponse(choice, repeatCount);
  const symptoms = Array.from(new Set([...state.discoveredSymptoms, ...choice.reveal]));
  const anxiety = clamp(state.anxiety + choice.anxietyDelta + repeatPenalty);
  const pain = clamp(state.pain + choice.painDelta + randomInt(-1, 2));
  const terminal = checkTerminalState(anxiety, pain);

  return {
    ...state,
    discoveredSymptoms: symptoms,
    questionCounts: {
      ...state.questionCounts,
      [choice.id]: repeatCount + 1,
    },
    anxiety,
    pain,
    result: terminal,
    transcript: [
      ...state.transcript,
      {
        id: createId(),
        role: "patient",
        text: resolvedText,
      },
    ],
  };
}

export function diagnose(state, diseaseId) {
  if (!diseaseId || state.result) return state;

  const terminal = checkTerminalState(state.anxiety, state.pain);
  if (terminal) {
    return { ...state, result: terminal };
  }

  const selected = diseases.find((disease) => disease.id === diseaseId);
  const actual = diseases.find((disease) => disease.id === state.activeCase.diagnosisId);

  const result =
    diseaseId === state.activeCase.diagnosisId
      ? {
          win: true,
          message: selected?.treatment
            ? `Correct diagnosis: ${selected?.name ?? "Unknown"}. Planned treatment: ${selected.treatment}`
            : `Correct diagnosis: ${selected?.name ?? "Unknown"}. The patient can begin treatment.`,
        }
      : {
          win: false,
          message: `Incorrect diagnosis: ${selected?.name ?? "Unknown"}. Actual illness was ${actual?.name ?? "Unknown"}.`,
        };

  return { ...state, result };
}

function firstSentence(text) {
  const match = text.match(/[^.!?]*[.!?]/);
  return match ? match[0].trim() : text;
}

export function getResearchDiseases(searchTerm, options = {}) {
  const difficulty = options.difficulty ?? "easy";
  const query = searchTerm.trim().toLowerCase();
  const filtered = diseases.filter((disease) => {
    if (!query) return true;

    const searchableFields = [
      disease.name.toLowerCase(),
      firstSentence(disease.definition).toLowerCase(),
    ];

    if (difficulty === "medium" || difficulty === "easy") {
      searchableFields.push(disease.description.toLowerCase());
    }
    if (difficulty === "easy") {
      searchableFields.push(...disease.symptomIds.map((id) => (symptomLabels[id] ?? id).toLowerCase()));
    }

    return searchableFields.some((field) => field.includes(query));
  });

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export { diseases, symptomLabels };
