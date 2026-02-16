import { diseases } from "../gameData";
import type { GameState } from "../types";
import { checkTerminalState } from "./terminal";

export function diagnose(state: GameState, diseaseId: string): GameState {
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
