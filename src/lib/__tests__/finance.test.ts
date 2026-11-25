import { describe, it, expect } from 'vitest';
import {
  buildSavingsSchedule,
  calculateRequiredMonthlySavings,
  simulateSavingsScenarios,
  simulateProjectFundingAndLoan,
  calculatePropertyCompatibilityScore,
  type SavingsAssumptions,
  type ProjectCapexAssumptions,
  type ProjectFinancingAssumptions,
} from '../finance';
import {
  DEFAULT_SAVINGS_ASSUMPTIONS,
  ZERO_SAVINGS_ASSUMPTIONS,
  DEFAULT_CAPEX_ASSUMPTIONS,
  ZERO_CAPEX_ASSUMPTIONS,
  DEFAULT_FINANCING_ASSUMPTIONS,
  REGULATORY_FRAMEWORK_ITEMS,
} from '../project-data';

const sampleSavingsAssumptions: SavingsAssumptions = {
  initialSavings: 20000,
  monthlyContribution: 1000,
  monthsToTarget: 24,
  annualYieldPercent: 2.0,
  exceptionalContribution: 0,
  exceptionalContributionMonth: 12,
  targetFounderEquity: 45000,
};

const sampleCapexAssumptions: ProjectCapexAssumptions = {
  leaseAcquisition: 40000,
  renovationAcoustics: 80000,
  laundryEquipment: 50000,
  coffeeBarEquipment: 25000,
  hiFiSoundSystem: 15000,
  legalLicensingArch: 15000,
  workingCapitalReserve: 25000,
};

const sampleFinancingAssumptions: ProjectFinancingAssumptions = {
  syncFounderEquityFromSavings: false,
  manualFounderEquity: 50000,
  honorLoanZeroRate: 25000,
  grantsAndSubsidies: 0,
  bankLoanPrincipal: 175000,
  annualInterestRatePercent: 4.0,
  annualInsuranceRatePercent: 0.36,
  loanDurationYears: 7,
  gracePeriodMonths: 0,
  hypotheticalMonthlyEbitda: 0,
};

describe('Moteur Financier — Simulateur Épargne & Apport (Placeholders Neutres)', () => {
  it('calcule exactement le capital final sans rendement (taux 0%)', () => {
    const zeroYield: SavingsAssumptions = {
      ...sampleSavingsAssumptions,
      annualYieldPercent: 0,
      exceptionalContribution: 2000,
      exceptionalContributionMonth: 6,
    };

    const result = buildSavingsSchedule(zeroYield, 1.0);
    // 20 000 + (1 000 * 24) + 2 000 = 46 000 €
    expect(result.finalBalance).toBe(46000);
    expect(result.totalPrincipalContributed).toBe(46000);
    expect(result.totalInterestEarned).toBe(0);
    expect(result.schedule).toHaveLength(24);
    expect(result.targetGapOrSurplus).toBe(1000);
    expect(result.targetReachedMonth).toBe(23);
  });

  it('supporte une saisie vierge à 0 € sans erreur ni NaN', () => {
    const result = simulateSavingsScenarios(ZERO_SAVINGS_ASSUMPTIONS);
    expect(result.central.finalBalance).toBe(0);
    expect(result.requiredMonthlyForTarget).toBe(0);
  });

  it('intègre correctement les intérêts composés mensuels', () => {
    const result = buildSavingsSchedule(sampleSavingsAssumptions, 1.0);
    // Capital versé = 20 000 + 24 000 = 44 000 € + intérêts > 1 200 €
    expect(result.totalPrincipalContributed).toBe(44000);
    expect(result.totalInterestEarned).toBeGreaterThan(1200);
    expect(result.finalBalance).toBeCloseTo(
      result.totalPrincipalContributed + result.totalInterestEarned,
      2
    );
    expect(result.targetGapOrSurplus).toBeGreaterThan(200);
  });

  it('génère les 3 variantes comparatives (-20%, 100%, +25%)', () => {
    const sim = simulateSavingsScenarios(sampleSavingsAssumptions);
    expect(sim.scenarios).toHaveLength(3);
    const [prudent, central, ambitieux] = sim.scenarios;

    expect(prudent.effectiveMonthlyContribution).toBe(800);
    expect(central.effectiveMonthlyContribution).toBe(1000);
    expect(ambitieux.effectiveMonthlyContribution).toBe(1250);

    expect(prudent.finalBalance).toBeLessThan(central.finalBalance);
    expect(ambitieux.finalBalance).toBeGreaterThan(central.finalBalance);
  });

  it('calcule la mensualité requise pour atteindre exactement une cible donnée', () => {
    const zeroYield: SavingsAssumptions = {
      initialSavings: 15000,
      monthlyContribution: 500,
      monthsToTarget: 20,
      annualYieldPercent: 0,
      exceptionalContribution: 5000,
      exceptionalContributionMonth: 10,
      targetFounderEquity: 40000,
    };
    // Reste à financer : 40 000 - 15 000 - 5 000 = 20 000 sur 20 mois => 1 000 €/mois
    const required = calculateRequiredMonthlySavings(zeroYield);
    expect(required).toBe(1000);
  });

  it('retourne 0 € d’effort mensuel requis si le capital initial dépasse déjà la cible', () => {
    const alreadyFunded: SavingsAssumptions = {
      ...sampleSavingsAssumptions,
      initialSavings: 50000,
      targetFounderEquity: 45000,
    };
    expect(calculateRequiredMonthlySavings(alreadyFunded)).toBe(0);
  });
});

describe('Moteur Financier — Plan de Financement, Funding Gap & Amortissement', () => {
  it('calcule le coût total du projet, les fonds propres et l’équilibre exact (Funding Gap = 0)', () => {
    const result = simulateProjectFundingAndLoan(
      sampleCapexAssumptions,
      sampleFinancingAssumptions
    );
    // Somme CAPEX d'exemple = 40k + 80k + 50k + 25k + 15k + 15k + 25k = 250 000 €
    expect(result.totalProjectCost).toBe(250000);
    // Quasi-fonds propres = 50k + 25k + 0 = 75 000 € (30% du total)
    expect(result.totalQuasiEquity).toBe(75000);
    expect(result.equityRatioPercent).toBe(30);
    // Total financement = 75k + 175k = 250 000 €
    expect(result.totalAvailableFunding).toBe(250000);
    expect(result.fundingGap).toBe(0);
    expect(result.netFundingBalance).toBe(0);
    expect(result.isFullyFunded).toBe(true);
  });

  it('supporte un plan de financement vierge à 0 €', () => {
    const zeroResult = simulateProjectFundingAndLoan(
      ZERO_CAPEX_ASSUMPTIONS,
      { ...DEFAULT_FINANCING_ASSUMPTIONS, syncFounderEquityFromSavings: false, manualFounderEquity: 0, honorLoanZeroRate: 0, bankLoanPrincipal: 0 }
    );
    expect(zeroResult.totalProjectCost).toBe(0);
    expect(zeroResult.fundingGap).toBe(0);
    expect(zeroResult.loanSummary.totalMonthlyDebtServiceAmortizing).toBe(0);
  });

  it('détecte un écart de financement (Funding Gap > 0) lorsque les ressources sont insuffisantes', () => {
    const underfundedFinancing: ProjectFinancingAssumptions = {
      ...sampleFinancingAssumptions,
      manualFounderEquity: 30000,
      bankLoanPrincipal: 150000,
    };
    const result = simulateProjectFundingAndLoan(sampleCapexAssumptions, underfundedFinancing);
    // Ressources = 30k + 25k + 150k = 205 000 € vs 250 000 € emplois => Gap = 45 000 €
    expect(result.fundingGap).toBe(45000);
    expect(result.netFundingBalance).toBe(-45000);
    expect(result.isFullyFunded).toBe(false);
  });

  it('synchronise l’apport avec le simulateur d’épargne lorsque l’option est activée', () => {
    const syncedFinancing: ProjectFinancingAssumptions = {
      ...sampleFinancingAssumptions,
      syncFounderEquityFromSavings: true,
      manualFounderEquity: 10000,
    };
    const result = simulateProjectFundingAndLoan(sampleCapexAssumptions, syncedFinancing, 55000);
    expect(result.effectiveFounderEquity).toBe(55000);
    expect(result.netFundingBalance).toBe(5000);
  });

  it('amortit intégralement le capital emprunté jusqu’à 0,00 € à la dernière échéance', () => {
    const result = simulateProjectFundingAndLoan(
      sampleCapexAssumptions,
      sampleFinancingAssumptions
    );
    expect(result.monthlySchedule).toHaveLength(84);
    expect(result.yearlySchedule).toHaveLength(7);

    const lastMonth = result.monthlySchedule[result.monthlySchedule.length - 1];
    expect(lastMonth.endingBalance).toBe(0);

    const totalPrincipalRepaid = result.yearlySchedule.reduce(
      (sum, y) => sum + y.totalPrincipalPaid,
      0
    );
    expect(totalPrincipalRepaid).toBeCloseTo(175000, 1);

    // Mensualité hors assurance pour 175 000 € sur 84 mois à 4.00% = 2 392,04 €
    expect(result.loanSummary.monthlyPaymentAmortizingExclInsurance).toBeCloseTo(2392.04, 2);
    // Assurance mensuelle = 175 000 * 0.0036 / 12 = 52,50 €
    expect(result.loanSummary.monthlyInsurance).toBe(52.5);
  });

  it('gère correctement une période de différé d’amortissement (franchise travaux)', () => {
    const withGrace: ProjectFinancingAssumptions = {
      ...sampleFinancingAssumptions,
      gracePeriodMonths: 6,
    };
    const result = simulateProjectFundingAndLoan(sampleCapexAssumptions, withGrace);
    const graceRows = result.monthlySchedule.slice(0, 6);
    const amortizingRows = result.monthlySchedule.slice(6);

    for (const row of graceRows) {
      expect(row.isGracePeriod).toBe(true);
      expect(row.principalPaid).toBe(0);
      expect(row.endingBalance).toBe(175000);
    }

    expect(amortizingRows[0].isGracePeriod).toBe(false);
    expect(amortizingRows[0].principalPaid).toBeGreaterThan(0);
    expect(amortizingRows[amortizingRows.length - 1].endingBalance).toBe(0);
  });
});

describe('Intégrité des Données par Défaut & Grille Indicative', () => {
  it('ne présente aucune conclusion juridique comme vérifiée sans source officielle ni date', () => {
    expect(DEFAULT_SAVINGS_ASSUMPTIONS.monthlyContribution).toBe(1000);
    expect(DEFAULT_FINANCING_ASSUMPTIONS.hypotheticalMonthlyEbitda).toBe(0);
    expect(DEFAULT_CAPEX_ASSUMPTIONS.leaseAcquisition).toBe(40000);

    for (const item of REGULATORY_FRAMEWORK_ITEMS) {
      expect(item.officialSourceUrl).toBeNull();
      expect(item.lastCheckedDate).toBeNull();
      expect(item.verificationStatus).toContain('Non vérifié');
      expect(item.questionsToValidate.length).toBeGreaterThan(0);
    }
  });

  it('attribue 100/100 sur la grille indicative de visite lorsque toutes les cases sont cochées', () => {
    const res = calculatePropertyCompatibilityScore({
      surfaceSqm: 115,
      monthlyRentExclCharges: 3500,
      hasConcreteSlab: true,
      hasThreePhasePower: true,
      hasBarLicenseAllowed: true,
      hasAdequateFacade: true,
    });
    expect(res.scoreOutOf100).toBe(100);
    expect(res.verdict).toBe('Compatible');
    expect(res.blockers).toHaveLength(0);
  });

  it('signale des questions à vérifier lorsqu’un critère technique est décoché', () => {
    const res = calculatePropertyCompatibilityScore({
      surfaceSqm: 110,
      monthlyRentExclCharges: 3500,
      hasConcreteSlab: false,
      hasThreePhasePower: true,
      hasBarLicenseAllowed: true,
      hasAdequateFacade: true,
    });
    expect(res.verdict).toBe('Disqualifié');
    expect(res.blockers[0]).toContain('Question à vérifier');
  });
});
