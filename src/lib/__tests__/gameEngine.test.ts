import { describe, expect, it } from "vitest";
import {
  applyDoctorChoice,
  applyPatientReply,
  createInitialState,
  diagnose,
  getResearchDiseases,
} from "../gameEngine";

function countWrongChoices(choiceIds: string[]) {
  return choiceIds.filter((id) => id.startsWith("red-herring-") || id.startsWith("borrowed-")).length;
}

describe("createInitialState difficulty wrong-question counts", () => {
  it("easy has 1-2 wrong questions", () => {
    const state = createInitialState({ difficulty: "easy" });
    const wrong = countWrongChoices(state.activeCase.interviewChoices.map((choice) => choice.id));
    expect(wrong).toBeGreaterThanOrEqual(1);
    expect(wrong).toBeLessThanOrEqual(2);
  });

  it("medium has 4-5 wrong questions", () => {
    const state = createInitialState({ difficulty: "medium" });
    const wrong = countWrongChoices(state.activeCase.interviewChoices.map((choice) => choice.id));
    expect(wrong).toBeGreaterThanOrEqual(4);
    expect(wrong).toBeLessThanOrEqual(5);
  });

  it("difficult has 5-6 wrong questions", () => {
    const state = createInitialState({ difficulty: "difficult" });
    const wrong = countWrongChoices(state.activeCase.interviewChoices.map((choice) => choice.id));
    expect(wrong).toBeGreaterThanOrEqual(5);
    expect(wrong).toBeLessThanOrEqual(6);
  });
});

describe("research search scope", () => {
  it("easy includes symptom text in search while medium does not", () => {
    const term = "released";
    const easy = getResearchDiseases(term, { difficulty: "easy" });
    const medium = getResearchDiseases(term, { difficulty: "medium" });

    expect(easy.some((disease) => disease.id === "appendicitis")).toBe(true);
    expect(medium.some((disease) => disease.id === "appendicitis")).toBe(false);
  });
});

describe("diagnosis and interview state transitions", () => {
  it("applying doctor + patient reply appends transcript and increments question count", () => {
    const state = createInitialState({ difficulty: "easy" });
    const choice = state.activeCase.interviewChoices[0];

    const afterDoctor = applyDoctorChoice(state, choice.id);
    expect(afterDoctor.transcript.length).toBe(state.transcript.length + 1);

    const afterReply = applyPatientReply(afterDoctor, choice.id, "Test response");
    expect(afterReply.transcript.length).toBe(afterDoctor.transcript.length + 1);
    expect(afterReply.questionCounts[choice.id]).toBe(1);
  });

  it("correct diagnosis returns win and mentions treatment when available", () => {
    const state = createInitialState({ difficulty: "easy" });
    const resolved = diagnose(state, state.activeCase.diagnosisId);

    expect(resolved.result?.win).toBe(true);
    expect(resolved.result?.message.toLowerCase()).toContain("treatment");
  });
});
