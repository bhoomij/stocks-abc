const axios = require('axios');
const { SMA, RSI } = require('technicalindicators');

const CHART_URL= 'https://query1.finance.yahoo.com/v8/finance/chart'
const CHART_INTERVAL = '1d'
const CHART_RANGE = '1y'
const RSI_MIN = 30
const RSI_MAX = 70

async function fetchStockData(symbol) {
  const response = await axios.get(`${CHART_URL}/${symbol}?interval=${CHART_INTERVAL}&range=${CHART_RANGE}`);
  const data = response.data.chart.result[0];
  const timestamps = data.timestamp;
  const closes = data.indicators.quote[0].close;
  return { timestamps, closes };
}

function calculateSMA(closes, window) {
  return SMA.calculate({ period: window, values: closes });
}

function calculateRSI(closes, window) {
  return RSI.calculate({ period: window, values: closes });
}

function checkBuyAlerts(timestamps, closes, sma, sma2, sma3, rsi) {
  const alerts = [];

  for (let i = 0; i < closes.length; i++) {
    const valuesExists = !!closes[i] && !!rsi[i] && sma[i] && sma2[i] && sma3[i]
    const hasBuySignal = valuesExists &&
      rsi[i] < RSI_MIN &&
      sma3[i] > sma2[i] &&
      sma2[i] > sma[i] &&
      closes[i] > sma[i]

    if (hasBuySignal) {
      alerts.push({
        date: new Date(timestamps[i] * 1000),
        close: closes[i],
        rsi: rsi[i],
        sma: sma[i],
        smaQuarterly: sma2[i],
        smaYearly: sma3[i],
      });
    }
  }
  return alerts;
}

function checkSellAlerts(timestamps, closes, sma, sma2, sma3, rsi) {
  const alerts = [];

  for (let i = 0; i < closes.length; i++) {
    const valuesExists = !!closes[i] && !!rsi[i] && sma[i] && sma2[i] && sma3[i]
    const hasSellSignal = valuesExists &&
      rsi[i] > RSI_MAX &&
      sma[i] > sma2[i] &&
      sma2[i] > sma3[i] &&
      closes[i] > sma3[i]

    if (hasSellSignal) {
      alerts.push({
        date: new Date(timestamps[i] * 1000),
        close: closes[i],
        rsi: rsi[i],
        sma: sma[i],
        smaQuarterly: sma2[i],
        smaYearly: sma3[i],
      });
    }
  }
  return alerts;
}

module.exports = {
  fetchStockData,
  calculateSMA,
  calculateRSI,
  checkBuyAlerts,
  checkSellAlerts,
};
