import type {
  SavingsAssumptions,
  ProjectCapexAssumptions,
  ProjectFinancingAssumptions,
} from './finance';

export type WorkspaceModuleId =
  | 'dashboard'
  | 'finance'
  | 'research'
  | 'property'
  | 'idealab'
  | 'roadmap';

export interface ModuleDefinition {
  id: WorkspaceModuleId;
  code: string;
  label: string;
  shortLabel: string;
  subtitle: string;
  statusBadge: string;
}

export const WORKSPACE_MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    code: 'MOD-01',
    label: 'Tableau de Bord',
    shortLabel: 'Cockpit',
    subtitle: 'Vue d’ensemble du prototype MVP, synthèse des simulateurs et statut honnête du projet',
    statusBadge: 'Prototype MVP',
  },
  {
    id: 'finance',
    code: 'MOD-02',
    label: 'Finance & Simulateurs',
    shortLabel: 'Simulateurs',
    subtitle: 'Simulateurs d’épargne, plan de financement, Funding Gap et amortissement (valeurs d’exemple neutres)',
    statusBadge: 'Placeholders Modifiables',
  },
  {
    id: 'research',
    code: 'MOD-03',
    label: 'Questions & Vérifications',
    shortLabel: 'Recherche',
    subtitle: 'Questions juridiques et techniques à valider avec des professionnels (aucune conclusion juridique affirmée)',
    statusBadge: 'Checklist à Valider',
  },
  {
    id: 'property',
    code: 'MOD-04',
    label: 'Immobilier & Local',
    shortLabel: 'Immobilier',
    subtitle: 'Grille de visite indicative et questions techniques à poser lors de la prospection de locaux',
    statusBadge: 'Grille Indicative',
  },
  {
    id: 'idealab',
    code: 'MOD-05',
    label: 'Idea Lab & Concept',
    shortLabel: 'Idea Lab',
    subtitle: 'Hypothèses d’organisation Jour/Nuit et carnet d’idées à tester (sans prévisions chiffrées)',
    statusBadge: 'Atelier Conceptuel',
  },
  {
    id: 'roadmap',
    code: 'MOD-06',
    label: 'Feuille de Route 2027',
    shortLabel: 'Roadmap',
    subtitle: 'Étapes indicatives vers Décembre 2027 et journal de progression locale',
    statusBadge: 'Cible Déc. 2027',
  },
];

/**
 * Exemples fictifs neutres (Placeholders) — Ne contiennent aucune donnée personnelle
 * (ni salaire, ni loyer personnel) et ne constituent pas une prévision financière.
 */
export const DEFAULT_SAVINGS_ASSUMPTIONS: SavingsAssumptions = {
  initialSavings: 20000,
  monthlyContribution: 1000,
  monthsToTarget: 24,
  annualYieldPercent: 2.0,
  exceptionalContribution: 0,
  exceptionalContributionMonth: 12,
  targetFounderEquity: 45000,
};

export const ZERO_SAVINGS_ASSUMPTIONS: SavingsAssumptions = {
  initialSavings: 0,
  monthlyContribution: 0,
  monthsToTarget: 24,
  annualYieldPercent: 0,
  exceptionalContribution: 0,
  exceptionalContributionMonth: 12,
  targetFounderEquity: 0,
};

export const DEFAULT_CAPEX_ASSUMPTIONS: ProjectCapexAssumptions = {
  leaseAcquisition: 40000,
  renovationAcoustics: 80000,
  laundryEquipment: 50000,
  coffeeBarEquipment: 25000,
  hiFiSoundSystem: 15000,
  legalLicensingArch: 15000,
  workingCapitalReserve: 25000,
};

export const ZERO_CAPEX_ASSUMPTIONS: ProjectCapexAssumptions = {
  leaseAcquisition: 0,
  renovationAcoustics: 0,
  laundryEquipment: 0,
  coffeeBarEquipment: 0,
  hiFiSoundSystem: 0,
  legalLicensingArch: 0,
  workingCapitalReserve: 0,
};

export const DEFAULT_FINANCING_ASSUMPTIONS: ProjectFinancingAssumptions = {
  syncFounderEquityFromSavings: true,
  manualFounderEquity: 45000,
  honorLoanZeroRate: 15000,
  grantsAndSubsidies: 0,
  bankLoanPrincipal: 185000,
  annualInterestRatePercent: 4.0,
  annualInsuranceRatePercent: 0.35,
  loanDurationYears: 7,
  gracePeriodMonths: 0,
  hypotheticalMonthlyEbitda: 0,
};

export const ZERO_FINANCING_ASSUMPTIONS: ProjectFinancingAssumptions = {
  syncFounderEquityFromSavings: false,
  manualFounderEquity: 0,
  honorLoanZeroRate: 0,
  grantsAndSubsidies: 0,
  bankLoanPrincipal: 0,
  annualInterestRatePercent: 4.0,
  annualInsuranceRatePercent: 0.35,
  loanDurationYears: 7,
  gracePeriodMonths: 0,
  hypotheticalMonthlyEbitda: 0,
};

export interface RegulatoryCheckItem {
  id: string;
  category:
    | 'Acoustique & Voisinage'
    | 'Licences & Débit de Boissons'
    | 'Laverie & Hygiène'
    | 'Urbanisme & ERP';
  title: string;
  whoToConsult: string;
  questionsToValidate: string[];
  verificationStatus: string;
  officialSourceUrl: string | null;
  lastCheckedDate: string | null;
}

/**
 * Liste de questions pratiques à vérifier auprès de professionnels qualifiés.
 * Aucune règle juridique ni aucun seuil technique n'est présenté comme acquis sans source officielle vérifiée.
 */
export const REGULATORY_FRAMEWORK_ITEMS: RegulatoryCheckItem[] = [
  {
    id: 'reg-acoustic-questions',
    category: 'Acoustique & Voisinage',
    title: 'Quelles obligations acoustiques s’appliqueront à la diffusion musicale et aux machines ?',
    whoToConsult: 'Bureau d’études acoustiques qualifié & syndic de copropriété',
    questionsToValidate: [
      'Dans quels cas précis une étude d’impact des nuisances sonores (EINS) est-elle requise pour l’ambiance sonore envisagée en soirée ?',
      'Quelles sont les valeurs limites d’émergence applicables vis-à-vis des logements voisins et comment traiter les vibrations basse fréquence de l’essorage ?',
      'Le règlement de copropriété de l’immeuble visé comporte-t-il des clauses restrictives sur les horaires ou le bruit ?',
    ],
    verificationStatus: 'Non vérifié — À valider avec un acousticien et les textes officiels en vigueur',
    officialSourceUrl: null,
    lastCheckedDate: null,
  },
  {
    id: 'reg-licence-questions',
    category: 'Licences & Débit de Boissons',
    title: 'Quel régime de licence (Licence III, Licence IV, licence restaurant) est adapté et disponible ?',
    whoToConsult: 'Avocat spécialisé en droit des débits de boissons / Services préfectoraux ou municipaux',
    questionsToValidate: [
      'Quelles sont les règles en vigueur à Paris concernant l’achat, la mutation ou le transfert d’une Licence III ou Licence IV selon la carte des boissons retenue ?',
      'Quels sont les périmètres de protection applicables autour du local pressenti (arrêtés préfectoraux en vigueur à la date du projet) ?',
      'Quelles formations (permis d’exploitation, hygiène alimentaire) et quels délais d’instruction faut-il anticiper ?',
    ],
    verificationStatus: 'Non vérifié — À valider avec un avocat spécialisé (aucune conclusion juridique intégrée)',
    officialSourceUrl: null,
    lastCheckedDate: null,
  },
  {
    id: 'reg-laundry-questions',
    category: 'Laverie & Hygiène',
    title: 'Comment organiser la séparation fonctionnelle entre l’espace laverie et le comptoir café/bar ?',
    whoToConsult: 'Architecte commercial, bureau de contrôle technique & fournisseurs de matériel',
    questionsToValidate: [
      'Quelles dispositions sanitaires et d’agencement faut-il prévoir pour séparer le flux de linge des clients et la zone de préparation/service de boissons ?',
      'Quelles sont les solutions techniques de séchage (évacuation extérieure vs séchoirs à condensation/pompe à chaleur) autorisées par l’immeuble ?',
      'Quels sont les besoins réels en alimentation électrique, arrivée d’eau et diamètre d’évacuation selon le parc machines choisi ?',
    ],
    verificationStatus: 'Non vérifié — À valider sur plans avec architecte et bureau de contrôle',
    officialSourceUrl: null,
    lastCheckedDate: null,
  },
  {
    id: 'reg-erp-questions',
    category: 'Urbanisme & ERP',
    title: 'Quelles démarches d’urbanisme et d’accessibilité ERP seront nécessaires pour le local ?',
    whoToConsult: 'Architecte DPLG/DE & Direction de l’Urbanisme',
    questionsToConsultNote: '',
    questionsToValidate: [
      'La modification de la façade ou de l’aménagement intérieur nécessite-t-elle une Déclaration Préalable (DP) et une Autorisation de Travaux (AT) ?',
      'Quel classement ERP (catégorie, types d’activité) sera retenu pour un lieu combinant prestation de service (laverie) et consommation sur place ?',
      'Quelles sont les exigences d’accessibilité PMR et de sécurité incendie applicables à la configuration du local ?',
    ],
    verificationStatus: 'Non vérifié — À valider lors de l’étude de faisabilité architecturale',
    officialSourceUrl: null,
    lastCheckedDate: null,
  } as RegulatoryCheckItem,
];

export interface ResearchFieldNote {
  id: string;
  date: string;
  axis: 'Modèle Laverie' | 'Café de Spécialité' | 'Listening Bar & Audio' | 'Juridique & Urbain';
  title: string;
  hypothesisTested: string;
  methodologyNote: string;
  status: 'Question ouverte' | 'En cours de vérification' | 'Source vérifiée';
}

/**
 * Questions de recherche initiales — aucun établissement, article ou chiffre de marché fabriqué.
 */
export const INITIAL_RESEARCH_NOTES: ResearchFieldNote[] = [
  {
    id: 'res-proto-01',
    date: 'À planifier',
    axis: 'Modèle Laverie',
    title: 'Question terrain : quelle proportion d’utilisateurs de laverie reste sur place pendant le cycle ?',
    hypothesisTested:
      'Question à documenter : observer la durée réelle d’attente sur place et recueillir l’intérêt des usagers pour une offre de café/boisson pendant le lavage et le séchage.',
    methodologyNote:
      'Protocole suggéré : réaliser vos propres comptages horaires et entretiens qualitatifs avant de fixer une hypothèse de vente croisée dans votre business plan.',
    status: 'Question ouverte',
  },
  {
    id: 'res-proto-02',
    date: 'À planifier',
    axis: 'Listening Bar & Audio',
    title: 'Question technique : comment éviter que les cycles de lavage ne perturbent l’écoute musicale du soir ?',
    hypothesisTested:
      'Question à documenter : évaluer s’il faut restreindre les départs d’essorage en soirée ou prévoir un sas acoustique vitré entre les machines et le salon.',
    methodologyNote:
      'Protocole suggéré : demander des fiches techniques de niveau sonore aux fabricants de machines professionnelles et consulter un acousticien.',
    status: 'Question ouverte',
  },
  {
    id: 'res-proto-03',
    date: 'À planifier',
    axis: 'Café de Spécialité',
    title: 'Question opérationnelle : comment mutualiser un même comptoir entre service café diurne et bar du soir ?',
    hypothesisTested:
      'Question à documenter : lister les équipements partagés (filtration d’eau, machine à glace, plonge, réfrigération) et les besoins de rangement lors du changement d’équipe.',
    methodologyNote:
      'Protocole suggéré : tester l’implantation sur plan avec un barista et un barman expérimentés.',
    status: 'Question ouverte',
  },
];

export interface PropertyTechnicalSpec {
  id: string;
  criterion: string;
  questionToValidate: string;
  indicativePlaceholderNote: string;
  weightPercent: number;
  whoToConsult: string;
}

export const PROPERTY_TECHNICAL_SPECS: PropertyTechnicalSpec[] = [
  {
    id: 'spec-surface',
    criterion: 'Surface & Répartition des 3 Zones',
    questionToValidate:
      'La surface permet-elle de loger distinctement l’espace machines, le comptoir café/bar, les places assises et les réserves ?',
    indicativePlaceholderNote: 'Repère d’exemple dans l’outil : 85 à 120+ m² (à adapter avec votre architecte)',
    weightPercent: 15,
    whoToConsult: 'Architecte / Agenceur',
  },
  {
    id: 'spec-acoustics',
    criterion: 'Structure du Plancher & Mitoyenneté',
    questionToValidate:
      'La nature du plancher et des murs mitoyens permet-elle d’isoler les vibrations des machines et la diffusion musicale ?',
    indicativePlaceholderNote: 'Vérifier la structure réelle du bâtiment avec un bureau d’études acoustiques',
    weightPercent: 25,
    whoToConsult: 'Acousticien / Ingénieur structure',
  },
  {
    id: 'spec-power-water',
    criterion: 'Puissance Électrique, Eau & Aéraulique',
    questionToValidate:
      'La puissance électrique disponible, la pression d’eau, les évacuations et la ventilation répondent-elles au cahier des charges des équipements ?',
    indicativePlaceholderNote: 'À chiffrer sur devis avec l’installateur de blanchisserie et Enedis',
    weightPercent: 20,
    whoToConsult: 'Installateur technique / Bureau d’études fluides',
  },
  {
    id: 'spec-facade',
    criterion: 'Configuration de la Façade & Accès',
    questionToValidate:
      'La vitrine et les accès permettent-ils une bonne lisibilité en journée (laverie/café) et un accueil adapté en soirée ?',
    indicativePlaceholderNote: 'Vérifier également les règles d’accessibilité PMR et de copropriété',
    weightPercent: 15,
    whoToConsult: 'Architecte ERP',
  },
  {
    id: 'spec-lease',
    criterion: 'Destination du Bail Commercial & Règlement de Copropriété',
    questionToValidate:
      'Le bail commercial et le règlement de copropriété autorisent-ils explicitement les trois activités envisagées (laverie, café, bar) ?',
    indicativePlaceholderNote: 'Point juridique à faire auditer par un avocat avant toute offre engageante',
    weightPercent: 25,
    whoToConsult: 'Avocat en baux commerciaux',
  },
];

export interface PropertyCandidateEvaluation {
  id: string;
  label: string;
  targetZone: string;
  surfaceSqm: number;
  monthlyRentExclCharges: number;
  leaseAssignmentCost: number;
  hasConcreteSlab: boolean;
  hasThreePhasePower: boolean;
  hasBarLicenseAllowed: boolean;
  hasAdequateFacade: boolean;
  notes: string;
  isHypotheticalTemplate: boolean;
}

export const INITIAL_PROPERTY_EVALUATIONS: PropertyCandidateEvaluation[] = [
  {
    id: 'prop-template-neutral',
    label: 'Fiche Vierge d’Exemple (Placeholder Fictif — Aucune Annonce Réelle)',
    targetZone: 'Quartier à définir par le fondateur',
    surfaceSqm: 110,
    monthlyRentExclCharges: 3500,
    leaseAssignmentCost: 40000,
    hasConcreteSlab: true,
    hasThreePhasePower: true,
    hasBarLicenseAllowed: true,
    hasAdequateFacade: true,
    notes:
      'Valeurs fictives neutres servant uniquement à démontrer le fonctionnement de la grille de pointage. Remplacez-les par vos visites réelles.',
    isHypotheticalTemplate: true,
  },
];

export interface IdeaLabConceptPillar {
  id: string;
  timeSlot: string;
  modeName: string;
  primaryRevenueDrivers: string[];
  acousticAtmosphere: string;
  operationalSynergy: string;
  openQuestionToValidate: string;
}

export const IDEA_LAB_DAY_NIGHT_MODES: IdeaLabConceptPillar[] = [
  {
    id: 'mode-morning',
    timeSlot: 'Matin (Plage indicative)',
    modeName: 'Séquence I — Laverie & Coffee Shop',
    primaryRevenueDrivers: [
      'Service de lavage et séchage en libre-service assisté',
      'Boissons chaudes (espresso, filtre) et offre matinale simple sans cuisson lourde',
      'Espace d’attente confortable avec tables et prises électriques',
    ],
    acousticAtmosphere: 'Ambiance sonore calme adaptée à la lecture et au travail matinal.',
    operationalSynergy:
      'Hypothèse d’organisation : étudier la supervision conjointe de l’accueil café et de l’espace laverie.',
    openQuestionToValidate:
      'À valider : amplitude horaire exacte d’ouverture matinale et dimensionnement du personnel.',
  },
  {
    id: 'mode-afternoon',
    timeSlot: 'Après-midi (Plage indicative)',
    modeName: 'Séquence II — Salon de Quartier & Cycles Linge',
    primaryRevenueDrivers: [
      'Rotation continue de la laverie sur les créneaux d’après-midi',
      'Boissons fraîches, infusions et écoute musicale de salon',
      'Préparation de la mise en place pour le service du soir',
    ],
    acousticAtmosphere: 'Sélection musicale modérée valorisant le confort acoustique de la salle.',
    operationalSynergy:
      'Hypothèse d’organisation : utiliser la fréquentation régulière de la laverie pour animer le lieu l’après-midi.',
    openQuestionToValidate:
      'À valider : pertinence économique d’services complémentaires (ex. dépôt/pliage) selon la demande locale.',
  },
  {
    id: 'mode-evening',
    timeSlot: 'Soirée (Plage indicative)',
    modeName: 'Séquence III — Listening Bar & Cocktails',
    primaryRevenueDrivers: [
      'Carte de cocktails, boissons avec et sans alcool, petites assiettes sans friture',
      'Programmation d’écoute haute-fidélité (vinyles / sélection musicale soignée)',
      'Gestion de la fin des cycles de laverie pour préserver le calme acoustique en soirée',
    ],
    acousticAtmosphere:
      'Écoute musicale dédiée, dans le strict respect des limites acoustiques qui seront définies par l’étude technique.',
    operationalSynergy:
      'Hypothèse d’organisation : transformation visuelle et lumineuse de l’espace d’attente en salon d’écoute.',
    openQuestionToValidate:
      'À valider : horaire du dernier cycle de lavage/essorage compatible avec l’ambiance du soir.',
  },
];

export interface FounderIdeaNote {
  id: string;
  category: 'Expérience Client' | 'Design & Acoustique' | 'Carte & Boissons' | 'Modèle Économique';
  title: string;
  description: string;
  impactScore: number; // 1..5
  feasibilityScore: number; // 1..5
  status: 'Hypothèse' | 'À prototyper' | 'Retenu MVP';
}

export const INITIAL_FOUNDER_IDEAS: FounderIdeaNote[] = [
  {
    id: 'idea-01',
    category: 'Design & Acoustique',
    title: 'Séparation vitrée et rideau occultant entre l’espace machines et le salon',
    description:
      'Piste architecturale à étudier avec un acousticien : garder une transparence visuelle en journée et occulter la zone technique le soir.',
    impactScore: 5,
    feasibilityScore: 4,
    status: 'Hypothèse',
  },
  {
    id: 'idea-02',
    category: 'Expérience Client',
    title: 'Formule couplée "Cycle de lavage + Boisson au comptoir"',
    description:
      'Piste commerciale à tester : proposer une offre combinée simple aux clients de la laverie et un signal discret de fin de cycle.',
    impactScore: 4,
    feasibilityScore: 5,
    status: 'À prototyper',
  },
  {
    id: 'idea-03',
    category: 'Carte & Boissons',
    title: 'Mutualisation des équipements de filtration et de glace entre café et bar',
    description:
      'Piste d’agencement : concevoir un linéaire de comptoir unique servant au barista en journée et au barman en soirée.',
    impactScore: 4,
    feasibilityScore: 4,
    status: 'Hypothèse',
  },
];

export interface RoadmapMilestone {
  id: string;
  quarter: string;
  phaseTitle: string;
  targetDate: string;
  deliverables: string[];
  decisionGate: string;
  status: 'Terminé' | 'En cours' | 'À venir';
}

export const INITIAL_ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'rm-phase-1',
    quarter: 'Étape 1',
    phaseTitle: 'Phase 1 — Cadrage du Concept & Premières Simulations (Prototype MVP)',
    targetDate: 'Fin 2026 (Indicatif)',
    deliverables: [
      'Mise en place des simulateurs financiers avec valeurs d’exemple modifiables',
      'Inventaire des questions juridiques, acoustiques et techniques à poser aux experts',
      'Définition des premiers critères de recherche de local',
    ],
    decisionGate: 'Jalon 1 : Remplacer les valeurs d’exemple par de premiers devis et conseils professionnels vérifiés.',
    status: 'En cours',
  },
  {
    id: 'rm-phase-2',
    quarter: 'Étape 2',
    phaseTitle: 'Phase 2 — Consultations Professionnelles & Prospection Immobilière',
    targetDate: 'S1 2027 (Indicatif)',
    deliverables: [
      'Consultation d’un avocat spécialisé (bail commercial, licence de débit de boissons)',
      'Visites de locaux avec un architecte et un bureau d’études acoustiques',
      'Chiffrage réel des équipements (laverie, café/bar, audio) auprès de fournisseurs',
    ],
    decisionGate: 'Jalon 2 : Validation technique, juridique et financière d’un local réel sous conditions suspensives.',
    status: 'À venir',
  },
  {
    id: 'rm-phase-3',
    quarter: 'Étape 3',
    phaseTitle: 'Phase 3 — Structuration Financière, Dossiers Administratifs & Bail',
    targetDate: 'Mi-2027 (Indicatif)',
    deliverables: [
      'Établissement d’un prévisionnel financier certifié avec un expert-comptable',
      'Négociation bancaire et demandes de financements complémentaires',
      'Dépôt des autorisations administratives et d’urbanisme requises',
    ],
    decisionGate: 'Jalon 3 : Obtention des financements et purge des conditions suspensives.',
    status: 'À venir',
  },
  {
    id: 'rm-phase-4',
    quarter: 'Étape 4',
    phaseTitle: 'Phase 4 — Travaux d’Aménagement, Installation Technique & Acoustique',
    targetDate: 'Automne 2027 (Indicatif)',
    deliverables: [
      'Exécution des travaux d’aménagement, d’isolation acoustique et de raccordements',
      'Installation et test des machines de laverie, du comptoir café/bar et du système audio',
      'Vérifications réglementaires et réceptions techniques avant ouverture',
    ],
    decisionGate: 'Jalon 4 : Réception conforme du chantier et validation des essais techniques.',
    status: 'À venir',
  },
  {
    id: 'rm-phase-5',
    quarter: 'Étape 5',
    phaseTitle: 'Phase 5 — Préparation Opérationnelle & Ouverture Cible',
    targetDate: 'Décembre 2027 (Cible indicative)',
    deliverables: [
      'Mise en place des opérations, fournisseurs et équipe',
      'Phase de rodage (tests en conditions réelles)',
      'Ouverture cible de Project Living Room',
    ],
    decisionGate: 'Jalon 5 : Lancement opérationnel.',
    status: 'À venir',
  },
];
