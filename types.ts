export interface StepData {
  step: number;
  lots: number;
  stopMoney: number;
  cumulativeLoss: number;
  profit: number;
  totalSpend: number;
  totalCapital: number;
  net: number;
}

export interface GlobalParams {
  stopPerLotto: number;
  profitPerLotto: number;
  costPerLotto: number;
  numSteps: number;
}