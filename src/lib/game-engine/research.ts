import { diseases, symptomLabels } from "../gameData";
import type { ResearchDifficulty } from "../types";

function firstSentence(text: string) {
  const match = text.match(/[^.!?]*[.!?]/);
  return match ? match[0].trim() : text;
}

export function getResearchDiseases(
  searchTerm: string,
  options: { difficulty?: ResearchDifficulty } = {}
) {
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
