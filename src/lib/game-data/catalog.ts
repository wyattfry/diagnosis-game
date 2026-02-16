import type { Disease } from "../types";

export const diseases: Disease[] = [
  {
    id: "common-cold",
    name: "Common Cold",
    tier: 1,
    definition: "A mild viral infection of the upper respiratory tract.",
    description:
      "Usually self-limited over several days. Symptoms are often focused on the nose and throat with mild fatigue.",
    treatment:
      "Supportive care: hydration, rest, throat soothing measures, and over-the-counter symptom relief as appropriate.",
    symptomIds: ["runny_nose", "sore_throat", "cough", "sneezing", "mild_fever", "fatigue"],
    tags: ["cough", "sore throat", "runny nose", "fatigue", "sneezing"],
    profile: {
      demographics: { agePeak: 28, ageSpread: 22, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [37.0, 38.2], bpm: [80, 102], sys: [104, 126], dia: [66, 82] },
    },
  },
  {
    id: "influenza",
    name: "Influenza",
    tier: 1,
    definition: "An acute viral respiratory illness with systemic symptoms.",
    description:
      "Often starts abruptly and can cause high fever, myalgia, chills, and significant fatigue compared with a typical cold.",
    treatment:
      "Supportive care and, when clinically appropriate and early, antiviral therapy such as oseltamivir.",
    symptomIds: ["high_fever", "chills", "body_aches", "fatigue", "headache", "cough"],
    tags: ["fever", "body aches", "chills", "fatigue"],
    profile: {
      demographics: { agePeak: 34, ageSpread: 24, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [38.3, 40.1], bpm: [92, 118], sys: [102, 132], dia: [64, 86] },
    },
  },
  {
    id: "norovirus",
    name: "Norovirus",
    tier: 1,
    definition: "A highly contagious viral gastroenteritis.",
    description:
      "Typically causes sudden onset nausea, vomiting, and diarrhea, sometimes with low-grade fever and abdominal cramps.",
    treatment:
      "Oral rehydration and electrolyte replacement; antiemetics may be considered for symptom control.",
    symptomIds: ["nausea", "vomiting", "diarrhea", "abdominal_cramps", "low_fever"],
    tags: ["nausea", "vomiting", "diarrhea", "stomach pain"],
    profile: {
      demographics: { agePeak: 30, ageSpread: 20, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [37.2, 38.4], bpm: [92, 118], sys: [98, 122], dia: [62, 80] },
    },
  },
  {
    id: "strep-throat",
    name: "Strep Throat",
    tier: 2,
    definition: "A bacterial throat infection caused by group A streptococcus.",
    description:
      "Can cause sudden sore throat, painful swallowing, fever, and swollen neck lymph nodes, often without cough.",
    treatment:
      "Antibiotic therapy after confirmation plus analgesics and hydration for symptom relief.",
    symptomIds: ["sore_throat", "painful_swallowing", "high_fever", "swollen_lymph_nodes", "headache"],
    tags: ["sore throat", "fever", "swallowing pain", "lymph nodes"],
    profile: {
      demographics: { agePeak: 19, ageSpread: 10, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [38.0, 39.6], bpm: [90, 112], sys: [100, 126], dia: [64, 82] },
    },
  },
  {
    id: "migraine",
    name: "Migraine",
    tier: 2,
    definition: "A recurrent neurologic headache disorder, often one-sided and disabling.",
    description:
      "Episodes can include throbbing head pain, nausea, and sensitivity to light or sound, sometimes with visual aura.",
    treatment:
      "Acute migraine therapy (for example NSAIDs or triptans when appropriate), hydration, and trigger management.",
    symptomIds: ["unilateral_headache", "photophobia", "nausea", "aura", "fatigue"],
    tags: ["headache", "light sensitivity", "nausea", "aura"],
    profile: {
      demographics: { agePeak: 32, ageSpread: 13, sexBias: { F: 1.2, M: 0.9 } },
      vitals: { temp: [36.4, 37.4], bpm: [72, 98], sys: [104, 132], dia: [66, 86] },
    },
  },
  {
    id: "food-poisoning",
    name: "Food Poisoning",
    tier: 2,
    definition: "An acute gastrointestinal illness from contaminated food or drink.",
    description:
      "Usually presents with nausea, vomiting, diarrhea, abdominal cramps, and occasionally fever after a suspicious meal.",
    treatment:
      "Hydration-first supportive care; targeted antimicrobial therapy only when specific pathogen or severe risk warrants.",
    symptomIds: ["nausea", "vomiting", "diarrhea", "abdominal_cramps", "low_fever", "fatigue"],
    tags: ["nausea", "vomiting", "diarrhea", "meal exposure"],
    profile: {
      demographics: { agePeak: 34, ageSpread: 20, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [37.0, 38.6], bpm: [88, 112], sys: [100, 126], dia: [62, 82] },
    },
  },
  {
    id: "uti",
    name: "Urinary Tract Infection",
    tier: 2,
    definition: "A bacterial infection affecting part of the urinary system.",
    description:
      "Commonly causes burning urination, urinary frequency, pelvic discomfort, and sometimes low fever.",
    treatment:
      "Appropriate antibiotic therapy guided by presentation and local resistance patterns, plus hydration.",
    symptomIds: ["dysuria", "urinary_frequency", "pelvic_pain", "low_fever", "fatigue"],
    tags: ["burning urination", "urinary frequency", "pelvic pain"],
    profile: {
      demographics: { agePeak: 36, ageSpread: 18, sexBias: { F: 1.35, M: 0.75 } },
      vitals: { temp: [37.0, 38.3], bpm: [82, 106], sys: [102, 132], dia: [64, 86] },
    },
  },
  {
    id: "mononucleosis",
    name: "Mononucleosis",
    tier: 2,
    definition: "A viral illness, often caused by Epstein-Barr virus, that can produce prolonged fatigue.",
    description:
      "Common findings include severe fatigue, sore throat, fever, swollen lymph nodes, and sometimes enlarged spleen.",
    treatment:
      "Supportive care with rest, hydration, and analgesics; avoid contact sports if splenic enlargement is suspected.",
    symptomIds: ["fatigue", "sore_throat", "high_fever", "swollen_lymph_nodes", "headache"],
    tags: ["mono", "fatigue", "sore throat", "lymph nodes", "fever"],
    profile: {
      demographics: { agePeak: 21, ageSpread: 9, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [37.8, 39.0], bpm: [86, 108], sys: [100, 126], dia: [64, 84] },
    },
  },
  {
    id: "meningitis",
    name: "Meningitis",
    tier: 3,
    definition: "Inflammation of the protective membranes around the brain and spinal cord.",
    description:
      "Can present with severe headache, fever, neck stiffness, light sensitivity, confusion, and urgent neurologic risk.",
    treatment:
      "Emergency evaluation with urgent empiric therapy and supportive care based on suspected etiology.",
    symptomIds: ["high_fever", "headache", "neck_stiffness", "photophobia", "confusion"],
    tags: ["headache", "neck stiffness", "fever", "confusion", "light sensitivity"],
    profile: {
      demographics: { agePeak: 29, ageSpread: 16, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [38.5, 40.2], bpm: [96, 124], sys: [104, 144], dia: [66, 92] },
    },
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    tier: 3,
    definition: "Acute inflammation of the appendix, often requiring urgent surgery.",
    description:
      "Pain commonly starts near the navel and shifts to the right lower abdomen, often with nausea, appetite loss, and fever.",
    treatment:
      "Urgent surgical evaluation, often appendectomy, with perioperative antibiotics when indicated.",
    symptomIds: ["right_lower_quadrant_pain", "abdominal_cramps", "nausea", "low_fever", "rebound_tenderness"],
    tags: ["abdominal pain", "right lower quadrant", "nausea", "appendix"],
    profile: {
      demographics: { agePeak: 24, ageSpread: 12, sexBias: { F: 0.95, M: 1.05 } },
      vitals: { temp: [37.7, 39.0], bpm: [96, 124], sys: [106, 136], dia: [66, 88] },
    },
  },
  {
    id: "myocardial-infarction",
    name: "Heart Attack (Myocardial Infarction)",
    tier: 3,
    definition: "Damage to heart muscle due to reduced blood flow in coronary arteries.",
    description:
      "Typical symptoms include chest pressure, shortness of breath, sweating, and pain spreading to arm, jaw, or back.",
    treatment:
      "Emergency reperfusion pathway plus antiplatelet/antithrombotic and cardiology-directed acute management.",
    symptomIds: ["chest_pressure", "dyspnea", "diaphoresis", "arm_jaw_pain", "nausea"],
    tags: ["chest pain", "heart attack", "jaw pain", "shortness of breath"],
    profile: {
      demographics: { agePeak: 63, ageSpread: 10, sexBias: { F: 0.85, M: 1.2 } },
      vitals: { temp: [36.3, 37.4], bpm: [92, 126], sys: [124, 176], dia: [74, 104] },
    },
  },
  {
    id: "stroke",
    name: "Stroke",
    tier: 3,
    definition: "Sudden interruption of blood flow to part of the brain causing neurologic deficits.",
    description:
      "Symptoms may include facial droop, one-sided weakness, speech difficulty, confusion, and abrupt onset.",
    treatment:
      "Immediate stroke protocol with urgent imaging and time-sensitive reperfusion eligibility assessment.",
    symptomIds: ["facial_droop", "unilateral_weakness", "slurred_speech", "confusion", "headache"],
    tags: ["FAST", "weakness", "speech trouble", "facial droop", "stroke"],
    profile: {
      demographics: { agePeak: 67, ageSpread: 11, sexBias: { F: 0.9, M: 1.1 } },
      vitals: { temp: [36.2, 37.5], bpm: [84, 116], sys: [136, 192], dia: [80, 110] },
    },
  },
  {
    id: "celiac-disease",
    name: "Celiac Disease",
    tier: 2,
    definition: "An immune-mediated disorder triggered by gluten that damages the small intestine.",
    description:
      "Can involve bloating, chronic diarrhea, abdominal discomfort, weight loss, and nutrient deficiency symptoms.",
    treatment:
      "Strict lifelong gluten-free diet with nutritional monitoring and correction of deficiencies.",
    symptomIds: ["bloating", "persistent_diarrhea", "abdominal_cramps", "weight_loss", "fatigue"],
    tags: ["gluten", "bloating", "diarrhea", "weight loss", "celiac"],
    profile: {
      demographics: { agePeak: 33, ageSpread: 16, sexBias: { F: 1.2, M: 0.9 } },
      vitals: { temp: [36.3, 37.4], bpm: [74, 98], sys: [102, 130], dia: [64, 86] },
    },
  },
  {
    id: "crohns-disease",
    name: "Crohn's Disease",
    tier: 2,
    definition: "A chronic inflammatory bowel disease affecting the gastrointestinal tract.",
    description:
      "Frequently causes abdominal pain, persistent diarrhea, fatigue, weight loss, and may include blood in stool.",
    treatment:
      "Anti-inflammatory and immunomodulating therapy tailored to severity, with nutrition and flare management.",
    symptomIds: ["abdominal_cramps", "persistent_diarrhea", "fatigue", "weight_loss", "blood_in_stool"],
    tags: ["ibd", "crohn", "abdominal pain", "diarrhea", "blood in stool"],
    profile: {
      demographics: { agePeak: 30, ageSpread: 13, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [36.8, 38.0], bpm: [78, 104], sys: [100, 130], dia: [64, 86] },
    },
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    tier: 2,
    definition: "An infection that inflames the air sacs in one or both lungs.",
    description:
      "May cause fever, productive cough, chest discomfort with breathing, shortness of breath, and fatigue.",
    treatment:
      "Severity-based antimicrobial therapy when bacterial etiology is likely, plus supportive respiratory care.",
    symptomIds: ["high_fever", "cough_with_phlegm", "pleuritic_chest_pain", "dyspnea", "fatigue"],
    tags: ["lung infection", "productive cough", "fever", "shortness of breath"],
    profile: {
      demographics: { agePeak: 52, ageSpread: 22, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [38.0, 40.0], bpm: [92, 122], sys: [104, 140], dia: [66, 90] },
    },
  },
  {
    id: "pancreatitis",
    name: "Pancreatitis",
    tier: 3,
    definition: "Inflammation of the pancreas that can cause severe upper abdominal pain.",
    description:
      "Commonly presents with intense upper abdominal pain radiating to the back, nausea, vomiting, and elevated heart rate.",
    treatment:
      "Hospital-based supportive management with IV fluids, pain control, bowel rest, and treatment of underlying cause.",
    symptomIds: ["epigastric_pain", "back_radiation_pain", "nausea", "vomiting", "tachycardia"],
    tags: ["upper abdominal pain", "pancreas", "back pain", "nausea", "vomiting"],
    profile: {
      demographics: { agePeak: 48, ageSpread: 16, sexBias: { F: 0.95, M: 1.05 } },
      vitals: { temp: [37.4, 39.1], bpm: [98, 128], sys: [104, 142], dia: [66, 92] },
    },
  },
  {
    id: "overactive-bladder",
    name: "Overactive Bladder",
    tier: 2,
    definition: "A syndrome of urinary urgency, often with frequency and nocturia, without infection.",
    description:
      "Symptoms include sudden urge to urinate, frequent voiding, and waking at night to urinate, sometimes with urge leakage.",
    treatment:
      "Bladder training, fluid/caffeine timing changes, pelvic floor therapy, and medication when indicated.",
    symptomIds: ["urinary_urgency", "urinary_frequency", "nocturia", "urge_incontinence"],
    tags: ["urgency", "frequent urination", "night urination", "bladder"],
    profile: {
      demographics: { agePeak: 56, ageSpread: 18, sexBias: { F: 1.25, M: 0.85 } },
      vitals: { temp: [36.4, 37.5], bpm: [72, 102], sys: [104, 140], dia: [66, 90] },
    },
  },
  {
    id: "heartburn",
    name: "Heartburn (GERD-like reflux)",
    tier: 1,
    definition: "A burning chest sensation from reflux of stomach contents into the esophagus.",
    description:
      "Often worse after meals or when lying down, with sour taste or regurgitation and relief from antacid therapy.",
    treatment:
      "Lifestyle adjustments and acid suppression therapy such as antacids, H2 blockers, or PPIs as appropriate.",
    symptomIds: ["retrosternal_burning", "acid_regurgitation", "postprandial_worse", "worse_lying_flat"],
    tags: ["reflux", "heartburn", "burning chest", "acid taste"],
    profile: {
      demographics: { agePeak: 42, ageSpread: 18, sexBias: { F: 1.0, M: 1.0 } },
      vitals: { temp: [36.4, 37.4], bpm: [68, 98], sys: [104, 138], dia: [66, 90] },
    },
  },
];

export const symptomLabels: Record<string, string> = {
  cough: "Persistent cough",
  sore_throat: "Sore throat",
  runny_nose: "Runny nose",
  sneezing: "Frequent sneezing",
  mild_fever: "Mild fever",
  low_fever: "Low fever",
  high_fever: "High fever",
  fatigue: "Fatigue",
  body_aches: "Body aches",
  headache: "Headache",
  chills: "Chills",
  nausea: "Nausea",
  vomiting: "Vomiting",
  diarrhea: "Diarrhea",
  abdominal_cramps: "Abdominal cramps",
  painful_swallowing: "Painful swallowing",
  swollen_lymph_nodes: "Swollen neck lymph nodes",
  unilateral_headache: "One-sided throbbing headache",
  photophobia: "Light sensitivity",
  aura: "Visual aura",
  dysuria: "Burning urination",
  urinary_frequency: "Frequent urge to urinate",
  pelvic_pain: "Lower pelvic pain",
  neck_stiffness: "Neck stiffness",
  confusion: "Confusion",
  right_lower_quadrant_pain: "Right lower abdominal pain",
  rebound_tenderness: "Pain worse when pressure is released",
  chest_pressure: "Chest pressure or heaviness",
  dyspnea: "Shortness of breath",
  diaphoresis: "Profuse sweating",
  arm_jaw_pain: "Pain radiating to arm or jaw",
  facial_droop: "Facial droop",
  unilateral_weakness: "One-sided weakness",
  slurred_speech: "Slurred or difficult speech",
  bloating: "Bloating",
  persistent_diarrhea: "Persistent diarrhea",
  weight_loss: "Unintentional weight loss",
  blood_in_stool: "Blood in stool",
  cough_with_phlegm: "Cough with phlegm",
  pleuritic_chest_pain: "Chest pain when breathing deeply",
  epigastric_pain: "Upper central abdominal pain",
  back_radiation_pain: "Pain radiating to the back",
  tachycardia: "Fast heart rate",
  urinary_urgency: "Sudden urgent need to urinate",
  nocturia: "Waking at night to urinate",
  urge_incontinence: "Leakage with sudden urge",
  retrosternal_burning: "Burning behind the breastbone",
  acid_regurgitation: "Sour acid coming up into throat/mouth",
  postprandial_worse: "Worse after meals",
  worse_lying_flat: "Worse when lying flat",
};
