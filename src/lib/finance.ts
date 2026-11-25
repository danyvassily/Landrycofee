/**
 * Moteur de calcul financier — Project Living Room (Paris, Cible Décembre 2027)
 * Toutes les valeurs par défaut sont des hypothèses de travail modifiables (HYPOTHÉTIQUES).
 */

export interface SavingsAssumptions {
  /** Épargne déjà mobilisable au démarrage de la simulation (€) */
  initialSavings: number;
  /** Versement mensuel combiné des fondateurs (€/mois) */
  monthlyContribution: number;
  /** Horizon d'épargne avant bouclage financier (mois) */
  monthsToTarget: number;
  /** Taux de rendement annuel net sur trésorerie placée (%) */
  annualYieldPercent: number;
  /** Apports exceptionnels ponctuels prévus sur la période (€) */
  exceptionalContribution: number;
  /** Mois de versement de l'apport exceptionnel (1..monthsToTarget) */
  exceptionalContributionMonth: number;
  /** Objectif cible d'apport personnel fondateurs (€) */
  targetFounderEquity: number;
}

export interface MonthlySavingsPoint {
  monthIndex: number;
  label: string;
  startingBalance: number;
  regularContribution: number;
  exceptionalAddition: number;
  interestEarned: number;
  endingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface SavingsScenarioSummary {
  id: 'prudent' | 'central' | 'ambitieux';
  name: string;
  description: string;
  monthlyMultiplier: number;
  effectiveMonthlyContribution: number;
  finalBalance: number;
  totalPrincipalContributed: number;
  totalInterestEarned: number;
  targetGapOrSurplus: number; // positif = surplus, négatif = manque par rapport à targetFounderEquity
  targetReachedMonth: number | null;
  schedule: MonthlySavingsPoint[];
}

export interface SavingsSimulationResult {
  assumptions: SavingsAssumptions;
  central: SavingsScenarioSummary;
  scenarios: SavingsScenarioSummary[];
  requiredMonthlyForTarget: number;
}

export interface ProjectCapexAssumptions {
  /** Droit au bail / indemnité de départ / acquisition fonds (€) */
  leaseAcquisition: number;
  /** Travaux d'aménagement, isolation acoustique haute performance & CVC (€) */
  renovationAcoustics: number;
  /** Parc machines laverie professionnelle connectée & pompe à chaleur (€) */
  laundryEquipment: number;
  /** Équipement coffee shop (espresso, filtration) & station cocktail (€) */
  coffeeBarEquipment: number;
  /** Système haute-fidélité audiophile (enceintes, amplification, vinyles) (€) */
  hiFiSoundSystem: number;
  /** Licence IV, honoraires architecte, acousticiens & frais juridiques (€) */
  legalLicensingArch: number;
  /** Dépôt de garantie, stock initial & trésorerie de lancement (BFR) (€) */
  workingCapitalReserve: number;
}

export interface ProjectFinancingAssumptions {
  /** Utiliser l'apport projeté par le simulateur d'épargne (scénario central) */
  syncFounderEquityFromSavings: boolean;
  /** Apport personnel fondateurs manuel si non synchronisé (€) */
  manualFounderEquity: number;
  /** Prêt d'honneur à taux zéro / BPI / Réseau Entreprendre (€) */
  honorLoanZeroRate: number;
  /** Subventions transition écologique / aides acoustiques & commerce (€) */
  grantsAndSubsidies: number;
  /** Montant de l'emprunt bancaire professionnel sollicité (€) */
  bankLoanPrincipal: number;
  /** Taux d'intérêt annuel nominal du crédit bancaire (%) */
  annualInterestRatePercent: number;
  /** Taux annuel d'assurance emprunteur sur capital initial (%) */
  annualInsuranceRatePercent: number;
  /** Durée totale du prêt bancaire (années, ex: 7 ans) */
  loanDurationYears: number;
  /** Différé d'amortissement du capital en mois (0 à 24 mois) */
  gracePeriodMonths: number;
  /** Excédent Brut d'Exploitation (EBE / EBITDA) mensuel cible en croisière (€) */
  hypotheticalMonthlyEbitda: number;
}

export interface AmortizationMonthRow {
  month: number;
  year: number;
  beginningBalance: number;
  scheduledPaymentExclInsurance: number;
  principalPaid: number;
  interestPaid: number;
  insurancePaid: number;
  totalMonthlyOutflow: number;
  endingBalance: number;
  isGracePeriod: boolean;
}

export interface AmortizationYearRow {
  year: number;
  beginningBalance: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalInsurancePaid: number;
  totalOutflow: number;
  endingBalance: number;
}

export interface FundingAndLoanResult {
  totalProjectCost: number;
  capexBreakdown: {
    key: keyof ProjectCapexAssumptions;
    label: string;
    amount: number;
    sharePercent: number;
  }[];
  effectiveFounderEquity: number;
  totalQuasiEquity: number; // Apport + Prêt d'honneur + Subventions
  equityRatioPercent: number;
  totalAvailableFunding: number;
  /**
   * Écart de financement (Funding Gap) :
   * > 0 : Besoin non couvert (déficit à combler)
   * = 0 : Équilibre exact
   * < 0 : Excédent / coussin de sécurité supplémentaire
   */
  fundingGap: number;
  /** Solde net (Ressources - Emplois) : positif = coussin excédentaire, négatif = besoin non financé */
  netFundingBalance: number;
  isFullyFunded: boolean;
  bankReadinessStatus: 'solide' | 'limite' | 'insuffisant';
  loanSummary: {
    principal: number;
    totalMonths: number;
    amortizingMonths: number;
    gracePeriodMonths: number;
    monthlyPaymentGraceExclInsurance: number;
    monthlyPaymentAmortizingExclInsurance: number;
    monthlyInsurance: number;
    totalMonthlyDebtServiceAmortizing: number;
    annualDebtServiceAmortizing: number;
    totalInterestCost: number;
    totalInsuranceCost: number;
    totalCreditCost: number;
    dscrEstimate: number;
    requiredMonthlyEbitdaForSafeDscr: number;
  };
  monthlySchedule: AmortizationMonthRow[];
  yearlySchedule: AmortizationYearRow[];
}

function clampNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule la trajectoire d'épargne mensuelle pour un scénario donné
 */
export function buildSavingsSchedule(
  assumptions: SavingsAssumptions,
  monthlyMultiplier: number = 1,
  id: 'prudent' | 'central' | 'ambitieux' = 'central',
  name: string = 'Scénario Central',
  description: string = 'Effort mensuel nominal des fondateurs'
): SavingsScenarioSummary {
  const initialSavings = clampNonNegative(assumptions.initialSavings);
  const baseMonthly = clampNonNegative(assumptions.monthlyContribution);
  const effectiveMonthlyContribution = roundCents(baseMonthly * clampNonNegative(monthlyMultiplier));
  const months = Math.max(1, Math.min(120, Math.round(clampNonNegative(assumptions.monthsToTarget) || 1)));
  const annualYield = clampNonNegative(assumptions.annualYieldPercent) / 100;
  const monthlyRate = annualYield / 12;
  const exceptional = clampNonNegative(assumptions.exceptionalContribution);
  const exceptionalMonth = Math.max(1, Math.min(months, Math.round(assumptions.exceptionalContributionMonth || 1)));
  const targetEquity = clampNonNegative(assumptions.targetFounderEquity);

  const schedule: MonthlySavingsPoint[] = [];
  let currentBalance = initialSavings;
  let cumulativePrincipal = initialSavings;
  let cumulativeInterest = 0;
  let targetReachedMonth: number | null = currentBalance >= targetEquity ? 0 : null;

  for (let m = 1; m <= months; m++) {
    const startingBalance = currentBalance;
    const regularContribution = effectiveMonthlyContribution;
    const exceptionalAddition = m === exceptionalMonth ? exceptional : 0;
    // Intérêts calculés sur le solde de début de mois
    const interestEarned = roundCents(startingBalance * monthlyRate);
    const endingBalance = roundCents(
      startingBalance + regularContribution + exceptionalAddition + interestEarned
    );

    cumulativePrincipal = roundCents(cumulativePrincipal + regularContribution + exceptionalAddition);
    cumulativeInterest = roundCents(cumulativeInterest + interestEarned);
    currentBalance = endingBalance;

    if (targetReachedMonth === null && currentBalance >= targetEquity) {
      targetReachedMonth = m;
    }

    schedule.push({
      monthIndex: m,
      label: `M+${m}`,
      startingBalance,
      regularContribution,
      exceptionalAddition,
      interestEarned,
      endingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  const finalBalance = currentBalance;
  const targetGapOrSurplus = roundCents(finalBalance - targetEquity);

  return {
    id,
    name,
    description,
    monthlyMultiplier,
    effectiveMonthlyContribution,
    finalBalance,
    totalPrincipalContributed: cumulativePrincipal,
    totalInterestEarned: cumulativeInterest,
    targetGapOrSurplus,
    targetReachedMonth,
    schedule,
  };
}

/**
 * Calcule l'effort d'épargne mensuel requis pour atteindre exactement `targetFounderEquity`
 * à l'horizon `monthsToTarget`.
 */
export function calculateRequiredMonthlySavings(assumptions: SavingsAssumptions): number {
  const initialSavings = clampNonNegative(assumptions.initialSavings);
  const months = Math.max(1, Math.min(120, Math.round(clampNonNegative(assumptions.monthsToTarget) || 1)));
  const annualYield = clampNonNegative(assumptions.annualYieldPercent) / 100;
  const monthlyRate = annualYield / 12;
  const exceptional = clampNonNegative(assumptions.exceptionalContribution);
  const exceptionalMonth = Math.max(1, Math.min(months, Math.round(assumptions.exceptionalContributionMonth || 1)));
  const targetEquity = clampNonNegative(assumptions.targetFounderEquity);

  // Valeur future du capital initial et de l'apport exceptionnel sans versements mensuels
  const compoundInitial = initialSavings * Math.pow(1 + monthlyRate, months);
  const monthsRemainingAfterExceptional = months - exceptionalMonth;
  const compoundExceptional =
    exceptional * Math.pow(1 + monthlyRate, Math.max(0, monthsRemainingAfterExceptional));

  const remainingToFund = targetEquity - (compoundInitial + compoundExceptional);
  if (remainingToFund <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return roundCents(remainingToFund / months);
  }

  // Annuité de fin de période : FV = PMT * ((1 + r)^n - 1) / r
  const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return roundCents(remainingToFund / annuityFactor);
}

/**
 * Exécute la simulation complète d'épargne avec 3 scénarios comparatifs (Prudent, Central, Ambitieux)
 */
export function simulateSavingsScenarios(assumptions: SavingsAssumptions): SavingsSimulationResult {
  const prudent = buildSavingsSchedule(
    assumptions,
    0.8,
    'prudent',
    'Scénario Prudent (-20%)',
    'Marge de sécurité en cas d’imprévu personnel durant la phase de recherche de local'
  );
  const central = buildSavingsSchedule(
    assumptions,
    1.0,
    'central',
    'Scénario Central (Nominal)',
    'Trajectoire d’épargne mensuelle de référence jusqu’à décembre 2027'
  );
  const ambitieux = buildSavingsSchedule(
    assumptions,
    1.25,
    'ambitieux',
    'Scénario Accéléré (+25%)',
    'Effort d’épargne renforcé pour maximiser le ratio de fonds propres devant les banques'
  );

  const requiredMonthlyForTarget = calculateRequiredMonthlySavings(assumptions);

  return {
    assumptions,
    central,
    scenarios: [prudent, central, ambitieux],
    requiredMonthlyForTarget,
  };
}

/**
 * Calcule le plan de financement, l'écart de financement (Funding Gap) et le tableau d'amortissement
 */
export function simulateProjectFundingAndLoan(
  capex: ProjectCapexAssumptions,
  financing: ProjectFinancingAssumptions,
  projectedSavingsEquity?: number
): FundingAndLoanResult {
  const rawItems: { key: keyof ProjectCapexAssumptions; label: string; amount: number }[] = [
    {
      key: 'leaseAcquisition',
      label: 'Droit au bail / Indemnité & Acquisition',
      amount: clampNonNegative(capex.leaseAcquisition),
    },
    {
      key: 'renovationAcoustics',
      label: 'Travaux, Acoustique & Extraction CVC',
      amount: clampNonNegative(capex.renovationAcoustics),
    },
    {
      key: 'laundryEquipment',
      label: 'Machines Laverie Pro & Monétique',
      amount: clampNonNegative(capex.laundryEquipment),
    },
    {
      key: 'coffeeBarEquipment',
      label: 'Équipement Coffee Shop & Cocktail Bar',
      amount: clampNonNegative(capex.coffeeBarEquipment),
    },
    {
      key: 'hiFiSoundSystem',
      label: 'Système Audio Hi-Fi & Cabine Vinyle',
      amount: clampNonNegative(capex.hiFiSoundSystem),
    },
    {
      key: 'legalLicensingArch',
      label: 'Licence IV, Architecte & Frais Juridiques',
      amount: clampNonNegative(capex.legalLicensingArch),
    },
    {
      key: 'workingCapitalReserve',
      label: 'Dépôt de Garantie, Stock & Trésorerie BFR',
      amount: clampNonNegative(capex.workingCapitalReserve),
    },
  ];

  const totalProjectCost = roundCents(rawItems.reduce((acc, item) => acc + item.amount, 0));

  const capexBreakdown = rawItems.map((item) => ({
    ...item,
    sharePercent: totalProjectCost > 0 ? roundCents((item.amount / totalProjectCost) * 100) : 0,
  }));

  const effectiveFounderEquity = roundCents(
    financing.syncFounderEquityFromSavings && projectedSavingsEquity !== undefined
      ? clampNonNegative(projectedSavingsEquity)
      : clampNonNegative(financing.manualFounderEquity)
  );

  const honorLoan = clampNonNegative(financing.honorLoanZeroRate);
  const grants = clampNonNegative(financing.grantsAndSubsidies);
  const totalQuasiEquity = roundCents(effectiveFounderEquity + honorLoan + grants);

  const principal = roundCents(clampNonNegative(financing.bankLoanPrincipal));
  const totalAvailableFunding = roundCents(totalQuasiEquity + principal);

  // Funding gap > 0 signifie un déficit de financement ; <= 0 signifie que le projet est intégralement financé
  const fundingGap = roundCents(totalProjectCost - totalAvailableFunding);
  const netFundingBalance = roundCents(totalAvailableFunding - totalProjectCost);
  const isFullyFunded = fundingGap <= 0;

  const equityRatioPercent =
    totalProjectCost > 0 ? roundCents((totalQuasiEquity / totalProjectCost) * 100) : 0;

  let bankReadinessStatus: 'solide' | 'limite' | 'insuffisant' = 'insuffisant';
  if (isFullyFunded && equityRatioPercent >= 28) {
    bankReadinessStatus = 'solide';
  } else if (fundingGap <= totalProjectCost * 0.05 && equityRatioPercent >= 20) {
    bankReadinessStatus = 'limite';
  }

  // Paramètres du prêt bancaire
  const durationYears = Math.max(1, Math.min(25, Math.round(clampNonNegative(financing.loanDurationYears) || 7)));
  const totalMonths = durationYears * 12;
  const gracePeriodMonths = Math.max(
    0,
    Math.min(totalMonths - 1, Math.round(clampNonNegative(financing.gracePeriodMonths) || 0))
  );
  const amortizingMonths = totalMonths - gracePeriodMonths;

  const annualRate = clampNonNegative(financing.annualInterestRatePercent) / 100;
  const monthlyRate = annualRate / 12;

  const annualInsuranceRate = clampNonNegative(financing.annualInsuranceRatePercent) / 100;
  const monthlyInsurance = roundCents((principal * annualInsuranceRate) / 12);

  // Mensualité pendant la franchise partielle (intérêts seuls + assurance)
  const monthlyPaymentGraceExclInsurance = roundCents(principal * monthlyRate);

  // Mensualité constante en phase d'amortissement
  let monthlyPaymentAmortizingExclInsurance = 0;
  if (principal > 0 && amortizingMonths > 0) {
    if (monthlyRate === 0) {
      monthlyPaymentAmortizingExclInsurance = roundCents(principal / amortizingMonths);
    } else {
      const factor = Math.pow(1 + monthlyRate, amortizingMonths);
      monthlyPaymentAmortizingExclInsurance = roundCents(
        (principal * (monthlyRate * factor)) / (factor - 1)
      );
    }
  }

  const monthlySchedule: AmortizationMonthRow[] = [];
  let remainingBalance = principal;
  let totalInterestCost = 0;
  let totalInsuranceCost = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const year = Math.ceil(m / 12);
    const beginningBalance = remainingBalance;
    const isGracePeriod = m <= gracePeriodMonths;
    const interestPaid = roundCents(beginningBalance * monthlyRate);

    let principalPaid = 0;
    let scheduledPaymentExclInsurance = 0;

    if (isGracePeriod) {
      principalPaid = 0;
      scheduledPaymentExclInsurance = interestPaid;
    } else if (m === totalMonths) {
      // Dernière échéance : ajuste au centime près pour solder exactement le capital
      principalPaid = roundCents(beginningBalance);
      scheduledPaymentExclInsurance = roundCents(principalPaid + interestPaid);
    } else {
      scheduledPaymentExclInsurance = monthlyPaymentAmortizingExclInsurance;
      principalPaid = roundCents(Math.min(beginningBalance, scheduledPaymentExclInsurance - interestPaid));
    }

    const endingBalance = roundCents(Math.max(0, beginningBalance - principalPaid));
    const insurancePaid = principal > 0 ? monthlyInsurance : 0;
    const totalMonthlyOutflow = roundCents(scheduledPaymentExclInsurance + insurancePaid);

    totalInterestCost = roundCents(totalInterestCost + interestPaid);
    totalInsuranceCost = roundCents(totalInsuranceCost + insurancePaid);
    remainingBalance = endingBalance;

    monthlySchedule.push({
      month: m,
      year,
      beginningBalance,
      scheduledPaymentExclInsurance,
      principalPaid,
      interestPaid,
      insurancePaid,
      totalMonthlyOutflow,
      endingBalance,
      isGracePeriod,
    });
  }

  // Agrégation annuelle
  const yearlySchedule: AmortizationYearRow[] = [];
  for (let y = 1; y <= durationYears; y++) {
    const rows = monthlySchedule.filter((r) => r.year === y);
    if (rows.length === 0) continue;
    yearlySchedule.push({
      year: y,
      beginningBalance: rows[0].beginningBalance,
      totalPrincipalPaid: roundCents(rows.reduce((acc, r) => acc + r.principalPaid, 0)),
      totalInterestPaid: roundCents(rows.reduce((acc, r) => acc + r.interestPaid, 0)),
      totalInsurancePaid: roundCents(rows.reduce((acc, r) => acc + r.insurancePaid, 0)),
      totalOutflow: roundCents(rows.reduce((acc, r) => acc + r.totalMonthlyOutflow, 0)),
      endingBalance: rows[rows.length - 1].endingBalance,
    });
  }

  const totalMonthlyDebtServiceAmortizing = roundCents(
    monthlyPaymentAmortizingExclInsurance + (principal > 0 ? monthlyInsurance : 0)
  );
  const annualDebtServiceAmortizing = roundCents(totalMonthlyDebtServiceAmortizing * 12);
  const totalCreditCost = roundCents(totalInterestCost + totalInsuranceCost);

  const monthlyEbitda = clampNonNegative(financing.hypotheticalMonthlyEbitda);
  const dscrEstimate =
    totalMonthlyDebtServiceAmortizing > 0
      ? roundCents(monthlyEbitda / totalMonthlyDebtServiceAmortizing)
      : 0;
  // Seuil bancaire prudent : DSCR >= 1.30x
  const requiredMonthlyEbitdaForSafeDscr = roundCents(totalMonthlyDebtServiceAmortizing * 1.3);

  return {
    totalProjectCost,
    capexBreakdown,
    effectiveFounderEquity,
    totalQuasiEquity,
    equityRatioPercent,
    totalAvailableFunding,
    fundingGap,
    netFundingBalance,
    isFullyFunded,
    bankReadinessStatus,
    loanSummary: {
      principal,
      totalMonths,
      amortizingMonths,
      gracePeriodMonths,
      monthlyPaymentGraceExclInsurance,
      monthlyPaymentAmortizingExclInsurance,
      monthlyInsurance: principal > 0 ? monthlyInsurance : 0,
      totalMonthlyDebtServiceAmortizing,
      annualDebtServiceAmortizing,
      totalInterestCost,
      totalInsuranceCost,
      totalCreditCost,
      dscrEstimate,
      requiredMonthlyEbitdaForSafeDscr,
    },
    monthlySchedule,
    yearlySchedule,
  };
}

export interface PropertyScoreInput {
  surfaceSqm: number;
  monthlyRentExclCharges: number;
  hasConcreteSlab: boolean;
  hasThreePhasePower: boolean;
  hasBarLicenseAllowed: boolean;
  hasAdequateFacade: boolean;
}

export interface PropertyScoreResult {
  scoreOutOf100: number;
  verdict: 'Compatible' | 'Sous réserve technique' | 'Disqualifié';
  blockers: string[];
}

/**
 * Évalue la compatibilité technique d'un local parisien candidat sur 100 points
 */
export function calculatePropertyCompatibilityScore(
  candidate: PropertyScoreInput
): PropertyScoreResult {
  let score = 0;
  const blockers: string[] = [];

  // 1. Dalle béton & acoustique (25 pts)
  if (candidate.hasConcreteSlab) {
    score += 25;
  } else {
    blockers.push('Absence de dalle béton (risque acoustique majeur EINS / vibrations essorage)');
  }

  // 2. Destination bail & Licence IV / Bar autorisé (25 pts)
  if (candidate.hasBarLicenseAllowed) {
    score += 25;
  } else {
    blockers.push('Bail ou copropriété bloquant l’activité Bar / Licence IV');
  }

  // 3. Alimentation triphasée & évacuations (20 pts)
  if (candidate.hasThreePhasePower) {
    score += 20;
  } else {
    blockers.push('Alimentation triphasée 36-60 kVA absente ou à raccorder');
  }

  // 4. Surface exploitable (15 pts)
  if (candidate.surfaceSqm >= 110) {
    score += 15;
  } else if (candidate.surfaceSqm >= 85) {
    score += 8;
  } else {
    blockers.push('Surface inférieure à 85 m² (cloisonnement des 3 activités compromis)');
  }

  // 5. Linéaire vitrine & visibilité (15 pts)
  if (candidate.hasAdequateFacade) {
    score += 15;
  }

  // Malus si loyer mensuel HC excessif (> 5 500 € HC/mois pour le modèle cible)
  if (candidate.monthlyRentExclCharges > 6000) {
    score = Math.max(0, score - 15);
    blockers.push('Loyer mensuel HC > 6 000 € pesant sur le point mort d’exploitation');
  } else if (candidate.monthlyRentExclCharges > 5200) {
    score = Math.max(0, score - 7);
  }

  let verdict: PropertyScoreResult['verdict'] = 'Compatible';
  if (!candidate.hasConcreteSlab || !candidate.hasBarLicenseAllowed || score < 55) {
    verdict = 'Disqualifié';
  } else if (score < 80 || blockers.length > 0) {
    verdict = 'Sous réserve technique';
  }

  return {
    scoreOutOf100: score,
    verdict,
    blockers,
  };
}

