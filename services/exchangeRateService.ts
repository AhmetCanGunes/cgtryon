// Exchange Rate Service
// Fetches current USD to TRY exchange rate

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const FALLBACK_RATE = 34.5; // Fallback rate if API fails
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

interface ExchangeRateCache {
  rate: number;
  timestamp: number;
}

// Get cached exchange rate from localStorage
const getCachedRate = (): ExchangeRateCache | null => {
  try {
    const cached = localStorage.getItem('exchangeRate');
    if (cached) {
      const data: ExchangeRateCache = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (less than 1 hour old)
      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading cached exchange rate:', error);
  }
  return null;
};

// Save exchange rate to localStorage
const cacheRate = (rate: number): void => {
  try {
    const data: ExchangeRateCache = {
      rate,
      timestamp: Date.now()
    };
    localStorage.setItem('exchangeRate', JSON.stringify(data));
  } catch (error) {
    console.error('Error caching exchange rate:', error);
  }
};

// Fetch current USD to TRY exchange rate
export const getUSDToTRYRate = async (): Promise<number> => {
  // First, try to get from cache
  const cached = getCachedRate();
  if (cached) {
    console.log('📊 Using cached exchange rate:', cached.rate);
    return cached.rate;
  }

  // If no cache, fetch from API
  try {
    console.log('🌐 Fetching current exchange rate...');
    const response = await fetch(EXCHANGE_RATE_API);
    
    if (!response.ok) {
      throw new Error('Exchange rate API request failed');
    }

    const data = await response.json();
    const rate = data.rates?.TRY;

    if (!rate || typeof rate !== 'number') {
      throw new Error('Invalid exchange rate data');
    }

    console.log('✅ Current USD to TRY rate:', rate);
    
    // Cache the rate
    cacheRate(rate);
    
    return rate;
  } catch (error) {
    console.error('❌ Error fetching exchange rate:', error);
    console.log('⚠️ Using fallback rate:', FALLBACK_RATE);
    
    // Use fallback rate and cache it
    cacheRate(FALLBACK_RATE);
    return FALLBACK_RATE;
  }
};

// Format price with currency symbol
export const formatPrice = (amount: number, currency: 'TRY' | 'USD'): string => {
  if (currency === 'TRY') {
    return `₺${amount.toLocaleString('tr-TR')}`;
  } else {
    return `$${amount.toLocaleString('en-US')}`;
  }
};

// Get packages with calculated TRY prices
export const getPackagesWithCurrentPrices = async () => {
  const { CREDIT_PACKAGES, calculateTRYPrice } = await import('../types');
  const exchangeRate = await getUSDToTRYRate();

  return CREDIT_PACKAGES.map(pkg => ({
    ...pkg,
    price: calculateTRYPrice(pkg.priceUSD || 0, exchangeRate),
    exchangeRate // Include rate for display
  }));
};

