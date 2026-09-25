export type ProjectBrief = {
  challenge: string;
  concept: string;
  outcome: string;
  skills: string[];
  materials: string[];
  phases: { title: string; detail: string; evidence: string }[];
  criteria: string[];
  stretch: string;
  note?: string;
};
