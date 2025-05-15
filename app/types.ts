export interface ShareholdingData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  peRatio: string;
  pbRatio: string;
  eps: string;
  dividendYield: string;
  weekHigh52: string;
  weekLow52: string;
  deliveryQuantity: string;
  deliveryPercentage: string;
  lastUpdated: string;
  dataSource: string;
  data: ShareholdingPattern[];
}

interface ShareholdingPattern {
  category: string;
  percentage: number;
}