import type { GameState, InterviewChoice } from "../types";
import { checkTerminalState } from "./terminal";
import { clamp, createId, randomFrom, randomInt } from "./utils";

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

function isLikelyYesNoQuestion(text: string) {
  if (!text) return false;
  const prompt = text.trim().toLowerCase();
  return /^(are|is|do|does|did|have|has|had|can|could|would|will|was|were)\b/.test(prompt);
}

function pickPatientResponse(choice: InterviewChoice, repeatCount: number) {
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

function isChoiceAvailable(choice: InterviewChoice, discoveredSet: Set<string>): boolean {
  const requiresAny = choice.requiresAny ?? [];
  const requiresAll = choice.requiresAll ?? [];
  const anyPass = requiresAny.length === 0 || requiresAny.some((symptom) => discoveredSet.has(symptom));
  const allPass = requiresAll.length === 0 || requiresAll.every((symptom) => discoveredSet.has(symptom));
  return anyPass && allPass;
}

export function getAvailableChoices(state: GameState): InterviewChoice[] {
  const discoveredSet = new Set(state.discoveredSymptoms);
  const originalChoices = state.activeCase.interviewChoices.filter((choice) =>
    isChoiceAvailable(choice, discoveredSet)
  );
  
  // Include newly revealed choices
  return [...originalChoices, ...state.newlyRevealedChoices];
}

function generateNewChoice(state: GameState): InterviewChoice | null {
  const discoveredSet = new Set(state.discoveredSymptoms);
  
  // Find original choices that aren't yet available but could become available
  const unrevealed = state.activeCase.interviewChoices.filter((choice) => {
    const isCurrentlyAvailable = isChoiceAvailable(choice, discoveredSet);
    const isAlreadyRevealed = state.newlyRevealedChoices.some((revealed) => revealed.id === choice.id);
    return !isCurrentlyAvailable && !isAlreadyRevealed;
  });

  if (unrevealed.length === 0) return null;
  
  // Randomly pick one to reveal
  return unrevealed[randomInt(0, unrevealed.length - 1)];
}

export function planPatientReply(state: GameState, choiceId: string): { responseText: string } {
  const choice =
    state.activeCase.interviewChoices.find((entry) => entry.id === choiceId) ||
    state.newlyRevealedChoices.find((entry) => entry.id === choiceId);
  if (!choice) return { responseText: "Okay." };
  const repeatCount = state.questionCounts[choice.id] ?? 0;
  return { responseText: pickPatientResponse(choice, repeatCount) };
}

export function applyDoctorChoice(state: GameState, choiceId: string): GameState {
  if (state.result) return state;

  const choice =
    state.activeCase.interviewChoices.find((entry) => entry.id === choiceId) ||
    state.newlyRevealedChoices.find((entry) => entry.id === choiceId);
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

export function applyPatientReply(state: GameState, choiceId: string, responseText?: string): GameState {
  if (state.result) return state;

  const choice =
    state.activeCase.interviewChoices.find((entry) => entry.id === choiceId) ||
    state.newlyRevealedChoices.find((entry) => entry.id === choiceId);
  if (!choice) return state;

  const repeatCount = state.questionCounts[choice.id] ?? 0;
  const repeatPenalty = repeatCount > 0 ? Math.min(10, repeatCount * 2) : 0;
  const resolvedText = responseText ?? pickPatientResponse(choice, repeatCount);
  const symptoms = Array.from(new Set([...state.discoveredSymptoms, ...choice.reveal]));
  const anxiety = clamp(state.anxiety + choice.anxietyDelta + repeatPenalty);
  const pain = clamp(state.pain + choice.painDelta + randomInt(-1, 2));
  const terminal = checkTerminalState(anxiety, pain);

  const newTranscript = [
    ...state.transcript,
    {
      id: createId(),
      role: "patient" as const,
      text: resolvedText,
    },
  ];

  // Create a new state with updated symptoms first
  const stateWithSymptoms: GameState = {
    ...state,
    discoveredSymptoms: symptoms,
    questionCounts: {
      ...state.questionCounts,
      [choice.id]: repeatCount + 1,
    },
    anxiety,
    pain,
    result: terminal,
    transcript: newTranscript,
  };

  // Generate and reveal a new choice if available
  const newChoice = generateNewChoice(stateWithSymptoms);
  if (newChoice) {
    return {
      ...stateWithSymptoms,
      newlyRevealedChoices: [...stateWithSymptoms.newlyRevealedChoices, newChoice],
    };
  }

  return stateWithSymptoms;
}
