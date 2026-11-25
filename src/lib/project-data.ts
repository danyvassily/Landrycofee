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
    subtitle: 'Synthèse exécutive, jalons Décembre 2027, indicateurs financiers & gouvernance privée',
    statusBadge: 'Synthèse Live',
  },
  {
    id: 'finance',
    code: 'MOD-02',
    label: 'Finance & Simulateurs',
    shortLabel: 'Simulateurs',
    subtitle: 'Scénarios d’épargne fondateurs, plan de financement, écart (Funding Gap) & amortissement',
    statusBadge: 'Hypothèses Modifiables',
  },
  {
    id: 'research',
    code: 'MOD-03',
    label: 'Recherche & Réglementation',
    shortLabel: 'Recherche',
    subtitle: 'Cadre réglementaire parisien, grilles d’observation terrain & journal de veille vérifiée',
    statusBadge: 'Zéro Donnée Fabriquée',
  },
  {
    id: 'property',
    code: 'MOD-04',
    label: 'Immobilier & Local',
    shortLabel: 'Immobilier',
    subtitle: 'Cahier des charges technique Paris, simulateur de compatibilité & suivi des baux candidats',
    statusBadge: 'Critères Techniques',
  },
  {
    id: 'idealab',
    code: 'MOD-05',
    label: 'Idea Lab & Concept',
    shortLabel: 'Idea Lab',
    subtitle: 'Architecture d’expérience Jour/Nuit, ingénierie acoustique & expérimentations fondateurs',
    statusBadge: 'Atelier Conceptuel',
  },
  {
    id: 'roadmap',
    code: 'MOD-06',
    label: 'Feuille de Route 2027',
    shortLabel: 'Roadmap',
    subtitle: 'Séquencement opérationnel Q4 2026 – Décembre 2027, chemin critique & portes de décision',
    statusBadge: 'Cible Déc. 2027',
  },
];

/**
 * Hypothèses par défaut — clairement balisées comme HYPOTHÉTIQUES dans l'interface
 */
export const DEFAULT_SAVINGS_ASSUMPTIONS: SavingsAssumptions = {
  initialSavings: 52000,
  monthlyContribution: 3400,
  monthsToTarget: 13,
  annualYieldPercent: 2.8,
  exceptionalContribution: 12000,
  exceptionalContributionMonth: 6,
  targetFounderEquity: 110000,
};

export const DEFAULT_CAPEX_ASSUMPTIONS: ProjectCapexAssumptions = {
  leaseAcquisition: 95000,
  renovationAcoustics: 165000,
  laundryEquipment: 88000,
  coffeeBarEquipment: 48000,
  hiFiSoundSystem: 34000,
  legalLicensingArch: 28000,
  workingCapitalReserve: 42000,
};

export const DEFAULT_FINANCING_ASSUMPTIONS: ProjectFinancingAssumptions = {
  syncFounderEquityFromSavings: true,
  manualFounderEquity: 110000,
  honorLoanZeroRate: 35000,
  grantsAndSubsidies: 10000,
  bankLoanPrincipal: 345000,
  annualInterestRatePercent: 4.15,
  annualInsuranceRatePercent: 0.36,
  loanDurationYears: 7,
  gracePeriodMonths: 3,
  hypotheticalMonthlyEbitda: 8200,
};

export interface RegulatoryCheckItem {
  id: string;
  category: 'Acoustique' | 'Licence & Débit de Boissons' | 'Laverie & Technique' | 'ERP & Sécurité';
  title: string;
  authority: string;
  requirementSummary: string;
  verificationMethod: string;
  riskLevel: 'Critique' | 'Élevé' | 'Modéré';
}

export const REGULATORY_FRAMEWORK_ITEMS: RegulatoryCheckItem[] = [
  {
    id: 'reg-acoustic-eie',
    category: 'Acoustique',
    title: 'Étude d’Impact des Nuisances Sonores (EINS — Décret Bruit)',
    authority: 'Bureau d’études acoustiques agréé / Préfecture de Police de Paris',
    requirementSummary:
      'Obligatoire pour toute diffusion musicale amplifiée. Respect strict des critères d’émergence dans les logements contigus (3 dB(A) en global, 3 dB par bande d’octave de 125 Hz à 4 kHz) et pose d’un limiteur-enregistreur scellé.',
    verificationMethod: 'Mesures in situ avant et après travaux d’isolation boîte-dans-la-boîte + vibrations machines à laver.',
    riskLevel: 'Critique',
  },
  {
    id: 'reg-licence-iv',
    category: 'Licence & Débit de Boissons',
    title: 'Mutation / Transfert Licence IV & Permis d’Exploitation',
    authority: 'Préfecture de Police de Paris — Bureau des Polices Administratives',
    requirementSummary:
      'La création pure de Licence IV étant interdite à Paris, acquisition d’une licence existante par mutation/translation dans le respect des zones protégées (arrêté préfectoral distances écoles/édifices).',
    verificationMethod: 'Vérification cadastrale du périmètre de protection avant signature de promesse de bail.',
    riskLevel: 'Critique',
  },
  {
    id: 'reg-laundry-vent',
    category: 'Laverie & Technique',
    title: 'Séparation Sanitaire des Flux, Hygrométrie & Alimentation Triphasée',
    authority: 'Règlement Sanitaire Départemental de Paris (RSD) & Copropriété',
    requirementSummary:
      'Cloisonnement fonctionnel et aéraulique entre la zone de traitement du linge et l’espace de préparation/consommation alimentaire. Évacuation des buées ou recours à des séchoirs professionnels à pompe à chaleur en circuit fermé.',
    verificationMethod: 'Validation sur plans par architecte ERP et bureau de contrôle technique.',
    riskLevel: 'Élevé',
  },
  {
    id: 'reg-erp-5',
    category: 'ERP & Sécurité',
    title: 'Classement ERP 5e Catégorie (Type N & Prestation de Services)',
    authority: 'Direction de l’Urbanisme — Ville de Paris / Préfecture',
    requirementSummary:
      'Autorisation de Travaux (AT) pour changement d’aménagement intérieur, accessibilité PMR (cheminement, comptoir abaissé, sanitaire adapté) et dégagements de sécurité.',
    verificationMethod: 'Dépôt du dossier AT/ERP 4 à 5 mois avant ouverture cible.',
    riskLevel: 'Élevé',
  },
];

export interface ResearchFieldNote {
  id: string;
  date: string;
  axis: 'Modèle Laverie' | 'Café de Spécialité' | 'Listening Bar & Audio' | 'Juridique & Urbain';
  title: string;
  hypothesisTested: string;
  methodologyNote: string;
  status: 'À vérifier sur terrain' | 'En cours d’analyse' | 'Cadre validé';
}

/**
 * Protocoles de recherche initiaux — aucun établissement ou article fabriqué.
 * Contient uniquement des protocoles méthodologiques prêts à recevoir les relevés réels du fondateur.
 */
export const INITIAL_RESEARCH_NOTES: ResearchFieldNote[] = [
  {
    id: 'res-proto-01',
    date: '2026-11',
    axis: 'Modèle Laverie',
    title: 'Protocole de relevé : rotation horaire et panier moyen en laverie urbaine dense',
    hypothesisTested:
      'Hypothèse à tester : le temps d’attente moyen de 45 à 60 minutes (lavage + séchage) génère un taux de conversion croisé de 35% vers une offre café/boisson si l’acoustique et l’assise sont soignées.',
    methodologyNote:
      'Grille d’observation vierge : relever sur place (créneaux 8h-12h, 14h-18h, 19h-22h) le taux d’occupation machines, la proportion d’attente sur place vs départ, et la puissance électrique installée.',
    status: 'À vérifier sur terrain',
  },
  {
    id: 'res-proto-02',
    date: '2026-11',
    axis: 'Listening Bar & Audio',
    title: 'Protocole acoustique : découplage vibratoire essorage 1000 tr/min et écoute haute-fidélité',
    hypothesisTested:
      'Hypothèse à tester : des machines à cuve suspendue posées sur plots élastomères + arrêt programmé des gros essorages après 20h30 permettent une écoute vinyle audiophile sans bruit de fond basse fréquence.',
    methodologyNote:
      'Consulter deux fabricants de matériel de blanchisserie professionnelle et un acousticien pour chiffrer l’atténuation en dB(C) à 63 Hz et 125 Hz.',
    status: 'En cours d’analyse',
  },
  {
    id: 'res-proto-03',
    date: '2026-11',
    axis: 'Café de Spécialité',
    title: 'Protocole d’ergonomie comptoir : bascule de flux Coffee Shop (08h-17h) vers Cocktail Bar (18h-01h)',
    hypothesisTested:
      'Hypothèse à tester : un comptoir modulaire unique avec double éclairage graduable et occultation visuelle du parc machines en soirée réduit le CAPEX d’agencement de 18%.',
    methodologyNote:
      'Validation sur plan 1/50e avec ergonome bar : partage des arrivées d’eau filtrée, machine à glace, plonge et stockage.',
    status: 'Cadre validé',
  },
];

export interface PropertyTechnicalSpec {
  id: string;
  criterion: string;
  targetSpec: string;
  eliminationThreshold: string;
  weightPercent: number;
  technicalRationale: string;
}

export const PROPERTY_TECHNICAL_SPECS: PropertyTechnicalSpec[] = [
  {
    id: 'spec-surface',
    criterion: 'Surface commerciale RDC + Sous-sol exploitable',
    targetSpec: '110 m² à 150 m² (dont min. 85 m² en RDC de plain-pied)',
    eliminationThreshold: '< 75 m² en RDC (impossible de séparer laverie, salon d’écoute et bar)',
    weightPercent: 20,
    technicalRationale:
      'Nécessite trois zones distinctes : sas technique laverie (25-30 m²), comptoir café/cocktail (20 m²), salon d’écoute Living Room (45-60 m²) + réserve/stock.',
  },
  {
    id: 'spec-acoustics',
    criterion: 'Structure du plancher haut & mitoyenneté résidentielle',
    targetSpec: 'Dalle béton pleine épaisse ou pavillon/bâtiment industriel sur cour',
    eliminationThreshold: 'Plancher bois ancien non isolable sous chambres d’habitation directe',
    weightPercent: 25,
    technicalRationale:
      'Le combiné basses fréquences audio Hi-Fi + vibrations machines exige un affaiblissement acoustique DnT,A > 65 dB.',
  },
  {
    id: 'spec-power-water',
    criterion: 'Puissance électrique Triphasée & Évacuation eaux usées',
    targetSpec: 'Tarif Jaune / Triphasé 36 à 60 kVA + colonne EU diamètre >= 100 mm',
    eliminationThreshold: 'Monophasé non augmentable ou colonne EU sous-dimensionnée sans pente',
    weightPercent: 20,
    technicalRationale:
      'Alimentation simultanée de 6-8 laveuses professionnelles, séchoirs pompe à chaleur, machine espresso multi-groupes et climatisation.',
  },
  {
    id: 'spec-facade',
    criterion: 'Linéaire de façade & Visibilité piétonne quartier',
    targetSpec: 'Linéaire vitrine >= 7 mètres, rue commerçante ou angle Paris Est/Nord',
    eliminationThreshold: '< 4 mètres de façade ou galerie intérieure sans accès tardif',
    weightPercent: 15,
    technicalRationale:
      'Permet une double lecture extérieure : entrée fonctionnelle laverie/café le jour et atmosphère feutrée Listening Bar le soir.',
  },
  {
    id: 'spec-lease',
    criterion: 'Destination du Bail Commercial 3/6/9 & Règlement de Copropriété',
    targetSpec: 'Bail autorisant Laverie + Restauration légère + Bar / Débit de boissons (ou tous commerces)',
    eliminationThreshold: 'Clause d’interdiction formelle de nuisances/débit de boissons dans le règlement de copropriété',
    weightPercent: 20,
    technicalRationale:
      'Sécurisation juridique indispensable avant tout engagement de frais d’architecte ou d’achat de Licence IV.',
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
    id: 'prop-template-a',
    label: 'Gabarit Cible A — Local d’angle RDC sur dalle béton (Folie-Méricourt / Popincourt, 11e)',
    targetZone: 'Paris 11e (Cible prioritaire)',
    surfaceSqm: 125,
    monthlyRentExclCharges: 4600,
    leaseAssignmentCost: 95000,
    hasConcreteSlab: true,
    hasThreePhasePower: true,
    hasBarLicenseAllowed: true,
    hasAdequateFacade: true,
    notes:
      'Gabarit de référence hypothétique servant d’étalon au business plan. Remplacer ou dupliquer lors des visites réelles.',
    isHypotheticalTemplate: true,
  },
  {
    id: 'prop-template-b',
    label: 'Gabarit Cible B — Ancien atelier sur rue (Canal Saint-Martin / Grange-aux-Belles, 10e)',
    targetZone: 'Paris 10e (Cible secondaire)',
    surfaceSqm: 110,
    monthlyRentExclCharges: 4200,
    leaseAssignmentCost: 80000,
    hasConcreteSlab: true,
    hasThreePhasePower: true,
    hasBarLicenseAllowed: false,
    hasAdequateFacade: true,
    notes:
      'Gabarit alternatif hypothétique illustrant l’impact d’une réserve sur la clause débit de boissons en copropriété.',
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
  targetMarginPercent: number;
}

export const IDEA_LAB_DAY_NIGHT_MODES: IdeaLabConceptPillar[] = [
  {
    id: 'mode-morning',
    timeSlot: '07h30 – 14h00',
    modeName: 'Séquence I — Laverie Urbaine & Coffee Shop de Spécialité',
    primaryRevenueDrivers: [
      'Cycles lavage & séchage haute efficacité (paiement sans contact / app)',
      'Espresso de spécialité, filtre batch brew, viennoiseries artisanales',
      'Postes de travail calmes & table d’hôte pendant le cycle de 45 min',
    ],
    acousticAtmosphere: 'Écoute feutrée 62–65 dB(A) : ambient, jazz acoustique, folk sur enceintes pavillonnaires.',
    operationalSynergy:
      'Un seul barista-opérateur supervise l’accueil café et l’assistance laverie en heures creuses matinales.',
    targetMarginPercent: 74,
  },
  {
    id: 'mode-afternoon',
    timeSlot: '14h00 – 18h30',
    modeName: 'Séquence II — Salon de Quartier, Coworking Doux & Service Linge',
    primaryRevenueDrivers: [
      'Heures pleines laverie étudiants/télétravailleurs & abonnements lavage',
      'Boissons froides, infusions maison, pâtisseries & écoute d’albums intégraux',
      'Casiers de dépôt / retrait linge plié (service additionnel à tester)',
    ],
    acousticAtmosphere: 'Sélections curatées 65–68 dB(A) : soul, dub chaleureux, électronique organique.',
    operationalSynergy:
      'Monétisation des heures traditionnellement creuses d’un bar grâce à la récurrence incompressible du besoin de laverie.',
    targetMarginPercent: 78,
  },
  {
    id: 'mode-evening',
    timeSlot: '18h30 – 01h00',
    modeName: 'Séquence III — Listening Bar Audiophile & Cocktails Créatifs',
    primaryRevenueDrivers: [
      'Cocktails signatures basés sur infusions café/botaniques, vins vivants & sans-alcool',
      'Assiettes de partage froides/tièdes sans extraction lourde de friture',
      'Dernier départ de cycle d’essorage limité à 20h30 ; occultation douce par rideaux acoustiques lourds',
    ],
    acousticAtmosphere:
      'Écoute haute-fidélité 75–82 dB(A) maîtrisée : sélecteurs vinyles, acoustique boisée absorbante, zéro réverbération agressive.',
    operationalSynergy:
      'Transition d’éclairage en 15 minutes ; le salon d’attente diurne devient la salle d’écoute nocturne à forte valeur ajoutée.',
    targetMarginPercent: 76,
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
    title: 'Cloison vitrée acoustique double feuilleté + rideau velours lourd 650g/m²',
    description:
      'En journée, le parc de machines en inox/bois reste visible à travers un vitrage acoustique Stadip Silence. À 19h30, un rideau acoustique lourd coulisse pour transformer le mur en surface absorbante chaude.',
    impactScore: 5,
    feasibilityScore: 4,
    status: 'Retenu MVP',
  },
  {
    id: 'idea-02',
    category: 'Expérience Client',
    title: 'Jeton "Cycle & Café" intégré au terminal de paiement laverie',
    description:
      'Lors du lancement d’un cycle lavage + séchage, l’utilisateur peut ajouter pour +2,50 € un café filtre ou espresso servi au comptoir, avec notification discrète de fin de cycle à sa table.',
    impactScore: 5,
    feasibilityScore: 5,
    status: 'Retenu MVP',
  },
  {
    id: 'idea-03',
    category: 'Carte & Boissons',
    title: 'Cocktails clarifiés & sirops d’épices préparés avec la vapeur/filtration du bar café',
    description:
      'Mutualisation totale du matériel entre barista du matin et barman du soir : eau osmosée reminéralisée, marc de café valorisé en liqueur maison et infusions botaniques.',
    impactScore: 4,
    feasibilityScore: 5,
    status: 'À prototyper',
  },
  {
    id: 'idea-04',
    category: 'Modèle Économique',
    title: 'Séchoirs à pompe à chaleur (circuit fermé sans gaine d’extraction en façade)',
    description:
      'Élimine le besoin de créer un conduit d’évacuation d’air humide en façade ou en toiture de copropriété parisienne, tout en divisant par deux la consommation électrique.',
    impactScore: 5,
    feasibilityScore: 4,
    status: 'Retenu MVP',
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
    id: 'rm-q4-2026',
    quarter: 'T4 2026',
    phaseTitle: 'Phase 1 — Cadrage Financier, Thèse Conceptuelle & Cahier des Charges',
    targetDate: 'Nov. – Déc. 2026',
    deliverables: [
      'Espace fondateur Project Living Room & simulateurs financiers opérationnels',
      'Définition du cahier des charges acoustique et électrique (triphasé / dalle béton)',
      'Validation de la trajectoire d’épargne fondateurs sur 13 mois',
    ],
    decisionGate: 'Gate 1 : Validation du budget cible CAPEX (~500 k€) et d’un apport quasi-fonds propres >= 28%.',
    status: 'En cours',
  },
  {
    id: 'rm-q1-2027',
    quarter: 'T1 2027',
    phaseTitle: 'Phase 2 — Prospection Active Local (Paris 10e/11e/18e/19e/20e) & Sourcing Licence IV',
    targetDate: 'Janv. – Mars 2027',
    deliverables: [
      'Visites qualifiées avec grille de compatibilité technique (objectif 15-20 locaux inspectés)',
      'Pré-consultation d’un bureau d’études acoustiques et d’un architecte ERP',
      'Identification d’une Licence IV transférable hors périmètre protégé',
    ],
    decisionGate: 'Gate 2 : Offre acceptée sous conditions suspensives (EINS acoustique, Licence IV, prêt bancaire).',
    status: 'À venir',
  },
  {
    id: 'rm-q2-2027',
    quarter: 'T2 2027',
    phaseTitle: 'Phase 3 — Structuration Juridique, Dossier Bancaire & Autorisation de Travaux',
    targetDate: 'Avril – Juin 2027',
    deliverables: [
      'Constitution de la société d’exploitation (SAS) & pacte d’associés',
      'Bouclage financement : Prêt d’honneur (Initiative Paris / Réseau Entreprendre) + Crédit bancaire 7 ans',
      'Dépôt de l’Autorisation de Travaux (AT/ERP 5e catégorie) et demande de mutation Licence IV',
    ],
    decisionGate: 'Gate 3 : Obtention des accords bancaires fermes et purge des conditions suspensives du bail.',
    status: 'À venir',
  },
  {
    id: 'rm-q3-2027',
    quarter: 'T3 2027',
    phaseTitle: 'Phase 4 — Chantier d’Aménagement, Boîte Acoustique & Réseaux Techniques',
    targetDate: 'Juil. – Oct. 2027',
    deliverables: [
      'Désamiantage/curage éventuel, coulage socles antivibratiles laverie et plomberie',
      'Traitement acoustique plafond/murs salon d’écoute et menuiseries sur-mesure',
      'Livraison parc machines laverie connectée, système Hi-Fi et équipement bar/espresso',
    ],
    decisionGate: 'Gate 4 : Réception des travaux et validation des mesures acoustiques EINS + limiteur scellé.',
    status: 'À venir',
  },
  {
    id: 'rm-q4-2027',
    quarter: 'T4 2027',
    phaseTitle: 'Phase 5 — Rodage Opérationnel, Soft Opening & Ouverture Officielle',
    targetDate: 'Nov. – Décembre 2027',
    deliverables: [
      'Recrutement et formation équipe polyvalente (Barista / Bartender / Hospitalité)',
      'Calibration finale du système sonore, tests de charge machines et parcours paiement',
      'Semaine de Soft Opening privé puis ouverture officielle Project Living Room',
    ],
    decisionGate: 'Gate 5 : Ouverture Décembre 2027 avec trésorerie de sécurité BFR intacte.',
    status: 'À venir',
  },
];
