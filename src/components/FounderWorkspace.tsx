'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  WORKSPACE_MODULES,
  REGULATORY_FRAMEWORK_ITEMS,
  PROPERTY_TECHNICAL_SPECS,
  IDEA_LAB_DAY_NIGHT_MODES,
  type WorkspaceModuleId,
  type ResearchFieldNote,
  type PropertyCandidateEvaluation,
  type FounderIdeaNote,
  type RoadmapMilestone,
} from '@/lib/project-data';
import {
  simulateSavingsScenarios,
  simulateProjectFundingAndLoan,
  calculatePropertyCompatibilityScore,
  type SavingsAssumptions,
  type ProjectCapexAssumptions,
  type ProjectFinancingAssumptions,
} from '@/lib/finance';
import {
  loadWorkspaceState,
  saveWorkspaceState,
  getDefaultWorkspaceState,
  type PersistedWorkspaceState,
} from '@/lib/storage';

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const eurPreciseFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEur(value: number): string {
  return eurFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatEurPrecise(value: number): string {
  return eurPreciseFormatter.format(Number.isFinite(value) ? value : 0);
}

export default function FounderWorkspace() {
  const [activeModule, setActiveModule] = useState<WorkspaceModuleId>('dashboard');
  const [workspaceState, setWorkspaceState] = useState<PersistedWorkspaceState>(() =>
    getDefaultWorkspaceState()
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAuthPlanModal, setShowAuthPlanModal] = useState(false);
  const [amortizationViewMode, setAmortizationViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [showFullSavingsTable, setShowFullSavingsTable] = useState(false);

  // Form states for adding founder entries locally
  const [newResearchTitle, setNewResearchTitle] = useState('');
  const [newResearchAxis, setNewResearchAxis] =
    useState<ResearchFieldNote['axis']>('Modèle Laverie');
  const [newResearchHypothesis, setNewResearchHypothesis] = useState('');
  const [newResearchMethodology, setNewResearchMethodology] = useState('');

  const [newPropLabel, setNewPropLabel] = useState('');
  const [newPropZone, setNewPropZone] = useState('Paris 11e');
  const [newPropSurface, setNewPropSurface] = useState(115);
  const [newPropRent, setNewPropRent] = useState(4500);
  const [newPropDab, setNewPropDab] = useState(85000);
  const [newPropSlab, setNewPropSlab] = useState(true);
  const [newPropPower, setNewPropPower] = useState(true);
  const [newPropLicense, setNewPropLicense] = useState(true);
  const [newPropFacade, setNewPropFacade] = useState(true);

  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] =
    useState<FounderIdeaNote['category']>('Expérience Client');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaImpact, setNewIdeaImpact] = useState(4);
  const [newIdeaFeasibility, setNewIdeaFeasibility] = useState(4);

  useEffect(() => {
    const loaded = loadWorkspaceState();
    setWorkspaceState(loaded);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveWorkspaceState(workspaceState);
  }, [workspaceState, isHydrated]);

  const savingsResult = useMemo(
    () => simulateSavingsScenarios(workspaceState.savingsAssumptions),
    [workspaceState.savingsAssumptions]
  );

  const fundingAndLoanResult = useMemo(
    () =>
      simulateProjectFundingAndLoan(
        workspaceState.capexAssumptions,
        workspaceState.financingAssumptions,
        savingsResult.central.finalBalance
      ),
    [
      workspaceState.capexAssumptions,
      workspaceState.financingAssumptions,
      savingsResult.central.finalBalance,
    ]
  );

  const updateSavingsField = <K extends keyof SavingsAssumptions>(
    key: K,
    value: SavingsAssumptions[K]
  ) => {
    setWorkspaceState((prev) => ({
      ...prev,
      savingsAssumptions: {
        ...prev.savingsAssumptions,
        [key]: value,
      },
    }));
  };

  const updateCapexField = <K extends keyof ProjectCapexAssumptions>(
    key: K,
    value: ProjectCapexAssumptions[K]
  ) => {
    setWorkspaceState((prev) => ({
      ...prev,
      capexAssumptions: {
        ...prev.capexAssumptions,
        [key]: value,
      },
    }));
  };

  const updateFinancingField = <K extends keyof ProjectFinancingAssumptions>(
    key: K,
    value: ProjectFinancingAssumptions[K]
  ) => {
    setWorkspaceState((prev) => ({
      ...prev,
      financingAssumptions: {
        ...prev.financingAssumptions,
        [key]: value,
      },
    }));
  };

  const handleAutoBalanceLoan = () => {
    const requiredLoan = Math.max(
      0,
      Math.round(fundingAndLoanResult.totalProjectCost - fundingAndLoanResult.totalQuasiEquity)
    );
    updateFinancingField('bankLoanPrincipal', requiredLoan);
  };

  const handleResetToDefaults = () => {
    const defaults = getDefaultWorkspaceState();
    setWorkspaceState(defaults);
    saveWorkspaceState(defaults);
  };

  const handleExportJson = () => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(workspaceState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-living-room-hypotheses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddResearchNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResearchTitle.trim() || !newResearchHypothesis.trim()) return;
    const note: ResearchFieldNote = {
      id: `res-custom-${Date.now()}`,
      date: new Date().toISOString().slice(0, 7),
      axis: newResearchAxis,
      title: newResearchTitle.trim(),
      hypothesisTested: newResearchHypothesis.trim(),
      methodologyNote:
        newResearchMethodology.trim() || 'Relevé terrain ajouté par l’équipe fondatrice.',
      status: 'À vérifier sur terrain',
    };
    setWorkspaceState((prev) => ({
      ...prev,
      researchNotes: [note, ...prev.researchNotes],
    }));
    setNewResearchTitle('');
    setNewResearchHypothesis('');
    setNewResearchMethodology('');
  };

  const handleCycleResearchStatus = (id: string) => {
    const order: ResearchFieldNote['status'][] = [
      'À vérifier sur terrain',
      'En cours d’analyse',
      'Cadre validé',
    ];
    setWorkspaceState((prev) => ({
      ...prev,
      researchNotes: prev.researchNotes.map((item) => {
        if (item.id !== id) return item;
        const nextIdx = (order.indexOf(item.status) + 1) % order.length;
        return { ...item, status: order[nextIdx] };
      }),
    }));
  };

  const handleAddPropertyCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropLabel.trim()) return;
    const candidate: PropertyCandidateEvaluation = {
      id: `prop-custom-${Date.now()}`,
      label: newPropLabel.trim(),
      targetZone: newPropZone.trim() || 'Paris Est / Nord',
      surfaceSqm: Number(newPropSurface) || 100,
      monthlyRentExclCharges: Number(newPropRent) || 4000,
      leaseAssignmentCost: Number(newPropDab) || 0,
      hasConcreteSlab: newPropSlab,
      hasThreePhasePower: newPropPower,
      hasBarLicenseAllowed: newPropLicense,
      hasAdequateFacade: newPropFacade,
      notes: 'Fiche d’évaluation saisie localement par le fondateur.',
      isHypotheticalTemplate: false,
    };
    setWorkspaceState((prev) => ({
      ...prev,
      propertyEvaluations: [candidate, ...prev.propertyEvaluations],
    }));
    setNewPropLabel('');
  };

  const handleTogglePropertyCheck = (
    id: string,
    field: 'hasConcreteSlab' | 'hasThreePhasePower' | 'hasBarLicenseAllowed' | 'hasAdequateFacade'
  ) => {
    setWorkspaceState((prev) => ({
      ...prev,
      propertyEvaluations: prev.propertyEvaluations.map((p) =>
        p.id === id ? { ...p, [field]: !p[field] } : p
      ),
    }));
  };

  const handleAddFounderIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim() || !newIdeaDesc.trim()) return;
    const idea: FounderIdeaNote = {
      id: `idea-custom-${Date.now()}`,
      category: newIdeaCategory,
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim(),
      impactScore: Number(newIdeaImpact) || 4,
      feasibilityScore: Number(newIdeaFeasibility) || 4,
      status: 'Hypothèse',
    };
    setWorkspaceState((prev) => ({
      ...prev,
      founderIdeas: [idea, ...prev.founderIdeas],
    }));
    setNewIdeaTitle('');
    setNewIdeaDesc('');
  };

  const handleCycleIdeaStatus = (id: string) => {
    const order: FounderIdeaNote['status'][] = ['Hypothèse', 'À prototyper', 'Retenu MVP'];
    setWorkspaceState((prev) => ({
      ...prev,
      founderIdeas: prev.founderIdeas.map((idea) => {
        if (idea.id !== id) return idea;
        const nextIdx = (order.indexOf(idea.status) + 1) % order.length;
        return { ...idea, status: order[nextIdx] };
      }),
    }));
  };

  const handleCycleRoadmapStatus = (id: string) => {
    const order: RoadmapMilestone['status'][] = ['À venir', 'En cours', 'Terminé'];
    setWorkspaceState((prev) => ({
      ...prev,
      roadmapMilestones: prev.roadmapMilestones.map((ms) => {
        if (ms.id !== id) return ms;
        const nextIdx = (order.indexOf(ms.status) + 1) % order.length;
        return { ...ms, status: order[nextIdx] };
      }),
    }));
  };

  const currentModuleMeta =
    WORKSPACE_MODULES.find((m) => m.id === activeModule) || WORKSPACE_MODULES[0];

  return (
    <div className="min-h-screen flex flex-col bg-living-bg text-living-ink">
      {/* Bandeau de gouvernance privée, persistance locale et statut des hypothèses */}
      <div className="border-b border-living-border bg-[#EFEAE1] px-4 py-2 text-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-living-ink/20 bg-living-ink px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-living-bg">
              Espace Fondateur Privé
            </span>
            <span className="inline-flex items-center rounded-full bg-[#FBF3DB] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#956400]">
              Hypothèses de travail modifiables
            </span>
            <span className="hidden md:inline text-[#5C554E]">
              Persistance locale active (localStorage) · Aucun secret embarqué · Aucune donnée fabriquée
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAuthPlanModal((v) => !v)}
              className="rounded border border-living-border bg-white px-2.5 py-1 font-mono text-[11px] text-living-ink transition hover:bg-living-muted"
            >
              Plan Auth & Confidentialité
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="rounded border border-living-border bg-white px-2.5 py-1 font-mono text-[11px] text-living-ink transition hover:bg-living-muted"
            >
              Exporter JSON
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="rounded border border-living-border bg-white px-2.5 py-1 font-mono text-[11px] text-[#9F2F2D] transition hover:bg-[#FDEBEC]"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Panneau pliable : Plan d'authentification et gouvernance des données */}
      {showAuthPlanModal && (
        <section
          aria-label="Plan de confidentialité et de contrôle d'accès"
          className="border-b border-living-border bg-white px-4 py-6"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex items-start justify-between gap-4 border-b border-living-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                  Architecture de Sécurité & Gouvernance Privée
                </p>
                <h2 className="mt-1 font-serif text-xl font-normal tracking-tight text-living-ink">
                  Plan d’Authentification, Cloisonnement & Protection du Dossier Fondateur
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthPlanModal(false)}
                className="rounded border border-living-border px-3 py-1 font-mono text-xs hover:bg-living-muted"
              >
                Fermer
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 text-sm">
              <div className="rounded-lg border border-living-border bg-living-bg p-4">
                <span className="inline-block rounded-full bg-[#EDF3EC] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#346538]">
                  Niveau 1 · Actif (MVP Local)
                </span>
                <h3 className="mt-2 font-medium text-living-ink">
                  Mode Local-First Sans Exposition Publique
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C554E]">
                  Aucune clé API ni connexion Supabase active n’est embarquée. Les simulations, notes
                  terrain et fiches de locaux sont sauvegardées exclusivement dans le navigateur du
                  fondateur (<code className="font-mono">localStorage</code>) avec balise{' '}
                  <code className="font-mono">noindex, nofollow</code>.
                </p>
              </div>
              <div className="rounded-lg border border-living-border bg-living-bg p-4">
                <span className="inline-block rounded-full bg-[#FBF3DB] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#956400]">
                  Niveau 2 · Pré-Déploiement Privé
                </span>
                <h3 className="mt-2 font-medium text-living-ink">
                  Gating Middleware Next.js & Liste Blanche Fondateurs
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C554E]">
                  Avant tout hébergement privé partagé entre co-fondateurs : activation d’un
                  middleware Next.js vérifiant une session signée HTTP-only et restreignant l’accès
                  aux seules adresses e-mail figurant dans{' '}
                  <code className="font-mono">FOUNDER_ALLOWED_EMAILS</code>.
                </p>
              </div>
              <div className="rounded-lg border border-living-border bg-living-bg p-4">
                <span className="inline-block rounded-full bg-[#E1F3FE] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#1F6C9F]">
                  Niveau 3 · Persistance Supabase + RLS
                </span>
                <h3 className="mt-2 font-medium text-living-ink">
                  Chiffrement & Politiques Row-Level Security (RLS)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C554E]">
                  Lors de la connexion future d’un projet Supabase privé : tables{' '}
                  <code className="font-mono">founder_scenarios</code>,{' '}
                  <code className="font-mono">property_Pipeline</code> et{' '}
                  <code className="font-mono">field_notes</code> verrouillées par RLS strictes (
                  <code className="font-mono">auth.uid() IN (founder_ids)</code>), sans jamais
                  exposer de clé <code className="font-mono">service_role</code> côté client.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* En-tête éditorial & Navigation principale des 6 modules */}
      <header className="sticky top-0 z-30 border-b border-living-border bg-living-bg/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                  PARIS · CIBLE DÉCEMBRE 2027
                </span>
                <span className="text-living-border">|</span>
                <span className="font-mono text-xs text-living-terracotta">
                  Laverie · Coffee Shop · Listening & Cocktail Bar
                </span>
              </div>
              <h1 className="mt-0.5 font-serif text-2xl sm:text-3xl font-normal tracking-tight text-living-ink">
                Project Living Room
              </h1>
            </div>

            {/* Résumé financier rapide toujours visible dans l'en-tête */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-lg border border-living-border bg-white p-2.5 text-xs">
              <div className="px-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#787774]">
                  Budget Projet (Hyp.)
                </div>
                <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-living-ink">
                  {formatEur(fundingAndLoanResult.totalProjectCost)}
                </div>
              </div>
              <div className="border-l border-living-border px-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#787774]">
                  Apport Projeté M+{workspaceState.savingsAssumptions.monthsToTarget}
                </div>
                <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-living-ink">
                  {formatEur(fundingAndLoanResult.effectiveFounderEquity)}
                </div>
              </div>
              <div className="border-l border-living-border px-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#787774]">
                  {fundingAndLoanResult.fundingGap > 0 ? 'Écart à combler' : 'Solde Financement'}
                </div>
                <div
                  className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
                    fundingAndLoanResult.fundingGap > 0 ? 'text-[#9F2F2D]' : 'text-[#346538]'
                  }`}
                >
                  {fundingAndLoanResult.fundingGap > 0
                    ? `-${formatEur(fundingAndLoanResult.fundingGap)}`
                    : `+${formatEur(fundingAndLoanResult.netFundingBalance)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Barre de navigation des 6 modules clairement balisés */}
          <nav
            aria-label="Modules de l’espace fondateur"
            className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1"
          >
            {WORKSPACE_MODULES.map((mod) => {
              const isActive = mod.id === activeModule;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModule(mod.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex shrink-0 items-center gap-2 rounded-md border px-3.5 py-2 text-left text-xs transition ${
                    isActive
                      ? 'border-living-ink bg-living-ink text-white'
                      : 'border-living-border bg-white text-living-ink hover:bg-living-muted'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider ${
                      isActive ? 'text-white/75' : 'text-[#787774]'
                    }`}
                  >
                    {mod.code}
                  </span>
                  <span className="font-medium">{mod.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Contenu principal du module actif */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Bandeau d'identification du module courant */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-living-border bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                {currentModuleMeta.code}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FBF3DB] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#956400]">
                {currentModuleMeta.statusBadge}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-normal tracking-tight text-living-ink">
              {currentModuleMeta.label}
            </h2>
            <p className="mt-1 text-sm text-[#5C554E]">{currentModuleMeta.subtitle}</p>
          </div>
          {activeModule !== 'finance' && (
            <button
              type="button"
              onClick={() => setActiveModule('finance')}
              className="shrink-0 rounded-md bg-living-ink px-4 py-2.5 text-xs font-medium text-white transition hover:bg-living-espresso"
            >
              Ouvrir les Simulateurs Financiers
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* MODULE 01 : TABLEAU DE BORD (DASHBOARD)                           */}
        {/* ================================================================= */}
        {activeModule === 'dashboard' && (
          <div className="space-y-8 fade-enter">
            {/* Thèse Exécutive & Positionnement */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-living-border bg-white p-6 sm:p-8 lg:col-span-7">
                <span className="inline-block rounded-full bg-[#EFEAE1] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-living-ink">
                  Thèse Fondatrice · Horizon Décembre 2027
                </span>
                <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-normal leading-tight text-living-ink">
                  Transformer une corvée urbaine incompressible en tiers-lieu culturel, caféiné et
                  audiophile à Paris.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#5C554E]">
                  <strong>Project Living Room</strong> hybride trois modèles économiques
                  complémentaires sur une même surface commerciale parisienne (110 à 150 m²) : une{' '}
                  <strong>laverie haute performance</strong> assurant un flux récurrent dès 07h30, un{' '}
                  <strong>coffee shop de spécialité</strong> monétisant les 45 minutes d’attente en
                  journée, et un <strong>listening bar à cocktails</strong> à haute valeur ajoutée en
                  soirée.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-living-border bg-living-bg p-3.5">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#787774]">
                      07h30 – 14h00
                    </div>
                    <div className="mt-1 text-sm font-medium text-living-ink">
                      Laverie & Espresso
                    </div>
                    <p className="mt-1 text-xs text-[#5C554E]">
                      Cycles automatisés, café de spécialité, lumière naturelle et tables d’attente.
                    </p>
                  </div>
                  <div className="rounded-lg border border-living-border bg-living-bg p-3.5">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#787774]">
                      14h00 – 18h30
                    </div>
                    <div className="mt-1 text-sm font-medium text-living-ink">
                      Salon Urbain & Linge
                    </div>
                    <p className="mt-1 text-xs text-[#5C554E]">
                      Occupation des heures creuses grâce à la récurrence laverie et écoute d’albums.
                    </p>
                  </div>
                  <div className="rounded-lg border border-living-border bg-living-bg p-3.5">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#787774]">
                      18h30 – 01h00
                    </div>
                    <div className="mt-1 text-sm font-medium text-living-ink">
                      Listening & Cocktail Bar
                    </div>
                    <p className="mt-1 text-xs text-[#5C554E]">
                      Occultation acoustique du parc machines, système Hi-Fi vinyle et cocktails.
                    </p>
                  </div>
                </div>
              </div>

              {/* Synthèse Financière Temps Réel (Connectée aux Simulateurs) */}
              <div className="rounded-xl border border-living-border bg-white p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                      Synthèse Financière Live
                    </span>
                    <span className="rounded-full bg-[#FBF3DB] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#956400]">
                      Hypothèses Modifiables
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-normal text-living-ink">
                    Équilibre du Plan de Financement
                  </h3>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-living-border pb-2.5">
                      <dt className="text-[#5C554E]">Investissement Total (CAPEX + BFR)</dt>
                      <dd className="font-mono font-semibold tabular-nums text-living-ink">
                        {formatEur(fundingAndLoanResult.totalProjectCost)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-living-border pb-2.5">
                      <dt className="text-[#5C554E]">
                        Apport Fondateurs Projeté (M+{workspaceState.savingsAssumptions.monthsToTarget})
                      </dt>
                      <dd className="font-mono font-semibold tabular-nums text-living-ink">
                        {formatEur(fundingAndLoanResult.effectiveFounderEquity)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-living-border pb-2.5">
                      <dt className="text-[#5C554E]">
                        Quasi-Fonds Propres Totaux ({fundingAndLoanResult.equityRatioPercent}%)
                      </dt>
                      <dd className="font-mono font-semibold tabular-nums text-living-ink">
                        {formatEur(fundingAndLoanResult.totalQuasiEquity)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-living-border pb-2.5">
                      <dt className="text-[#5C554E]">
                        Dette Bancaire ({workspaceState.financingAssumptions.loanDurationYears} ans à{' '}
                        {workspaceState.financingAssumptions.annualInterestRatePercent}%)
                      </dt>
                      <dd className="font-mono font-semibold tabular-nums text-living-ink">
                        {formatEur(fundingAndLoanResult.loanSummary.principal)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <dt className="font-medium text-living-ink">
                        {fundingAndLoanResult.fundingGap > 0
                          ? 'Écart de Financement (Funding Gap)'
                          : 'Excédent / Coussin de Financement'}
                      </dt>
                      <dd
                        className={`rounded px-2 py-0.5 font-mono font-semibold tabular-nums ${
                          fundingAndLoanResult.fundingGap > 0
                            ? 'bg-[#FDEBEC] text-[#9F2F2D]'
                            : 'bg-[#EDF3EC] text-[#346538]'
                        }`}
                      >
                        {fundingAndLoanResult.fundingGap > 0
                          ? `Manque ${formatEur(fundingAndLoanResult.fundingGap)}`
                          : `+${formatEur(fundingAndLoanResult.netFundingBalance)}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 pt-4 border-t border-living-border flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#5C554E]">
                    Mensualité crédit + assurance :{' '}
                    <strong className="font-mono text-living-ink">
                      {formatEurPrecise(
                        fundingAndLoanResult.loanSummary.totalMonthlyDebtServiceAmortizing
                      )}
                      /mois
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModule('finance')}
                    className="rounded border border-living-ink bg-living-ink px-3.5 py-2 text-xs font-medium text-white transition hover:bg-living-espresso"
                  >
                    Simuler & Ajuster →
                  </button>
                </div>
              </div>
            </section>

            {/* Accès rapide aux 6 Modules de l'Espace Fondateur */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Architecture des Modules du Cockpit Fondateur
                </h3>
                <span className="font-mono text-xs text-[#787774]">
                  6 modules opérationnels · Données persistées localement
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {WORKSPACE_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex flex-col justify-between rounded-xl border border-living-border bg-white p-5 transition hover:border-living-ink/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#787774]">{mod.code}</span>
                        <span className="rounded-full bg-living-muted px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-living-ink">
                          {mod.statusBadge}
                        </span>
                      </div>
                      <h4 className="mt-2 font-serif text-lg font-normal text-living-ink">
                        {mod.label}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#5C554E]">
                        {mod.subtitle}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-living-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveModule(mod.id)}
                        className="font-mono text-xs font-medium text-living-ink underline-offset-4 hover:underline"
                      >
                        Accéder au module {mod.shortLabel} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODULE 02 : FINANCE & SIMULATEURS INTERACTIFS                     */}
        {/* ================================================================= */}
        {activeModule === 'finance' && (
          <div className="space-y-10 fade-enter">
            {/* Avertissement explicite sur la nature hypothétique des hypothèses */}
            <div className="rounded-xl border border-[#956400]/30 bg-[#FBF3DB] p-4 text-xs text-[#956400]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong className="font-mono uppercase tracking-wider">
                    Avis de Simulation — Hypothèses Modifiables (Hypothétiques) :
                  </strong>{' '}
                  Toutes les valeurs ci-dessous constituent des hypothèses de travail prévisionnelles
                  pour Project Living Room (horizon Décembre 2027). Modifiez librement les curseurs et
                  champs numériques ; vos réglages sont sauvegardés localement dans ce navigateur.
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="shrink-0 rounded border border-[#956400]/40 bg-white px-2.5 py-1 font-mono text-[11px] text-[#956400] hover:bg-[#FBF3DB]"
                >
                  Restaurer les hypothèses étalons
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SIMULATEUR 1 : ÉPARGNE & APPORT FONDATEURS                    */}
            {/* ------------------------------------------------------------- */}
            <section
              aria-labelledby="sim-savings-heading"
              className="rounded-xl border border-living-border bg-white p-6 sm:p-8"
            >
              <div className="border-b border-living-border pb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                    Simulateur I · Constitution des Fonds Propres
                  </span>
                  <h3
                    id="sim-savings-heading"
                    className="mt-1 font-serif text-2xl font-normal text-living-ink"
                  >
                    Scénarios d’Épargne & Apport Personnel Fondateurs
                  </h3>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-[#FBF3DB] px-3 py-1 font-mono text-xs text-[#956400]">
                  effort requis cible : {formatEur(savingsResult.requiredMonthlyForTarget)}/mois
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Panneau de contrôle des hypothèses d'épargne */}
                <div className="space-y-5 lg:col-span-5">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                    Hypothèses d’Épargne (Modifiables)
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-initial-savings">
                        Épargne initiale déjà mobilisable (€)
                      </label>
                      <span className="font-mono tabular-nums">
                        {formatEur(workspaceState.savingsAssumptions.initialSavings)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="input-initial-savings"
                        type="range"
                        min={0}
                        max={200000}
                        step={1000}
                        value={workspaceState.savingsAssumptions.initialSavings}
                        onChange={(e) =>
                          updateSavingsField('initialSavings', Number(e.target.value))
                        }
                        className="w-full"
                      />
                      <input
                        type="number"
                        aria-label="Saisie numérique épargne initiale"
                        min={0}
                        step={500}
                        value={workspaceState.savingsAssumptions.initialSavings}
                        onChange={(e) =>
                          updateSavingsField('initialSavings', Number(e.target.value))
                        }
                        className="w-28 rounded border border-living-border bg-living-bg px-2.5 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-monthly-contribution">
                        Versement mensuel combiné fondateurs (€/mois)
                      </label>
                      <span className="font-mono tabular-nums">
                        {formatEur(workspaceState.savingsAssumptions.monthlyContribution)}/mois
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="input-monthly-contribution"
                        type="range"
                        min={0}
                        max={12000}
                        step={100}
                        value={workspaceState.savingsAssumptions.monthlyContribution}
                        onChange={(e) =>
                          updateSavingsField('monthlyContribution', Number(e.target.value))
                        }
                        className="w-full"
                      />
                      <input
                        type="number"
                        aria-label="Saisie numérique versement mensuel"
                        min={0}
                        step={100}
                        value={workspaceState.savingsAssumptions.monthlyContribution}
                        onChange={(e) =>
                          updateSavingsField('monthlyContribution', Number(e.target.value))
                        }
                        className="w-28 rounded border border-living-border bg-living-bg px-2.5 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="input-months-horizon"
                        className="block text-xs font-medium text-living-ink"
                      >
                        Horizon avant closing (mois)
                      </label>
                      <input
                        id="input-months-horizon"
                        type="number"
                        min={1}
                        max={60}
                        value={workspaceState.savingsAssumptions.monthsToTarget}
                        onChange={(e) =>
                          updateSavingsField('monthsToTarget', Number(e.target.value))
                        }
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="input-annual-yield"
                        className="block text-xs font-medium text-living-ink"
                      >
                        Rendement annuel net (%)
                      </label>
                      <input
                        id="input-annual-yield"
                        type="number"
                        min={0}
                        max={12}
                        step={0.1}
                        value={workspaceState.savingsAssumptions.annualYieldPercent}
                        onChange={(e) =>
                          updateSavingsField('annualYieldPercent', Number(e.target.value))
                        }
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="input-exceptional-amount"
                        className="block text-xs font-medium text-living-ink"
                      >
                        Apport exceptionnel ponctuel (€)
                      </label>
                      <input
                        id="input-exceptional-amount"
                        type="number"
                        min={0}
                        step={1000}
                        value={workspaceState.savingsAssumptions.exceptionalContribution}
                        onChange={(e) =>
                          updateSavingsField('exceptionalContribution', Number(e.target.value))
                        }
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="input-exceptional-month"
                        className="block text-xs font-medium text-living-ink"
                      >
                        Mois de versement exceptionnel (M+)
                      </label>
                      <input
                        id="input-exceptional-month"
                        type="number"
                        min={1}
                        max={workspaceState.savingsAssumptions.monthsToTarget}
                        value={workspaceState.savingsAssumptions.exceptionalContributionMonth}
                        onChange={(e) =>
                          updateSavingsField('exceptionalContributionMonth', Number(e.target.value))
                        }
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-target-equity">
                        Cible d’apport personnel visée (€)
                      </label>
                      <span className="font-mono tabular-nums">
                        {formatEur(workspaceState.savingsAssumptions.targetFounderEquity)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="input-target-equity"
                        type="range"
                        min={30000}
                        max={250000}
                        step={2500}
                        value={workspaceState.savingsAssumptions.targetFounderEquity}
                        onChange={(e) =>
                          updateSavingsField('targetFounderEquity', Number(e.target.value))
                        }
                        className="w-full"
                      />
                      <input
                        type="number"
                        aria-label="Saisie numérique cible apport"
                        min={0}
                        step={1000}
                        value={workspaceState.savingsAssumptions.targetFounderEquity}
                        onChange={(e) =>
                          updateSavingsField('targetFounderEquity', Number(e.target.value))
                        }
                        className="w-28 rounded border border-living-border bg-living-bg px-2.5 py-1.5 font-mono text-xs tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                {/* Comparaison des 3 scénarios d'épargne */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                      Comparaison des 3 Trajectoires à M+{workspaceState.savingsAssumptions.monthsToTarget}
                    </h4>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {savingsResult.scenarios.map((scen) => {
                        const isCentral = scen.id === 'central';
                        const isReached = scen.targetGapOrSurplus >= 0;
                        return (
                          <div
                            key={scen.id}
                            className={`rounded-xl border p-4 ${
                              isCentral
                                ? 'border-living-ink bg-living-bg'
                                : 'border-living-border bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-[#787774]">
                                {scen.name}
                              </span>
                              {isCentral && (
                                <span className="rounded bg-living-ink px-1.5 py-0.5 font-mono text-[9px] uppercase text-white">
                                  Référence
                                </span>
                              )}
                            </div>
                            <div className="mt-2 font-mono text-xl font-semibold tabular-nums text-living-ink">
                              {formatEur(scen.finalBalance)}
                            </div>
                            <div className="mt-1 font-mono text-xs text-[#5C554E]">
                              Versement : {formatEur(scen.effectiveMonthlyContribution)}/mois
                            </div>
                            <dl className="mt-3 space-y-1 border-t border-living-border pt-2.5 text-[11px]">
                              <div className="flex justify-between">
                                <dt className="text-[#787774]">Capital versé :</dt>
                                <dd className="font-mono tabular-nums">
                                  {formatEur(scen.totalPrincipalContributed)}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-[#787774]">Intérêts acquis :</dt>
                                <dd className="font-mono tabular-nums">
                                  +{formatEurPrecise(scen.totalInterestEarned)}
                                </dd>
                              </div>
                              <div className="flex justify-between pt-1">
                                <dt className="font-medium">Écart / Cible :</dt>
                                <dd
                                  className={`font-mono font-semibold tabular-nums ${
                                    isReached ? 'text-[#346538]' : 'text-[#9F2F2D]'
                                  }`}
                                >
                                  {isReached
                                    ? `+${formatEur(scen.targetGapOrSurplus)}`
                                    : formatEur(scen.targetGapOrSurplus)}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visualisation de la progression mensuelle du Scénario Central */}
                  <div className="rounded-xl border border-living-border bg-living-bg p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-living-ink">
                        Courbe de Capitalisation — Scénario Central (M+1 à M+
                        {workspaceState.savingsAssumptions.monthsToTarget})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFullSavingsTable((v) => !v)}
                        className="font-mono text-xs underline hover:text-living-terracotta"
                      >
                        {showFullSavingsTable
                          ? 'Masquer l’échéancier mensuel'
                          : 'Afficher l’échéancier mensuel détaillé'}
                      </button>
                    </div>

                    {/* Barres de progression mensuelle */}
                    <div className="mt-4 flex h-28 items-end gap-1.5 pt-2">
                      {savingsResult.central.schedule.map((pt) => {
                        const maxVal = Math.max(
                          savingsResult.central.finalBalance,
                          workspaceState.savingsAssumptions.targetFounderEquity,
                          1
                        );
                        const heightPct = Math.min(100, Math.max(10, (pt.endingBalance / maxVal) * 100));
                        const reachedTarget =
                          pt.endingBalance >= workspaceState.savingsAssumptions.targetFounderEquity;
                        return (
                          <div
                            key={pt.monthIndex}
                            className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                            title={`${pt.label}: ${formatEur(pt.endingBalance)}`}
                          >
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all ${
                                reachedTarget ? 'bg-[#3E5C4E]' : 'bg-living-ink'
                              }`}
                            />
                            <span className="font-mono text-[9px] text-[#787774]">{pt.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showFullSavingsTable && (
                      <div className="mt-4 max-h-64 overflow-x-auto overflow-y-auto border-t border-living-border pt-3">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-living-border text-[10px] uppercase text-[#787774]">
                              <th className="py-1.5 pr-3">Mois</th>
                              <th className="py-1.5 pr-3">Solde Début</th>
                              <th className="py-1.5 pr-3">Mensualité</th>
                              <th className="py-1.5 pr-3">Apport Exc.</th>
                              <th className="py-1.5 pr-3">Intérêts</th>
                              <th className="py-1.5 text-right">Solde Fin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-living-border/60">
                            {savingsResult.central.schedule.map((row) => (
                              <tr key={row.monthIndex}>
                                <td className="py-1.5 pr-3 font-semibold">{row.label}</td>
                                <td className="py-1.5 pr-3 tabular-nums">
                                  {formatEur(row.startingBalance)}
                                </td>
                                <td className="py-1.5 pr-3 tabular-nums">
                                  +{formatEur(row.regularContribution)}
                                </td>
                                <td className="py-1.5 pr-3 tabular-nums">
                                  {row.exceptionalAddition > 0
                                    ? `+${formatEur(row.exceptionalAddition)}`
                                    : '—'}
                                </td>
                                <td className="py-1.5 pr-3 tabular-nums">
                                  +{formatEurPrecise(row.interestEarned)}
                                </td>
                                <td className="py-1.5 text-right font-semibold tabular-nums">
                                  {formatEur(row.endingBalance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* SIMULATEUR 2 : PLAN DE FINANCEMENT, FUNDING GAP & EMPRUNT     */}
            {/* ------------------------------------------------------------- */}
            <section
              aria-labelledby="sim-loan-heading"
              className="rounded-xl border border-living-border bg-white p-6 sm:p-8"
            >
              <div className="border-b border-living-border pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                    Simulateur II · Emplois / Ressources & Dette Bancaire
                  </span>
                  <h3
                    id="sim-loan-heading"
                    className="mt-1 font-serif text-2xl font-normal text-living-ink"
                  >
                    Plan de Financement, Écart (Funding Gap) & Amortissement d’Emprunt
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoBalanceLoan}
                    className="rounded border border-living-ink bg-living-ink px-3 py-1.5 font-mono text-xs text-white transition hover:bg-living-espresso"
                  >
                    Équilibrer l’emprunt sur le Funding Gap (0 €)
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Colonne 1 : Besoins d'investissement (CAPEX & BFR) */}
                <div className="space-y-4 lg:col-span-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                      1. Emplois — Postes CAPEX & BFR (Hypothèses)
                    </h4>
                    <span className="font-mono text-xs font-semibold">
                      Total : {formatEur(fundingAndLoanResult.totalProjectCost)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {fundingAndLoanResult.capexBreakdown.map((item) => (
                      <div
                        key={item.key}
                        className="rounded-lg border border-living-border bg-living-bg p-3"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <label
                            htmlFor={`capex-${item.key}`}
                            className="font-medium text-living-ink"
                          >
                            {item.label}
                          </label>
                          <span className="font-mono text-[11px] text-[#787774]">
                            {item.sharePercent}%
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            id={`capex-${item.key}`}
                            type="range"
                            min={0}
                            max={250000}
                            step={1000}
                            value={workspaceState.capexAssumptions[item.key]}
                            onChange={(e) =>
                              updateCapexField(item.key, Number(e.target.value))
                            }
                            className="w-full"
                          />
                          <input
                            type="number"
                            aria-label={`Montant ${item.label}`}
                            min={0}
                            step={1000}
                            value={workspaceState.capexAssumptions[item.key]}
                            onChange={(e) =>
                              updateCapexField(item.key, Number(e.target.value))
                            }
                            className="w-28 rounded border border-living-border bg-white px-2.5 py-1 font-mono text-xs tabular-nums"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colonne 2 : Ressources, Paramètres Bancaires & Diagnostic Funding Gap */}
                <div className="space-y-6 lg:col-span-7">
                  <div className="rounded-xl border border-living-border bg-living-bg p-5">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                      2. Ressources & Paramètres du Crédit Bancaire (Hypothèses)
                    </h4>

                    <div className="mt-4 flex items-center justify-between rounded-lg border border-living-border bg-white p-3 text-xs">
                      <div>
                        <span className="font-medium text-living-ink">
                          Synchroniser l’apport personnel depuis le Simulateur I (Scénario Central)
                        </span>
                        <p className="text-[11px] text-[#5C554E]">
                          Apport synchronisé : {formatEur(savingsResult.central.finalBalance)}
                        </p>
                      </div>
                      <input
                        id="toggle-sync-savings"
                        type="checkbox"
                        checked={workspaceState.financingAssumptions.syncFounderEquityFromSavings}
                        onChange={(e) =>
                          updateFinancingField('syncFounderEquityFromSavings', e.target.checked)
                        }
                        className="h-4 w-4 accent-living-ink"
                      />
                    </div>

                    {!workspaceState.financingAssumptions.syncFounderEquityFromSavings && (
                      <div className="mt-3">
                        <label
                          htmlFor="input-manual-equity"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Apport personnel fondateurs manuel (€)
                        </label>
                        <input
                          id="input-manual-equity"
                          type="number"
                          min={0}
                          step={1000}
                          value={workspaceState.financingAssumptions.manualFounderEquity}
                          onChange={(e) =>
                            updateFinancingField('manualFounderEquity', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-3 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="input-honor-loan"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Prêt d’honneur 0% (€)
                        </label>
                        <input
                          id="input-honor-loan"
                          type="number"
                          min={0}
                          step={1000}
                          value={workspaceState.financingAssumptions.honorLoanZeroRate}
                          onChange={(e) =>
                            updateFinancingField('honorLoanZeroRate', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-3 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="input-grants"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Subventions / Aides (€)
                        </label>
                        <input
                          id="input-grants"
                          type="number"
                          min={0}
                          step={1000}
                          value={workspaceState.financingAssumptions.grantsAndSubsidies}
                          onChange={(e) =>
                            updateFinancingField('grantsAndSubsidies', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-3 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="input-bank-principal"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Emprunt bancaire (€)
                        </label>
                        <input
                          id="input-bank-principal"
                          type="number"
                          min={0}
                          step={5000}
                          value={workspaceState.financingAssumptions.bankLoanPrincipal}
                          onChange={(e) =>
                            updateFinancingField('bankLoanPrincipal', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-3 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <label
                          htmlFor="input-loan-rate"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Taux nominal (%)
                        </label>
                        <input
                          id="input-loan-rate"
                          type="number"
                          min={0}
                          max={15}
                          step={0.05}
                          value={workspaceState.financingAssumptions.annualInterestRatePercent}
                          onChange={(e) =>
                            updateFinancingField(
                              'annualInterestRatePercent',
                              Number(e.target.value)
                            )
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-2.5 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="input-insurance-rate"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Assurance (%/an)
                        </label>
                        <input
                          id="input-insurance-rate"
                          type="number"
                          min={0}
                          max={3}
                          step={0.02}
                          value={workspaceState.financingAssumptions.annualInsuranceRatePercent}
                          onChange={(e) =>
                            updateFinancingField(
                              'annualInsuranceRatePercent',
                              Number(e.target.value)
                            )
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-2.5 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="input-loan-years"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Durée (années)
                        </label>
                        <input
                          id="input-loan-years"
                          type="number"
                          min={1}
                          max={15}
                          value={workspaceState.financingAssumptions.loanDurationYears}
                          onChange={(e) =>
                            updateFinancingField('loanDurationYears', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-2.5 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="input-grace-months"
                          className="block text-xs font-medium text-living-ink"
                        >
                          Différé (mois)
                        </label>
                        <input
                          id="input-grace-months"
                          type="number"
                          min={0}
                          max={24}
                          value={workspaceState.financingAssumptions.gracePeriodMonths}
                          onChange={(e) =>
                            updateFinancingField('gracePeriodMonths', Number(e.target.value))
                          }
                          className="mt-1 w-full rounded border border-living-border bg-white px-2.5 py-1.5 font-mono text-xs tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium">
                        <label htmlFor="input-monthly-ebitda">
                          EBE / EBITDA mensuel hypothétique en croisière (pour test DSCR)
                        </label>
                        <span className="font-mono tabular-nums">
                          {formatEur(workspaceState.financingAssumptions.hypotheticalMonthlyEbitda)}
                          /mois
                        </span>
                      </div>
                      <input
                        id="input-monthly-ebitda"
                        type="range"
                        min={2000}
                        max={20000}
                        step={200}
                        value={workspaceState.financingAssumptions.hypotheticalMonthlyEbitda}
                        onChange={(e) =>
                          updateFinancingField('hypotheticalMonthlyEbitda', Number(e.target.value))
                        }
                        className="mt-1.5 w-full"
                      />
                    </div>
                  </div>

                  {/* Carte de diagnostic du Funding Gap & Service de la Dette */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div
                      className={`rounded-xl border p-5 ${
                        fundingAndLoanResult.fundingGap > 0
                          ? 'border-[#9F2F2D]/30 bg-[#FDEBEC]'
                          : 'border-[#346538]/30 bg-[#EDF3EC]'
                      }`}
                    >
                      <div className="font-mono text-[11px] uppercase tracking-wider">
                        Diagnostic Écart de Financement (Funding Gap)
                      </div>
                      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
                        {fundingAndLoanResult.fundingGap > 0
                          ? `Déficit : ${formatEur(fundingAndLoanResult.fundingGap)}`
                          : `Coussin : +${formatEur(fundingAndLoanResult.netFundingBalance)}`}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed">
                        Ressources mobilisées :{' '}
                        <strong>{formatEur(fundingAndLoanResult.totalAvailableFunding)}</strong>{' '}
                        pour <strong>{formatEur(fundingAndLoanResult.totalProjectCost)}</strong>{' '}
                        d’emplois. Ratio de quasi-fonds propres :{' '}
                        <strong>{fundingAndLoanResult.equityRatioPercent}%</strong> (cible bancaire
                        Paris &ge; 28%).
                      </p>
                    </div>

                    <div className="rounded-xl border border-living-border bg-living-bg p-5">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#787774]">
                        Service de la Dette & Couverture (DSCR)
                      </div>
                      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-living-ink">
                        {formatEurPrecise(
                          fundingAndLoanResult.loanSummary.totalMonthlyDebtServiceAmortizing
                        )}
                        <span className="text-xs font-normal text-[#5C554E]"> /mois</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-[#5C554E]">
                        <div>
                          Coût total des intérêts + assurance :{' '}
                          <strong className="font-mono text-living-ink">
                            {formatEur(fundingAndLoanResult.loanSummary.totalCreditCost)}
                          </strong>
                        </div>
                        <div>
                          Ratio DSCR estimé :{' '}
                          <strong className="font-mono text-living-ink">
                            {fundingAndLoanResult.loanSummary.dscrEstimate}x
                          </strong>{' '}
                          (EBE min. prudent 1.3x :{' '}
                          {formatEur(
                            fundingAndLoanResult.loanSummary.requiredMonthlyEbitdaForSafeDscr
                          )}
                          /mois)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau d'Amortissement Complet (Annuel ou Mensuel) */}
              <div className="mt-8 border-t border-living-border pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-lg font-normal text-living-ink">
                      Tableau d’Amortissement de l’Emprunt Bancaire
                    </h4>
                    <p className="text-xs text-[#5C554E]">
                      Capital : {formatEur(fundingAndLoanResult.loanSummary.principal)} sur{' '}
                      {fundingAndLoanResult.loanSummary.totalMonths} mois (dont{' '}
                      {fundingAndLoanResult.loanSummary.gracePeriodMonths} mois de différé partiel)
                    </p>
                  </div>
                  <div className="inline-flex rounded-md border border-living-border bg-living-bg p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setAmortizationViewMode('yearly')}
                      className={`rounded px-3 py-1 font-mono transition ${
                        amortizationViewMode === 'yearly'
                          ? 'bg-living-ink text-white'
                          : 'text-living-ink hover:bg-living-muted'
                      }`}
                    >
                      Synthèse Annuelle ({fundingAndLoanResult.yearlySchedule.length} ans)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmortizationViewMode('monthly')}
                      className={`rounded px-3 py-1 font-mono transition ${
                        amortizationViewMode === 'monthly'
                          ? 'bg-living-ink text-white'
                          : 'text-living-ink hover:bg-living-muted'
                      }`}
                    >
                      Échéancier Mensuel ({fundingAndLoanResult.monthlySchedule.length} mois)
                    </button>
                  </div>
                </div>

                <div className="mt-4 max-h-80 overflow-x-auto overflow-y-auto rounded-lg border border-living-border">
                  {amortizationViewMode === 'yearly' ? (
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-living-muted text-[10px] uppercase text-[#5C554E]">
                        <tr>
                          <th className="px-4 py-2.5">Année</th>
                          <th className="px-4 py-2.5">Capital Début</th>
                          <th className="px-4 py-2.5">Capital Amorti</th>
                          <th className="px-4 py-2.5">Intérêts</th>
                          <th className="px-4 py-2.5">Assurance</th>
                          <th className="px-4 py-2.5">Sortie Totale</th>
                          <th className="px-4 py-2.5 text-right">Capital Restant Dû</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-living-border bg-white">
                        {fundingAndLoanResult.yearlySchedule.map((yr) => (
                          <tr key={yr.year} className="hover:bg-living-bg/60">
                            <td className="px-4 py-2.5 font-semibold">Année {yr.year}</td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatEurPrecise(yr.beginningBalance)}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatEurPrecise(yr.totalPrincipalPaid)}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatEurPrecise(yr.totalInterestPaid)}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatEurPrecise(yr.totalInsurancePaid)}
                            </td>
                            <td className="px-4 py-2.5 font-medium tabular-nums">
                              {formatEurPrecise(yr.totalOutflow)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                              {formatEurPrecise(yr.endingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-living-muted text-[10px] uppercase text-[#5C554E]">
                        <tr>
                          <th className="px-3 py-2">Mois</th>
                          <th className="px-3 py-2">Statut</th>
                          <th className="px-3 py-2">Capital Début</th>
                          <th className="px-3 py-2">Capital Amorti</th>
                          <th className="px-3 py-2">Intérêts</th>
                          <th className="px-3 py-2">Assurance</th>
                          <th className="px-3 py-2">Mensualité Totale</th>
                          <th className="px-3 py-2 text-right">Capital Fin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-living-border bg-white">
                        {fundingAndLoanResult.monthlySchedule.map((m) => (
                          <tr key={m.month} className="hover:bg-living-bg/60">
                            <td className="px-3 py-2 font-semibold">M{m.month}</td>
                            <td className="px-3 py-2">
                              {m.isGracePeriod ? (
                                <span className="rounded bg-[#FBF3DB] px-1.5 py-0.5 text-[10px] text-[#956400]">
                                  Différé
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#5C554E]">Amort.</span>
                              )}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatEurPrecise(m.beginningBalance)}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatEurPrecise(m.principalPaid)}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatEurPrecise(m.interestPaid)}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatEurPrecise(m.insurancePaid)}
                            </td>
                            <td className="px-3 py-2 font-medium tabular-nums">
                              {formatEurPrecise(m.totalMonthlyOutflow)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">
                              {formatEurPrecise(m.endingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODULE 03 : RECHERCHE & RÉGLEMENTATION PARISIENNE                 */}
        {/* ================================================================= */}
        {activeModule === 'research' && (
          <div className="space-y-8 fade-enter">
            <div className="rounded-xl border border-[#1F6C9F]/30 bg-[#E1F3FE] p-4 text-xs text-[#1F6C9F]">
              <strong className="font-mono uppercase tracking-wider">
                Politique d’Intégrité Documentaire — Zéro Établissement ou Article Fabriqué :
              </strong>{' '}
              Conformément à la charte Project Living Room, ce module ne contient aucun faux article
              de presse ni établissement fictif présenté comme enquête terrain. Il structure les
              exigences réglementaires réelles à Paris et vos propres protocoles d’observation.
            </div>

            {/* Matrice réglementaire Paris */}
            <section className="rounded-xl border border-living-border bg-white p-6 sm:p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                Conformité Administrative & Technique Paris
              </span>
              <h3 className="mt-1 font-serif text-2xl font-normal text-living-ink">
                Les 4 Piliers Réglementaires d’un Lieu Hybride Laverie + Café + Listening Bar
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {REGULATORY_FRAMEWORK_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-living-border bg-living-bg p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                        {item.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          item.riskLevel === 'Critique'
                            ? 'bg-[#FDEBEC] text-[#9F2F2D]'
                            : 'bg-[#FBF3DB] text-[#956400]'
                        }`}
                      >
                        Risque {item.riskLevel}
                      </span>
                    </div>
                    <h4 className="mt-2 font-serif text-lg font-normal text-living-ink">
                      {item.title}
                    </h4>
                    <p className="mt-1 font-mono text-[11px] text-[#5C554E]">
                      Autorité : {item.authority}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-living-ink">
                      {item.requirementSummary}
                    </p>
                    <div className="mt-3 border-t border-living-border pt-2.5 text-xs text-[#5C554E]">
                      <strong>Vérification :</strong> {item.verificationMethod}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Journal des protocoles et relevés terrain du fondateur */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-living-border bg-white p-6 lg:col-span-7">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Protocoles d’Enquête Terrain & Relevés Fondateurs
                </h3>
                <p className="mt-1 text-xs text-[#5C554E]">
                  Cliquez sur le badge de statut d’un protocole pour faire évoluer son avancement.
                </p>
                <div className="mt-5 space-y-4">
                  {workspaceState.researchNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-living-border bg-living-bg p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#787774]">
                          {note.axis} · {note.date}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCycleResearchStatus(note.id)}
                          className="rounded-full border border-living-border bg-white px-2.5 py-0.5 font-mono text-[11px] text-living-ink hover:bg-living-muted"
                        >
                          {note.status} ↻
                        </button>
                      </div>
                      <h4 className="mt-2 font-medium text-sm text-living-ink">{note.title}</h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#5C554E]">
                        {note.hypothesisTested}
                      </p>
                      <p className="mt-2 border-t border-living-border pt-2 font-mono text-[11px] text-[#5C554E]">
                        Méthode : {note.methodologyNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-living-border bg-white p-6 lg:col-span-5">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Consigner une Note de Recherche Réelle
                </h3>
                <p className="mt-1 text-xs text-[#5C554E]">
                  Ajoutez vos observations de terrain vérifiées (sauvegardées localement).
                </p>
                <form onSubmit={handleAddResearchNote} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label htmlFor="res-axis" className="block font-medium text-living-ink">
                      Axe d’analyse
                    </label>
                    <select
                      id="res-axis"
                      value={newResearchAxis}
                      onChange={(e) =>
                        setNewResearchAxis(e.target.value as ResearchFieldNote['axis'])
                      }
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    >
                      <option value="Modèle Laverie">Modèle Laverie</option>
                      <option value="Café de Spécialité">Café de Spécialité</option>
                      <option value="Listening Bar & Audio">Listening Bar & Audio</option>
                      <option value="Juridique & Urbain">Juridique & Urbain</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="res-title" className="block font-medium text-living-ink">
                      Titre du protocole ou du relevé
                    </label>
                    <input
                      id="res-title"
                      type="text"
                      required
                      placeholder="Ex: Relevé acoustique fournisseur pompes à chaleur"
                      value={newResearchTitle}
                      onChange={(e) => setNewResearchTitle(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-hyp" className="block font-medium text-living-ink">
                      Hypothèse testée / Observation factuelle
                    </label>
                    <textarea
                      id="res-hyp"
                      rows={3}
                      required
                      placeholder="Décrivez l’hypothèse ou la mesure observée..."
                      value={newResearchHypothesis}
                      onChange={(e) => setNewResearchHypothesis(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-method" className="block font-medium text-living-ink">
                      Protocole / Source de vérification
                    </label>
                    <input
                      id="res-method"
                      type="text"
                      placeholder="Ex: Devis technique fabricant / Visite sur site"
                      value={newResearchMethodology}
                      onChange={(e) => setNewResearchMethodology(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded bg-living-ink px-4 py-2.5 font-medium text-white transition hover:bg-living-espresso"
                  >
                    Enregistrer dans le Journal Local
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODULE 04 : IMMOBILIER & CAHIER DES CHARGES LOCAL                 */}
        {/* ================================================================= */}
        {activeModule === 'property' && (
          <div className="space-y-8 fade-enter">
            {/* Grille technique obligatoire */}
            <section className="rounded-xl border border-living-border bg-white p-6 sm:p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                Cahier des Charges Technique · Paris Rive Droite (10e, 11e, 18e, 19e, 20e)
              </span>
              <h3 className="mt-1 font-serif text-2xl font-normal text-living-ink">
                Critères Physiques & Juridiques Non-Négociables du Local
              </h3>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-living-border bg-living-muted font-mono text-[10px] uppercase text-[#5C554E]">
                    <tr>
                      <th className="p-3">Critère Technique</th>
                      <th className="p-3">Spécification Cible</th>
                      <th className="p-3">Seuil Éliminatoire</th>
                      <th className="p-3">Poids</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-living-border">
                    {PROPERTY_TECHNICAL_SPECS.map((spec) => (
                      <tr key={spec.id}>
                        <td className="p-3 font-medium text-living-ink">
                          {spec.criterion}
                          <div className="mt-0.5 text-[11px] font-normal text-[#5C554E]">
                            {spec.technicalRationale}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-living-ink">{spec.targetSpec}</td>
                        <td className="p-3 font-mono text-[#9F2F2D]">
                          {spec.eliminationThreshold}
                        </td>
                        <td className="p-3 font-mono font-semibold">{spec.weightPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Évaluateur interactif de locaux candidats */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Simulateur de Compatibilité des Locaux (Gabarits & Visites)
                </h3>
                <p className="text-xs text-[#5C554E]">
                  Activez ou désactivez les prérequis techniques sur chaque fiche pour recalculer
                  instantanément le score de compatibilité sur 100.
                </p>

                {workspaceState.propertyEvaluations.map((prop) => {
                  const scoreRes = calculatePropertyCompatibilityScore(prop);
                  return (
                    <div
                      key={prop.id}
                      className="rounded-xl border border-living-border bg-white p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-[#787774]">
                              {prop.targetZone}
                            </span>
                            {prop.isHypotheticalTemplate && (
                              <span className="rounded bg-[#FBF3DB] px-2 py-0.5 font-mono text-[10px] uppercase text-[#956400]">
                                Gabarit Hypothétique
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 font-serif text-lg font-normal text-living-ink">
                            {prop.label}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                              scoreRes.verdict === 'Compatible'
                                ? 'bg-[#EDF3EC] text-[#346538]'
                                : scoreRes.verdict === 'Sous réserve technique'
                                  ? 'bg-[#FBF3DB] text-[#956400]'
                                  : 'bg-[#FDEBEC] text-[#9F2F2D]'
                            }`}
                          >
                            {scoreRes.scoreOutOf100}/100 · {scoreRes.verdict}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-living-bg p-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-[#787774]">Surface</span>
                          <div className="font-semibold">{prop.surfaceSqm} m²</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#787774]">Loyer HC / mois</span>
                          <div className="font-semibold">
                            {formatEur(prop.monthlyRentExclCharges)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#787774]">Droit au bail</span>
                          <div className="font-semibold">{formatEur(prop.leaseAssignmentCost)}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                        <button
                          type="button"
                          onClick={() => handleTogglePropertyCheck(prop.id, 'hasConcreteSlab')}
                          className={`rounded border px-2.5 py-1.5 font-mono text-[11px] text-left transition ${
                            prop.hasConcreteSlab
                              ? 'border-[#346538]/40 bg-[#EDF3EC] text-[#346538]'
                              : 'border-[#9F2F2D]/40 bg-[#FDEBEC] text-[#9F2F2D]'
                          }`}
                        >
                          {prop.hasConcreteSlab ? '[OK] Dalle béton' : '[NON] Dalle béton'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePropertyCheck(prop.id, 'hasThreePhasePower')}
                          className={`rounded border px-2.5 py-1.5 font-mono text-[11px] text-left transition ${
                            prop.hasThreePhasePower
                              ? 'border-[#346538]/40 bg-[#EDF3EC] text-[#346538]'
                              : 'border-[#9F2F2D]/40 bg-[#FDEBEC] text-[#9F2F2D]'
                          }`}
                        >
                          {prop.hasThreePhasePower ? '[OK] Triphasé 36kVA+' : '[NON] Triphasé'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePropertyCheck(prop.id, 'hasBarLicenseAllowed')}
                          className={`rounded border px-2.5 py-1.5 font-mono text-[11px] text-left transition ${
                            prop.hasBarLicenseAllowed
                              ? 'border-[#346538]/40 bg-[#EDF3EC] text-[#346538]'
                              : 'border-[#9F2F2D]/40 bg-[#FDEBEC] text-[#9F2F2D]'
                          }`}
                        >
                          {prop.hasBarLicenseAllowed ? '[OK] Clause Bar/Lic.IV' : '[NON] Clause Bar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePropertyCheck(prop.id, 'hasAdequateFacade')}
                          className={`rounded border px-2.5 py-1.5 font-mono text-[11px] text-left transition ${
                            prop.hasAdequateFacade
                              ? 'border-[#346538]/40 bg-[#EDF3EC] text-[#346538]'
                              : 'border-living-border bg-living-bg text-[#5C554E]'
                          }`}
                        >
                          {prop.hasAdequateFacade ? '[OK] Vitrine >= 7m' : '[NON] Vitrine < 7m'}
                        </button>
                      </div>

                      {scoreRes.blockers.length > 0 && (
                        <ul className="mt-3 space-y-1 border-t border-living-border pt-2.5 text-xs text-[#9F2F2D]">
                          {scoreRes.blockers.map((b, i) => (
                            <li key={i}>• Point de blocage : {b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Formulaire d'ajout d'un local visité */}
              <div className="rounded-xl border border-living-border bg-white p-6 lg:col-span-5 self-start">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Évaluer un Nouveau Local Candidat
                </h3>
                <p className="mt-1 text-xs text-[#5C554E]">
                  Saisissez les caractéristiques d’un local réel lors de vos visites à Paris.
                </p>
                <form onSubmit={handleAddPropertyCandidate} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label htmlFor="prop-label" className="block font-medium text-living-ink">
                      Identification du local / Rue
                    </label>
                    <input
                      id="prop-label"
                      type="text"
                      required
                      placeholder="Ex: Local commercial 118 m² — Secteur Oberkampf"
                      value={newPropLabel}
                      onChange={(e) => setNewPropLabel(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prop-zone" className="block font-medium text-living-ink">
                        Arrondissement / Zone
                      </label>
                      <input
                        id="prop-zone"
                        type="text"
                        value={newPropZone}
                        onChange={(e) => setNewPropZone(e.target.value)}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-surface" className="block font-medium text-living-ink">
                        Surface totale (m²)
                      </label>
                      <input
                        id="prop-surface"
                        type="number"
                        min={30}
                        value={newPropSurface}
                        onChange={(e) => setNewPropSurface(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="prop-rent" className="block font-medium text-living-ink">
                        Loyer mensuel HC (€)
                      </label>
                      <input
                        id="prop-rent"
                        type="number"
                        min={0}
                        step={100}
                        value={newPropRent}
                        onChange={(e) => setNewPropRent(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="prop-dab" className="block font-medium text-living-ink">
                        Droit au bail demandé (€)
                      </label>
                      <input
                        id="prop-dab"
                        type="number"
                        min={0}
                        step={5000}
                        value={newPropDab}
                        onChange={(e) => setNewPropDab(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPropSlab}
                        onChange={(e) => setNewPropSlab(e.target.checked)}
                      />
                      <span>Dalle béton pleine permettant désolidarisation acoustique</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPropPower}
                        onChange={(e) => setNewPropPower(e.target.checked)}
                      />
                      <span>Puissance électrique Triphasée 36-60 kVA + évacuation EU 100mm</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPropLicense}
                        onChange={(e) => setNewPropLicense(e.target.checked)}
                      />
                      <span>Bail & copropriété autorisant Bar / Licence IV</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPropFacade}
                        onChange={(e) => setNewPropFacade(e.target.checked)}
                      />
                      <span>Linéaire façade vitrine &ge; 7 mètres</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded bg-living-ink px-4 py-2.5 font-medium text-white transition hover:bg-living-espresso"
                  >
                    Calculer le Score & Enregistrer la Fiche
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODULE 05 : IDEA LAB & ARCHITECTURE D'EXPÉRIENCE                  */}
        {/* ================================================================= */}
        {activeModule === 'idealab' && (
          <div className="space-y-8 fade-enter">
            {/* Chorégraphie Diurne / Nocturne */}
            <section className="rounded-xl border border-living-border bg-white p-6 sm:p-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                Chorégraphie Spatiale, Sonore & Opérationnelle
              </span>
              <h3 className="mt-1 font-serif text-2xl font-normal text-living-ink">
                Les 3 Séquences Quotidiennes de Project Living Room
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {IDEA_LAB_DAY_NIGHT_MODES.map((mode) => (
                  <div
                    key={mode.id}
                    className="flex flex-col justify-between rounded-xl border border-living-border bg-living-bg p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-living-ink px-2.5 py-0.5 font-mono text-xs text-white">
                          {mode.timeSlot}
                        </span>
                        <span className="font-mono text-xs text-[#346538]">
                          Marge brute cible ~{mode.targetMarginPercent}%
                        </span>
                      </div>
                      <h4 className="mt-3 font-serif text-lg font-normal text-living-ink">
                        {mode.modeName}
                      </h4>
                      <ul className="mt-3 space-y-1.5 text-xs text-[#5C554E]">
                        {mode.primaryRevenueDrivers.map((drv, idx) => (
                          <li key={idx}>• {drv}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5 space-y-2 border-t border-living-border pt-3 text-xs">
                      <div>
                        <strong className="font-mono text-[11px] uppercase text-living-ink">
                          Signature Acoustique :
                        </strong>
                        <p className="text-[#5C554E]">{mode.acousticAtmosphere}</p>
                      </div>
                      <div>
                        <strong className="font-mono text-[11px] uppercase text-living-ink">
                          Synergie Opérationnelle :
                        </strong>
                        <p className="text-[#5C554E]">{mode.operationalSynergy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Matrice d'idées et d'expérimentations fondateurs */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Registre des Dispositifs Conceptuels & Techniques
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {workspaceState.founderIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="rounded-xl border border-living-border bg-white p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs uppercase tracking-wider text-[#787774]">
                          {idea.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCycleIdeaStatus(idea.id)}
                          className={`rounded-full px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                            idea.status === 'Retenu MVP'
                              ? 'bg-[#EDF3EC] text-[#346538]'
                              : idea.status === 'À prototyper'
                                ? 'bg-[#FBF3DB] text-[#956400]'
                                : 'bg-living-muted text-living-ink'
                          }`}
                        >
                          {idea.status} ↻
                        </button>
                      </div>
                      <h4 className="mt-2 font-serif text-lg font-normal text-living-ink">
                        {idea.title}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#5C554E]">
                        {idea.description}
                      </p>
                      <div className="mt-3 flex items-center gap-4 border-t border-living-border pt-2.5 font-mono text-xs">
                        <span>Impact Expérience : {idea.impactScore}/5</span>
                        <span>Faisabilité Technique : {idea.feasibilityScore}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-living-border bg-white p-6 lg:col-span-5 self-start">
                <h3 className="font-serif text-xl font-normal text-living-ink">
                  Tester une Nouvelle Idée dans l’Idea Lab
                </h3>
                <form onSubmit={handleAddFounderIdea} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label htmlFor="idea-cat" className="block font-medium text-living-ink">
                      Catégorie
                    </label>
                    <select
                      id="idea-cat"
                      value={newIdeaCategory}
                      onChange={(e) =>
                        setNewIdeaCategory(e.target.value as FounderIdeaNote['category'])
                      }
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    >
                      <option value="Expérience Client">Expérience Client</option>
                      <option value="Design & Acoustique">Design & Acoustique</option>
                      <option value="Carte & Boissons">Carte & Boissons</option>
                      <option value="Modèle Économique">Modèle Économique</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idea-title" className="block font-medium text-living-ink">
                      Intitulé de l’idée
                    </label>
                    <input
                      id="idea-title"
                      type="text"
                      required
                      placeholder="Ex: Abonnement mensuel lavage + café illimité heures creuses"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="idea-desc" className="block font-medium text-living-ink">
                      Mécanique opérationnelle & bénéfice attendu
                    </label>
                    <textarea
                      id="idea-desc"
                      rows={3}
                      required
                      placeholder="Décrivez le fonctionnement concret..."
                      value={newIdeaDesc}
                      onChange={(e) => setNewIdeaDesc(e.target.value)}
                      className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="idea-impact" className="block font-medium text-living-ink">
                        Score Impact (/5)
                      </label>
                      <input
                        id="idea-impact"
                        type="number"
                        min={1}
                        max={5}
                        value={newIdeaImpact}
                        onChange={(e) => setNewIdeaImpact(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="idea-feas" className="block font-medium text-living-ink">
                        Score Faisabilité (/5)
                      </label>
                      <input
                        id="idea-feas"
                        type="number"
                        min={1}
                        max={5}
                        value={newIdeaFeasibility}
                        onChange={(e) => setNewIdeaFeasibility(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-living-border bg-living-bg px-3 py-2 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded bg-living-ink px-4 py-2.5 font-medium text-white transition hover:bg-living-espresso"
                  >
                    Ajouter à l’Idea Lab
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODULE 06 : FEUILLE DE ROUTE (ROADMAP DÉCEMBRE 2027)              */}
        {/* ================================================================= */}
        {activeModule === 'roadmap' && (
          <div className="space-y-6 fade-enter">
            <div className="rounded-xl border border-living-border bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-living-border pb-5">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#787774]">
                    Rétroplanning Exécutif · T4 2026 → Décembre 2027
                  </span>
                  <h3 className="mt-1 font-serif text-2xl font-normal text-living-ink">
                    Séquencement des 5 Portes de Décision (Decision Gates)
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#5C554E]">
                  Cliquez sur le statut d’une phase pour mettre à jour sa progression
                </span>
              </div>

              <div className="mt-6 space-y-6">
                {workspaceState.roadmapMilestones.map((ms, idx) => (
                  <div
                    key={ms.id}
                    className="rounded-xl border border-living-border bg-living-bg p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-living-ink px-2.5 py-1 font-mono text-xs text-white">
                          {ms.quarter}
                        </span>
                        <span className="font-mono text-xs text-[#787774]">
                          Étape 0{idx + 1} · {ms.targetDate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCycleRoadmapStatus(ms.id)}
                        className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider ${
                          ms.status === 'Terminé'
                            ? 'bg-[#EDF3EC] text-[#346538]'
                            : ms.status === 'En cours'
                              ? 'bg-[#FBF3DB] text-[#956400]'
                              : 'bg-white text-[#5C554E] border border-living-border'
                        }`}
                      >
                        {ms.status} ↻
                      </button>
                    </div>

                    <h4 className="mt-3 font-serif text-lg font-normal text-living-ink">
                      {ms.phaseTitle}
                    </h4>

                    <ul className="mt-3 space-y-1.5 text-xs text-[#5C554E]">
                      {ms.deliverables.map((deliv, dIdx) => (
                        <li key={dIdx}>• {deliv}</li>
                      ))}
                    </ul>

                    <div className="mt-4 rounded-lg border border-living-border bg-white p-3 font-mono text-xs text-living-ink">
                      <strong>Critère de passage :</strong> {ms.decisionGate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page minimaliste */}
      <footer className="mt-12 border-t border-living-border bg-white px-4 py-6 text-xs text-[#787774]">
        <div className="mx-auto max-w-7xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong>Project Living Room</strong> — Cockpit Fondateur Privé · Cible Ouverture Paris
            Décembre 2027
          </div>
          <div className="font-mono text-[11px]">
            Hypothèses financières modifiables · Stockage local navigateur · Non destiné au public
          </div>
        </div>
      </footer>
    </div>
  );
}
