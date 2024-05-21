const fs = require('fs');
const {
  fetchStockData, calculateSMA, calculateRSI, checkBuyAlerts, checkSellAlerts
} = require('./helpers/stock');
const emailService = require('./helpers/email');
const { isRecentAlert } = require('./helpers/time');
const { fromEmail, toEmail } = require('./helpers/config');

function readSymbolsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(',').map(symbol => symbol.trim());
}

async function processSymbol(symbol) {
  const smaWindow = 20;
  const smaQuarterlyWindow = 50;
  const smaYearlyWindow = 200;
  const rsiWindow = 14;

  const { timestamps, closes } = await fetchStockData(symbol);
  console.log(`Processing ${symbol}...`);
  const sma = calculateSMA(closes, smaWindow);
  const smaQuarterly = calculateSMA(closes, smaQuarterlyWindow);
  const smaYearly = calculateSMA(closes, smaYearlyWindow);
  const rsi = calculateRSI(closes, rsiWindow);

  // Adjust SMA and RSI arrays to match the closes array length
  const smaAdjusted = Array(closes.length - sma.length).fill(null).concat(sma);
  const smaQAdjusted = Array(closes.length - smaQuarterly.length).fill(null).concat(smaQuarterly);
  const smaYAdjusted = Array(closes.length - smaYearly.length).fill(null).concat(smaYearly);
  const rsiAdjusted = Array(closes.length - rsi.length).fill(null).concat(rsi);

  return { timestamps, closes, smaAdjusted, smaQAdjusted, smaYAdjusted, rsiAdjusted };
}

async function processAlerts(symbol, action, alerts) {
  const recentAlerts = alerts.filter(alert => isRecentAlert(alert.date));
  if (recentAlerts.length > 0) {
    console.log(`${action} Alerts for ${symbol}:`);
    recentAlerts.forEach(alert => {
      console.log(`Date: ${alert.date.toISOString().split('T')[0]}, Close: ${alert.close.toFixed(2)}, RSI: ${alert.rsi.toFixed(2)}, SMA: ${alert.sma.toFixed(2)},
      SMA 50: ${alert.smaQuarterly.toFixed(2)},
      SMA 200: ${alert.smaYearly.toFixed(2)},`);
    });
    await emailService.sendEmail(alerts, symbol, fromEmail, toEmail, action);
  } else {
    console.log(`No recent ${action} alerts for ${symbol}`);
  }
}

async function main() {
  const symbolsFilePath = 'symbols.txt'; // Path to the symbols file
  const symbols = readSymbolsFromFile(symbolsFilePath);

  for (const symbol of symbols) {
    const { timestamps, closes, smaAdjusted, smaQAdjusted, smaYAdjusted, rsiAdjusted } = await processSymbol(symbol);

    const buyAlerts = checkBuyAlerts(timestamps, closes, smaAdjusted, smaQAdjusted, smaYAdjusted, rsiAdjusted);
    if (buyAlerts.length > 0) {
      await processAlerts(symbol, 'BUY', buyAlerts);
    } else {
      console.log(`No BUY alerts for ${symbol}`);
    }

    const sellAlerts = checkSellAlerts(timestamps, closes, smaAdjusted, smaQAdjusted, smaYAdjusted, rsiAdjusted);
    if (sellAlerts.length > 0) {
      await processAlerts(symbol, 'SELL', sellAlerts);
    } else {
      console.log(`No SELL alerts for ${symbol}`);
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
});
