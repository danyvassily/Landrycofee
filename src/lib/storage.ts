import type {
  SavingsAssumptions,
  ProjectCapexAssumptions,
  ProjectFinancingAssumptions,
} from './finance';
import {
  DEFAULT_SAVINGS_ASSUMPTIONS,
  ZERO_SAVINGS_ASSUMPTIONS,
  DEFAULT_CAPEX_ASSUMPTIONS,
  ZERO_CAPEX_ASSUMPTIONS,
  DEFAULT_FINANCING_ASSUMPTIONS,
  ZERO_FINANCING_ASSUMPTIONS,
  INITIAL_RESEARCH_NOTES,
  INITIAL_PROPERTY_EVALUATIONS,
  INITIAL_FOUNDER_IDEAS,
  INITIAL_ROADMAP_MILESTONES,
  type ResearchFieldNote,
  type PropertyCandidateEvaluation,
  type FounderIdeaNote,
  type RoadmapMilestone,
} from './project-data';

export const STORAGE_KEY = 'project_living_room_founder_workspace_v2';

export interface PersistedWorkspaceState {
  version: number;
  lastUpdatedIso: string;
  savingsAssumptions: SavingsAssumptions;
  capexAssumptions: ProjectCapexAssumptions;
  financingAssumptions: ProjectFinancingAssumptions;
  researchNotes: ResearchFieldNote[];
  propertyEvaluations: PropertyCandidateEvaluation[];
  founderIdeas: FounderIdeaNote[];
  roadmapMilestones: RoadmapMilestone[];
}

export function getDefaultWorkspaceState(): PersistedWorkspaceState {
  return {
    version: 2,
    lastUpdatedIso: new Date().toISOString(),
    savingsAssumptions: { ...DEFAULT_SAVINGS_ASSUMPTIONS },
    capexAssumptions: { ...DEFAULT_CAPEX_ASSUMPTIONS },
    financingAssumptions: { ...DEFAULT_FINANCING_ASSUMPTIONS },
    researchNotes: [...INITIAL_RESEARCH_NOTES],
    propertyEvaluations: [...INITIAL_PROPERTY_EVALUATIONS],
    founderIdeas: [...INITIAL_FOUNDER_IDEAS],
    roadmapMilestones: [...INITIAL_ROADMAP_MILESTONES],
  };
}

export function getZeroFinancialAssumptionsState(
  current: PersistedWorkspaceState
): PersistedWorkspaceState {
  return {
    ...current,
    lastUpdatedIso: new Date().toISOString(),
    savingsAssumptions: { ...ZERO_SAVINGS_ASSUMPTIONS },
    capexAssumptions: { ...ZERO_CAPEX_ASSUMPTIONS },
    financingAssumptions: { ...ZERO_FINANCING_ASSUMPTIONS },
  };
}

export function loadWorkspaceState(): PersistedWorkspaceState {
  if (typeof window === 'undefined') {
    return getDefaultWorkspaceState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultWorkspaceState();
    }
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspaceState>;
    const defaults = getDefaultWorkspaceState();
    return {
      version: 2,
      lastUpdatedIso: parsed.lastUpdatedIso || defaults.lastUpdatedIso,
      savingsAssumptions: {
        ...defaults.savingsAssumptions,
        ...(parsed.savingsAssumptions || {}),
      },
      capexAssumptions: {
        ...defaults.capexAssumptions,
        ...(parsed.capexAssumptions || {}),
      },
      financingAssumptions: {
        ...defaults.financingAssumptions,
        ...(parsed.financingAssumptions || {}),
      },
      researchNotes: Array.isArray(parsed.researchNotes)
        ? parsed.researchNotes
        : defaults.researchNotes,
      propertyEvaluations: Array.isArray(parsed.propertyEvaluations)
        ? parsed.propertyEvaluations
        : defaults.propertyEvaluations,
      founderIdeas: Array.isArray(parsed.founderIdeas)
        ? parsed.founderIdeas
        : defaults.founderIdeas,
      roadmapMilestones: Array.isArray(parsed.roadmapMilestones)
        ? parsed.roadmapMilestones
        : defaults.roadmapMilestones,
    };
  } catch {
    return getDefaultWorkspaceState();
  }
}

export function saveWorkspaceState(state: PersistedWorkspaceState): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const updated: PersistedWorkspaceState = {
      ...state,
      lastUpdatedIso: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}
