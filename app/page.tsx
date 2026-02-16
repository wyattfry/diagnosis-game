"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Gauge,
  MessageCircle,
  Search,
  Settings2,
  Thermometer,
} from "lucide-react";
import {
  createInitialState,
  applyDoctorChoice,
  applyPatientReply,
  planPatientReply,
  diagnose,
  getAvailableChoices,
  getResearchDiseases,
  diseases,
  symptomLabels,
} from "../src/lib/gameEngine";
import type {
  GameState,
  ResearchDifficulty,
  TypingPhase,
  Units,
} from "../src/lib/types";

const UNIT_COOKIE = "diagnosis_units";
const DIFFICULTY_COOKIE = "diagnosis_research_difficulty";

function toImperialHeight(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}ft ${inches}in`;
}

function toImperialWeight(kg: number) {
  return `${Math.round(kg * 2.20462)}lb`;
}

function toFahrenheit(celsius: number) {
  return `${((celsius * 9) / 5 + 32).toFixed(1)}F`;
}

function formatHeight(units: Units, cm: number) {
  return units === "metric" ? `${cm}cm` : toImperialHeight(cm);
}

function formatWeight(units: Units, kg: number) {
  return units === "metric" ? `${kg}kg` : toImperialWeight(kg);
}

function formatTemperature(units: Units, celsius: number) {
  return units === "metric" ? `${celsius.toFixed(1)}C` : toFahrenheit(celsius);
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function guessUnitsFromLocale(): Units {
  if (typeof navigator === "undefined") return "metric";
  const regionsUsingImperial = new Set(["US", "LR", "MM"]);
  const localeCandidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);

  for (const locale of localeCandidates) {
    const match = locale.match(/-([A-Z]{2})$/i);
    if (!match) continue;
    const region = match[1].toUpperCase();
    if (regionsUsingImperial.has(region)) return "imperial";
  }
  return "metric";
}

function firstSentence(text: string) {
  const match = text.match(/[^.!?]*[.!?]/);
  return match ? match[0].trim() : text;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlighted(text: string, query: string, keyPrefix: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, "ig");
  return text.split(regex).map((part, index) => {
    if (!part) return null;
    const isMatch = part.toLowerCase() === trimmed.toLowerCase();
    if (isMatch) return <mark key={`${keyPrefix}-${index}`}>{part}</mark>;
    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [units, setUnits] = useState<Units>("metric");
  const [searchTerm, setSearchTerm] = useState("");
  const [typingPhase, setTypingPhase] = useState<TypingPhase>("idle");
  const [pendingDiagnosisId, setPendingDiagnosisId] = useState<string | null>(null);
  const [showSummaryBar, setShowSummaryBar] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [researchDifficulty, setResearchDifficulty] = useState<ResearchDifficulty>("easy");
  const [paneCycle, setPaneCycle] = useState(0);

  const preTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  const choices = useMemo(() => (gameState ? getAvailableChoices(gameState) : []), [gameState]);
  const allResearchDiseases = useMemo(
    () => getResearchDiseases("", { difficulty: researchDifficulty }),
    [researchDifficulty]
  );
  const filteredResearchDiseases = useMemo(
    () => getResearchDiseases(searchTerm, { difficulty: researchDifficulty }),
    [searchTerm, researchDifficulty]
  );
  const visibleDiseaseIds = useMemo(
    () => new Set(filteredResearchDiseases.map((disease) => disease.id)),
    [filteredResearchDiseases]
  );

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [gameState?.transcript, typingPhase]);

  useEffect(() => {
    return () => {
      clearTimeout(preTypingTimeoutRef.current);
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const savedUnits = getCookieValue(UNIT_COOKIE);
    const initialUnits = savedUnits === "metric" || savedUnits === "imperial" ? savedUnits : guessUnitsFromLocale();
    setUnits(initialUnits);

    const savedDifficulty = getCookieValue(DIFFICULTY_COOKIE);
    const initialDifficulty =
      savedDifficulty === "easy" || savedDifficulty === "medium" || savedDifficulty === "difficult"
        ? savedDifficulty
        : ("easy" as ResearchDifficulty);
    setResearchDifficulty(initialDifficulty);
    setGameState(createInitialState({ difficulty: initialDifficulty }));
  }, []);

  useEffect(() => {
    setCookie(UNIT_COOKIE, units, 60 * 60 * 24 * 365);
  }, [units]);

  useEffect(() => {
    setCookie(DIFFICULTY_COOKIE, researchDifficulty, 60 * 60 * 24 * 365);
  }, [researchDifficulty]);

  useEffect(() => {
    function onScroll() {
      setShowSummaryBar(window.scrollY > 220);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (gameState?.result) {
      setPendingDiagnosisId(null);
    }
  }, [gameState?.result]);

  function clearReplyTimers() {
    clearTimeout(preTypingTimeoutRef.current);
    clearTimeout(typingTimeoutRef.current);
    preTypingTimeoutRef.current = undefined;
    typingTimeoutRef.current = undefined;
  }

  function getTypingDurationMs(text: string) {
    const minimum = 900;
    const byLength = text.length * 34;
    return Math.min(5600, minimum + byLength);
  }

  function handleChoice(choiceId: string) {
    if (!gameState || typingPhase !== "idle" || gameState.result) return;

    const planned = planPatientReply(gameState, choiceId);
    setGameState((prev) => (prev ? applyDoctorChoice(prev, choiceId) : prev));
    setTypingPhase("thinking");

    const preTypingDelay = 260 + Math.floor(Math.random() * 900);
    const typingDuration = getTypingDurationMs(planned.responseText);

    preTypingTimeoutRef.current = setTimeout(() => {
      setTypingPhase("typing");
      typingTimeoutRef.current = setTimeout(() => {
        setGameState((prev) => (prev ? applyPatientReply(prev, choiceId, planned.responseText) : prev));
        setTypingPhase("idle");
      }, typingDuration);
    }, preTypingDelay);
  }

  function handleRequestDiagnosis(diseaseId: string) {
    if (!gameState || typingPhase !== "idle" || gameState.result) return;
    setPendingDiagnosisId(diseaseId);
  }

  function handleConfirmDiagnosis() {
    if (!gameState || !pendingDiagnosisId || gameState.result) return;
    setGameState((prev) => (prev ? diagnose(prev, pendingDiagnosisId) : prev));
    setPendingDiagnosisId(null);
  }

  function handleNextPatient() {
    clearReplyTimers();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setGameState(createInitialState({ difficulty: researchDifficulty }));
    setSearchTerm("");
    setTypingPhase("idle");
    setPendingDiagnosisId(null);
    setPaneCycle((value) => value + 1);
  }

  if (!gameState) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <h1>Medical Diagnosis Game</h1>
            <p>Loading patient case...</p>
          </div>
        </header>
      </main>
    );
  }

  const patient = gameState.patient;
  const discoveredSymptoms = gameState.discoveredSymptoms.map((id) => symptomLabels[id] ?? id);
  const patientAvatarUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(
    `${patient.name}-${patient.identity}`
  )}`;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Medical Diagnosis Game</h1>
          <p>Interview via chat, research diseases, then submit your diagnosis.</p>
        </div>
        <button className="settings-trigger" onClick={() => setShowSettingsModal(true)}>
          <Settings2 size={16} />
          <span>Settings</span>
        </button>
      </header>

      <section
        key={`stats-${paneCycle}`}
        className="stats-panel case-pane"
        style={{ "--pane-delay": "0ms" } as CSSProperties}
      >
        <span className="patient-chip">
          <img className="patient-avatar" src={patientAvatarUrl} alt={`${patient.name} avatar`} />
          <span className="chip">
            <strong>{patient.name}</strong>, {patient.age} ({patient.identity})
          </span>
        </span>
        <span className="chip">{formatHeight(units, patient.heightCm)} / {formatWeight(units, patient.weightKg)}</span>
        <span className="chip">Complaint: {patient.complaint}</span>
        <span className="chip">BP {patient.bp}</span>
        <span className="chip">BPM {patient.bpm}</span>
        <span className="chip">Temp {formatTemperature(units, patient.temperatureC)}</span>
        <div className="bar-grid">
          <div>
            <div className="bar-label">Anxiety: {gameState.anxiety}/100</div>
            <div className="bar track-blue">
              <span style={{ width: `${gameState.anxiety}%` }} />
            </div>
          </div>
          <div>
            <div className="bar-label">Pain: {gameState.pain}/100</div>
            <div className="bar track-red">
              <span style={{ width: `${gameState.pain}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="main-grid">
        <article
          key={`interview-${paneCycle}`}
          className="panel interview-panel case-pane"
          style={{ "--pane-delay": "90ms" } as CSSProperties}
        >
          <h2 className="title-with-icon">
            <MessageCircle size={18} />
            <span>Interview (SMS)</span>
          </h2>
          <div className="transcript" ref={transcriptContainerRef}>
            {gameState.transcript.map((message) => (
              <div key={message.id} className={`bubble-row ${message.role}`}>
                <div className="bubble">{message.text}</div>
              </div>
            ))}
            {typingPhase === "typing" && (
              <div className="bubble-row patient">
                <div className="bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
          <div className="choice-list">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={typingPhase !== "idle" || !!gameState.result}
              >
                {choice.text}
              </button>
            ))}
          </div>
        </article>

        <article
          key={`symptoms-${paneCycle}`}
          className="panel case-pane"
          style={{ "--pane-delay": "180ms" } as CSSProperties}
        >
          <h2 className="title-with-icon">
            <Activity size={18} />
            <span>Discovered Symptoms</span>
          </h2>
          <ul className="list">
            {discoveredSymptoms.length === 0 ? (
              <li>No symptoms discovered yet.</li>
            ) : (
              discoveredSymptoms.map((symptom) => <li key={symptom}>{symptom}</li>)
            )}
          </ul>
        </article>
      </section>

      <section className="research-section">
        <article
          key={`research-${paneCycle}`}
          className="panel case-pane"
          style={{ "--pane-delay": "270ms" } as CSSProperties}
        >
          <h2 className="title-with-icon">
            <Search size={18} />
            <span>Research</span>
          </h2>
          <label htmlFor="search">Search diseases</label>
          <input
            id="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Try cough, fever, nausea"
          />
          <p className="muted search-status">
            {filteredResearchDiseases.length === 0
              ? "No diseases match this search."
              : `${filteredResearchDiseases.length} disease${filteredResearchDiseases.length === 1 ? "" : "s"} shown.`}
          </p>
          <div className="disease-results">
            {allResearchDiseases.map((disease) => {
              const hidden = !visibleDiseaseIds.has(disease.id);
              return (
                <article key={disease.id} className={`disease-card ${hidden ? "filtered-out" : ""}`}>
                  <div className="disease-card-content">
                    <h3>{renderHighlighted(disease.name, searchTerm, `${disease.id}-name`)}</h3>
                    <p>
                      <strong>Definition:</strong>{" "}
                      {renderHighlighted(firstSentence(disease.definition), searchTerm, `${disease.id}-def`)}
                    </p>
                    {(researchDifficulty === "medium" || researchDifficulty === "easy") && (
                      <p>{renderHighlighted(disease.description, searchTerm, `${disease.id}-desc`)}</p>
                    )}
                    {researchDifficulty === "easy" && (
                      <p>
                        <strong>Common symptoms:</strong>{" "}
                        {disease.symptomIds.map((id, index) => {
                          const label = symptomLabels[id] ?? id;
                          return (
                            <span key={`${disease.id}-sym-${id}`}>
                              {renderHighlighted(label, searchTerm, `${disease.id}-sym-${index}`)}
                              {index < disease.symptomIds.length - 1 ? ", " : ""}
                            </span>
                          );
                        })}
                      </p>
                    )}
                  </div>
                  <div className="disease-card-footer">
                    <button
                      className="diagnose-button"
                      type="button"
                      onClick={() => handleRequestDiagnosis(disease.id)}
                      disabled={typingPhase !== "idle" || !!gameState.result || hidden}
                    >
                      Diagnose
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <h2 id="settings-title">Settings</h2>
            <label htmlFor="units">Units</label>
            <select id="units" value={units} onChange={(event) => setUnits(event.target.value as Units)}>
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>

            <label htmlFor="difficulty">Research Difficulty</label>
            <select
              id="difficulty"
              value={researchDifficulty}
              onChange={(event) => setResearchDifficulty(event.target.value as ResearchDifficulty)}
            >
              <option value="easy">Easy (definition + paragraph + symptoms)</option>
              <option value="medium">Medium (definition + paragraph)</option>
              <option value="difficult">Difficult (name + first definition sentence)</option>
            </select>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowSettingsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDiagnosisId && !gameState.result && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h2 id="confirm-title">Confirm Diagnosis</h2>
            <p className="muted">
              Submit diagnosis as{" "}
              <strong>{diseases.find((disease) => disease.id === pendingDiagnosisId)?.name ?? "Unknown"}</strong>?
            </p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setPendingDiagnosisId(null)}>
                Cancel
              </button>
              <button onClick={handleConfirmDiagnosis}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {gameState.result && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <h2 id="result-title">Case Result</h2>
            <p className={gameState.result.win ? "ok" : "bad"}>{gameState.result.message}</p>
            <button onClick={handleNextPatient}>Next Patient</button>
          </div>
        </div>
      )}

      <div className={`floating-summary top ${showSummaryBar ? "visible" : ""}`}>
        <div className="floating-summary-inner">
          <div className="floating-item">
            <div className="bar-label compact-label">
              <Gauge size={14} />
              <span>Anxiety: {gameState.anxiety}/100</span>
            </div>
            <div className="bar track-blue">
              <span style={{ width: `${gameState.anxiety}%` }} />
            </div>
          </div>
          <div className="floating-item">
            <div className="bar-label compact-label">
              <Thermometer size={14} />
              <span>Pain: {gameState.pain}/100</span>
            </div>
            <div className="bar track-red">
              <span style={{ width: `${gameState.pain}%` }} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
