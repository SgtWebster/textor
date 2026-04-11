// app/experiment/types.ts

export type Condition = "humanized" | "technical";
export type Decision = "agree" | "disagree";

export interface TrialResponse {
  scenarioId: string;
  trialIndex: number;
  decision: Decision;
  confidence: number; // 1–5
  rt_ms: number;
}

export interface ExperimentSession {
  participantId: string;
  condition: Condition;
  orderedScenarioIds: string[];
  currentIndex: number;
  responses: TrialResponse[];
}
