import { FEES } from '../config/constants';

export function calculateFees(premium: number, qty: number): number {
  const turnover = premium * qty;
  const brokerage = turnover * FEES.brokerage;
  const exchangeFee = turnover * FEES.exchangeTxn;
  const gst = brokerage * FEES.gst;
  const sebi = turnover * FEES.sebi;
  const stamp = turnover * FEES.stampDuty;
  
  return brokerage + exchangeFee + gst + sebi + stamp;
}

export function roundToTick(price: number, tickSize: number = 0.05): number {
  return Math.round(price / tickSize) * tickSize;
}

export function generateTradingSymbol(
  index: string,
  expiry: Date,
  strike: number,
  optionType: 'CE' | 'PE'
): string {
  const year = expiry.getFullYear().toString().slice(-2);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[expiry.getMonth()];
  const day = expiry.getDate().toString().padStart(2, '0');
  
  return `${index}${year}${month}${day}${strike}${optionType}`;
}

export function calculateIntrinsicValue(
  optionType: 'CE' | 'PE',
  strike: number,
  underlyingPrice: number
): number {
  if (optionType === 'CE') {
    return Math.max(0, underlyingPrice - strike);
  } else {
    return Math.max(0, strike - underlyingPrice);
  }
}
// backend/src/utils/toSafeJson.ts

export function toSafeJson(obj: any): any {
  // Recursively converts all BigInt values in an object/array to string
  if (Array.isArray(obj)) {
    return obj.map(toSafeJson);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'bigint') {
        newObj[key] = obj[key].toString();
      } else if (typeof obj[key] === 'object') {
        newObj[key] = toSafeJson(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}
