import { createInitialState } from "./game-engine/caseFactory";
import { applyDoctorChoice, applyPatientReply, getAvailableChoices, planPatientReply } from "./game-engine/interview";
import { diagnose } from "./game-engine/diagnosis";
import { getResearchDiseases } from "./game-engine/research";
import { diseases, symptomLabels } from "./gameData";

export {
  createInitialState,
  applyDoctorChoice,
  applyPatientReply,
  planPatientReply,
  diagnose,
  getAvailableChoices,
  getResearchDiseases,
  diseases,
  symptomLabels,
};
