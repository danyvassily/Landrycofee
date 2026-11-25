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

const baseSavingsAssumptions: SavingsAssumptions = {
  initialSavings: 50000,
  monthlyContribution: 3200,
  monthsToTarget: 13,
  annualYieldPercent: 3.0,
  exceptionalContribution: 10000,
  exceptionalContributionMonth: 6,
  targetFounderEquity: 100000,
};

const baseCapexAssumptions: ProjectCapexAssumptions = {
  leaseAcquisition: 95000,
  renovationAcoustics: 165000,
  laundryEquipment: 88000,
  coffeeBarEquipment: 48000,
  hiFiSoundSystem: 34000,
  legalLicensingArch: 28000,
  workingCapitalReserve: 42000,
};

const baseFinancingAssumptions: ProjectFinancingAssumptions = {
  syncFounderEquityFromSavings: false,
  manualFounderEquity: 105000,
  honorLoanZeroRate: 35000,
  grantsAndSubsidies: 10000,
  bankLoanPrincipal: 350000,
  annualInterestRatePercent: 4.2,
  annualInsuranceRatePercent: 0.36,
  loanDurationYears: 7,
  gracePeriodMonths: 0,
  hypotheticalMonthlyEbitda: 7800,
};

describe('Moteur Financier — Simulateur Épargne & Apport Fondateurs', () => {
  it('calcule exactement le capital final sans rendement (taux 0%)', () => {
    const zeroYield: SavingsAssumptions = {
      ...baseSavingsAssumptions,
      annualYieldPercent: 0,
      exceptionalContribution: 5000,
      exceptionalContributionMonth: 4,
    };

    const result = buildSavingsSchedule(zeroYield, 1.0);
    // 50 000 + (3 200 * 13) + 5 000 = 50 000 + 41 600 + 5 000 = 96 600 €
    expect(result.finalBalance).toBe(96600);
    expect(result.totalPrincipalContributed).toBe(96600);
    expect(result.totalInterestEarned).toBe(0);
    expect(result.schedule).toHaveLength(13);
    expect(result.targetGapOrSurplus).toBe(-3400);
    expect(result.targetReachedMonth).toBeNull();
  });

  it('intègre correctement les intérêts composés mensuels et identifie le mois d’atteinte de la cible', () => {
    const result = buildSavingsSchedule(baseSavingsAssumptions, 1.0);
    // Capital versé = 50 000 + 41 600 + 10 000 = 101 600 € + intérêts > 2 000 €
    expect(result.totalPrincipalContributed).toBe(101600);
    expect(result.totalInterestEarned).toBeGreaterThan(2000);
    expect(result.finalBalance).toBeCloseTo(
      result.totalPrincipalContributed + result.totalInterestEarned,
      2
    );
    expect(result.targetGapOrSurplus).toBeGreaterThan(3600);
    expect(result.targetReachedMonth).toBe(12);
  });

  it('génère les 3 scénarios comparatifs (Prudent -20%, Central 100%, Accéléré +25%)', () => {
    const sim = simulateSavingsScenarios(baseSavingsAssumptions);
    expect(sim.scenarios).toHaveLength(3);
    const [prudent, central, ambitieux] = sim.scenarios;

    expect(prudent.effectiveMonthlyContribution).toBe(2560);
    expect(central.effectiveMonthlyContribution).toBe(3200);
    expect(ambitieux.effectiveMonthlyContribution).toBe(4000);

    expect(prudent.finalBalance).toBeLessThan(central.finalBalance);
    expect(ambitieux.finalBalance).toBeGreaterThan(central.finalBalance);
  });

  it('calcule la mensualité requise pour atteindre exactement la cible d’apport', () => {
    const zeroYield: SavingsAssumptions = {
      initialSavings: 40000,
      monthlyContribution: 2000,
      monthsToTarget: 12,
      annualYieldPercent: 0,
      exceptionalContribution: 6000,
      exceptionalContributionMonth: 6,
      targetFounderEquity: 82000,
    };
    // Reste à financer : 82 000 - 40 000 - 6 000 = 36 000 sur 12 mois => 3 000 €/mois
    const required = calculateRequiredMonthlySavings(zeroYield);
    expect(required).toBe(3000);
  });

  it('retourne 0 € d’effort mensuel requis si le capital initial dépasse déjà la cible', () => {
    const alreadyFunded: SavingsAssumptions = {
      ...baseSavingsAssumptions,
      initialSavings: 120000,
      targetFounderEquity: 100000,
    };
    expect(calculateRequiredMonthlySavings(alreadyFunded)).toBe(0);
  });
});

describe('Moteur Financier — Plan de Financement, Funding Gap & Amortissement', () => {
  it('calcule le coût total du projet, les fonds propres et l’équilibre exact (Funding Gap = 0)', () => {
    const result = simulateProjectFundingAndLoan(baseCapexAssumptions, baseFinancingAssumptions);
    // Somme CAPEX = 95k + 165k + 88k + 48k + 34k + 28k + 42k = 500 000 €
    expect(result.totalProjectCost).toBe(500000);
    // Quasi-fonds propres = 105k + 35k + 10k = 150 000 € (30% du total)
    expect(result.totalQuasiEquity).toBe(150000);
    expect(result.equityRatioPercent).toBe(30);
    // Total financement = 150k + 350k = 500 000 €
    expect(result.totalAvailableFunding).toBe(500000);
    expect(result.fundingGap).toBe(0);
    expect(result.netFundingBalance).toBe(0);
    expect(result.isFullyFunded).toBe(true);
    expect(result.bankReadinessStatus).toBe('solide');
  });

  it('détecte un écart de financement (Funding Gap > 0) lorsque les ressources sont insuffisantes', () => {
    const underfundedFinancing: ProjectFinancingAssumptions = {
      ...baseFinancingAssumptions,
      manualFounderEquity: 70000,
      bankLoanPrincipal: 310000,
    };
    const result = simulateProjectFundingAndLoan(baseCapexAssumptions, underfundedFinancing);
    // Ressources = 70k + 35k + 10k + 310k = 425 000 € vs 500 000 € emplois
    expect(result.fundingGap).toBe(75000);
    expect(result.netFundingBalance).toBe(-75000);
    expect(result.isFullyFunded).toBe(false);
    expect(result.bankReadinessStatus).toBe('insuffisant');
  });

  it('synchronise l’apport fondateur avec le simulateur d’épargne lorsque l’option est activée', () => {
    const syncedFinancing: ProjectFinancingAssumptions = {
      ...baseFinancingAssumptions,
      syncFounderEquityFromSavings: true,
      manualFounderEquity: 50000,
    };
    const result = simulateProjectFundingAndLoan(baseCapexAssumptions, syncedFinancing, 112500);
    expect(result.effectiveFounderEquity).toBe(112500);
    expect(result.netFundingBalance).toBe(7500); // Excédent de 7 500 €
  });

  it('amortit intégralement le capital emprunté jusqu’à 0,00 € à la dernière échéance', () => {
    const result = simulateProjectFundingAndLoan(baseCapexAssumptions, baseFinancingAssumptions);
    expect(result.monthlySchedule).toHaveLength(84); // 7 ans = 84 mois
    expect(result.yearlySchedule).toHaveLength(7);

    const lastMonth = result.monthlySchedule[result.monthlySchedule.length - 1];
    expect(lastMonth.endingBalance).toBe(0);

    const totalPrincipalRepaid = result.yearlySchedule.reduce(
      (sum, y) => sum + y.totalPrincipalPaid,
      0
    );
    expect(totalPrincipalRepaid).toBeCloseTo(350000, 1);

    // Mensualité hors assurance pour 350 000 € sur 84 mois à 4.20% = 4 816,37 €
    expect(result.loanSummary.monthlyPaymentAmortizingExclInsurance).toBeCloseTo(4816.37, 2);
    // Assurance mensuelle = 350 000 * 0.0036 / 12 = 105,00 €
    expect(result.loanSummary.monthlyInsurance).toBe(105);
    expect(result.loanSummary.dscrEstimate).toBeGreaterThan(1.5);
  });

  it('gère correctement une période de différé d’amortissement (franchise travaux)', () => {
    const withGrace: ProjectFinancingAssumptions = {
      ...baseFinancingAssumptions,
      gracePeriodMonths: 6,
    };
    const result = simulateProjectFundingAndLoan(baseCapexAssumptions, withGrace);
    const graceRows = result.monthlySchedule.slice(0, 6);
    const amortizingRows = result.monthlySchedule.slice(6);

    for (const row of graceRows) {
      expect(row.isGracePeriod).toBe(true);
      expect(row.principalPaid).toBe(0);
      expect(row.endingBalance).toBe(350000);
    }

    expect(amortizingRows[0].isGracePeriod).toBe(false);
    expect(amortizingRows[0].principalPaid).toBeGreaterThan(0);
    expect(amortizingRows[amortizingRows.length - 1].endingBalance).toBe(0);
  });
});

describe('Évaluateur Immobilier — Score de Compatibilité Technique Paris', () => {
  it('attribue 100/100 et le statut Compatible à un local réunissant tous les prérequis', () => {
    const res = calculatePropertyCompatibilityScore({
      surfaceSqm: 125,
      monthlyRentExclCharges: 4600,
      hasConcreteSlab: true,
      hasThreePhasePower: true,
      hasBarLicenseAllowed: true,
      hasAdequateFacade: true,
    });
    expect(res.scoreOutOf100).toBe(100);
    expect(res.verdict).toBe('Compatible');
    expect(res.blockers).toHaveLength(0);
  });

  it('disqualifie un local sans dalle béton ou sans autorisation de débit de boissons', () => {
    const res = calculatePropertyCompatibilityScore({
      surfaceSqm: 115,
      monthlyRentExclCharges: 4400,
      hasConcreteSlab: false,
      hasThreePhasePower: true,
      hasBarLicenseAllowed: true,
      hasAdequateFacade: true,
    });
    expect(res.verdict).toBe('Disqualifié');
    expect(res.blockers.length).toBeGreaterThan(0);
  });
});
