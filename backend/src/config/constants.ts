export const INDICES = [
  { symbol: 'NIFTY', displayName: 'NIFTY 50', lotSize: 75 },
  { symbol: 'BANKNIFTY', displayName: 'NIFTY BANK', lotSize: 35 },
  { symbol: 'FINNIFTY', displayName: 'FINNIFTY', lotSize: 65 },
  { symbol: 'MIDCPNIFTY', displayName: 'MIDCAP NIFTY', lotSize: 140 }
];

export const FEES = {
  brokerage: 0.0003,
  exchangeTxn: 0.0005,
  gst: 0.18,
  sebi: 0.000001,
  stampDuty: 0.00003
};

export const CAPITAL = {
  free: 100000,
  premium: 1000000
};

export const TICK_SIZE = 0.05;
