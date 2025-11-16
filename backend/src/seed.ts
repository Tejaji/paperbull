import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedIndices() {
  console.log('🌱 Seeding indices...');
  
  const indices = [
    { symbol: 'NIFTY', displayName: 'NIFTY 50', lotSize: 75 },
    { symbol: 'BANKNIFTY', displayName: 'NIFTY BANK', lotSize: 25 },
    { symbol: 'FINNIFTY', displayName: 'FINNIFTY', lotSize: 40 },
    { symbol: 'MIDCPNIFTY', displayName: 'MIDCAP NIFTY', lotSize: 50 },
    { symbol: 'SENSEX', displayName: 'SENSEX', lotSize: 10 },
    { symbol: 'NIFTYIT', displayName: 'NIFTY IT', lotSize: 25 },
    { symbol: 'NIFTYPHARMA', displayName: 'NIFTY PHARMA', lotSize: 20 },
  ];

  for (const index of indices) {
    await prisma.index.upsert({
      where: { symbol: index.symbol },
      update: index,
      create: index
    });
  }
  
  console.log('✓ Indices seeded - 7 indices created');
}

async function seedOptionContracts() {
  const indices = await prisma.index.findMany();
  
  for (const index of indices) {
    console.log(`🌱 Seeding ${index.displayName} contracts...`);
    
    const basePrices: Record<string, number> = {
      'NIFTY': 25000,
      'BANKNIFTY': 55000,
      'FINNIFTY': 23500,
      'MIDCPNIFTY': 14500,
      'SENSEX': 84000,
      'NIFTYIT': 42000,
      'NIFTYPHARMA': 22000,
    };
    
    const basePrice = basePrices[index.symbol] || 25000;
    const atmStrike = Math.round(basePrice / 100) * 100;
    
    const strikes = [];
    const strikeInterval = index.symbol === 'SENSEX' ? 100 : 50;
    
    for (let i = -10; i <= 10; i++) {
      strikes.push(atmStrike + (i * strikeInterval));
    }
    
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + daysUntilThursday);
    expiry.setHours(15, 30, 0, 0);
    
    const expiryDateString = expiry.toISOString();
    
    for (const strike of strikes) {
      // CE (Call)
      try {
        await prisma.optionContract.upsert({
          where: {
            tradingSymbol: `${index.symbol}${expiry.getDate()}${expiry.toLocaleString('en-US', { month: 'short' }).toUpperCase()}${strike}CE`
          },
          update: {},
          create: {
            tradingSymbol: `${index.symbol}${expiry.getDate()}${expiry.toLocaleString('en-US', { month: 'short' }).toUpperCase()}${strike}CE`,
            indexSymbol: index.symbol,
            strike,
            optionType: 'CE',
            expiryDate: expiryDateString,
            lotSize: index.lotSize,
          }
        });
      } catch (error) {
        console.log(`Skipping ${index.symbol} ${strike}CE - already exists`);
      }
      
      // PE (Put)
      try {
        await prisma.optionContract.upsert({
          where: {
            tradingSymbol: `${index.symbol}${expiry.getDate()}${expiry.toLocaleString('en-US', { month: 'short' }).toUpperCase()}${strike}PE`
          },
          update: {},
          create: {
            tradingSymbol: `${index.symbol}${expiry.getDate()}${expiry.toLocaleString('en-US', { month: 'short' }).toUpperCase()}${strike}PE`,
            indexSymbol: index.symbol,
            strike,
            optionType: 'PE',
            expiryDate: expiryDateString,
            lotSize: index.lotSize,
          }
        });
      } catch (error) {
        console.log(`Skipping ${index.symbol} ${strike}PE - already exists`);
      }
    }
    
    console.log(`✓ ${index.displayName} contracts seeded`);
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    await seedIndices();
    await seedOptionContracts();
    
    console.log('\n✅ Seed completed successfully!');
    console.log('📊 You can now use the trading app.\n');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
