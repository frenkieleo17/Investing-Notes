// Yahoo Finance数据服务
// 由于Yahoo Finance API的CORS限制，提供多种数据获取方案

const YAHOO_BASE_URL = '/api/yahoo';
const ALPHAVANTAGE_BASE_URL = '/api/alphavantage';

// 备用数据源 - 使用Alpha Vantage作为备选
const ALPHAVANTAGE_API_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || 'demo';

// 模拟数据生成（开发环境备用）
const generateMockData = (symbol, days = 30) => {
  const data = [];
  const basePrice = symbol === 'NVDA' ? 800 : 100;
  const baseVolume = symbol === 'NVDA' ? 50000000 : 10000000;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const open = basePrice + (Math.random() - 0.5) * 20;
    const close = open + (Math.random() - 0.5) * 15;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    const volume = baseVolume * (0.8 + Math.random() * 0.4);
    
    data.push({
      timestamp: date.getTime(),
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.round(volume)
    });
  }
  
  return data;
};

// 计算移动平均线
const calculateMovingAverages = (data, periods = [5, 20]) => {
  const result = data.map((item, index) => {
    const maData = {};
    
    periods.forEach(period => {
      if (index >= period - 1) {
        const slice = data.slice(index - period + 1, index + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        maData[`ma${period}`] = parseFloat((sum / period).toFixed(2));
      } else {
        maData[`ma${period}`] = null;
      }
    });
    
    return { ...item, ...maData };
  });
  
  return result;
};

// 尝试Yahoo Finance API
export const fetchStockDataFromYahoo = async (symbol) => {
  try {
    const period1 = Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60; // 60天前
    const period2 = Math.floor(Date.now() / 1000);
    
    const url = `${YAHOO_BASE_URL}/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      const stockData = timestamps.map((timestamp, index) => ({
        timestamp: timestamp * 1000,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index]
      })).filter(item => item.open && item.high && item.low && item.close);
      
      return calculateMovingAverages(stockData);
    }
    
    throw new Error('No data from Yahoo Finance');
    
  } catch (error) {
    console.warn('Yahoo Finance API failed, trying alternative:', error.message);
    return await fetchStockDataFromAlphaVantage(symbol);
  }
};

// 备用方案：Alpha Vantage API
export const fetchStockDataFromAlphaVantage = async (symbol) => {
  try {
    if (ALPHAVANTAGE_API_KEY === 'demo') {
      // 使用模拟数据
      return calculateMovingAverages(generateMockData(symbol));
    }
    
    const url = `${ALPHAVANTAGE_BASE_URL}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}&outputsize=compact`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['Time Series (Daily)']) {
      const timeSeries = data['Time Series (Daily)'];
      const stockData = [];
      
      for (const [date, values] of Object.entries(timeSeries)) {
        stockData.push({
          timestamp: new Date(date).getTime(),
          date: date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        });
      }
      
      // 按日期排序
      stockData.sort((a, b) => a.timestamp - b.timestamp);
      
      return calculateMovingAverages(stockData);
    }
    
    throw new Error('No data from Alpha Vantage');
    
  } catch (error) {
    console.warn('Alpha Vantage failed, using mock data:', error.message);
    // 最终备用：生成模拟数据
    return calculateMovingAverages(generateMockData(symbol));
  }
};

// 获取实时报价
export const fetchRealTimeQuote = async (symbol) => {
  try {
    const url = `${YAHOO_BASE_URL}/v6/finance/quote?symbols=${symbol}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data.quoteResponse?.result?.[0]) {
        const quote = data.quoteResponse.result[0];
        return {
          symbol: quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume
        };
      }
    }
    
    // 备用：从历史数据中获取最新价格
    const historicalData = await fetchStockDataFromYahoo(symbol);
    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];
    
    return {
      symbol: symbol,
      price: latest.close,
      change: latest.close - previous.close,
      changePercent: ((latest.close - previous.close) / previous.close) * 100,
      volume: latest.volume
    };
    
  } catch (error) {
    console.warn('Real-time quote failed:', error.message);
    
    // 最终备用：生成模拟实时数据
    const mockData = generateMockData(symbol, 2);
    const latest = mockData[mockData.length - 1];
    const previous = mockData[mockData.length - 2];
    
    return {
      symbol: symbol,
      price: latest.close,
      change: latest.close - previous.close,
      changePercent: ((latest.close - previous.close) / previous.close) * 100,
      volume: latest.volume
    };
  }
};

// 主函数：获取股票数据
export const fetchStockData = async (symbol) => {
  try {
    const [historicalData, realTimeQuote] = await Promise.all([
      fetchStockDataFromYahoo(symbol),
      fetchRealTimeQuote(symbol)
    ]);
    
    return {
      symbol: symbol,
      historicalData: historicalData,
      realTimeQuote: realTimeQuote,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    throw error;
  }
};

export default {
  fetchStockData,
  fetchRealTimeQuote,
  fetchStockDataFromYahoo,
  fetchStockDataFromAlphaVantage
};