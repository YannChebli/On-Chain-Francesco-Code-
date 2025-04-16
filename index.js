// DeFi Llama API Data Fetcher
// This script fetches data from various DeFi Llama API endpoints
// for on-chain analytics

const axios = require('axios');
const fs = require('fs');

// Base URLs for different API categories
const BASE_URL = 'https://api.llama.fi';
const COINS_URL = 'https://coins.llama.fi';
const STABLECOINS_URL = 'https://stablecoins.llama.fi';
const YIELDS_URL = 'https://yields.llama.fi';

// Helper function to make API requests with error handling
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
    return null;
  }
}

// Function to save data to JSON file
function saveData(data, filename) {
  fs.writeFileSync(
    `./data/${filename}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`Data saved to ./data/${filename}.json`);
}

// 1. Fetch protocol TVL data
async function fetchProtocolTVL() {
  console.log('Fetching protocol TVL data...');
  const data = await fetchData(`${BASE_URL}/protocols`);
  if (data) {
    saveData(data, 'protocols_tvl');
    return data;
  }
  return null;
}

// 2. Fetch DEX trading volumes
async function fetchDEXVolumes() {
  console.log('Fetching DEX volume data...');
  const data = await fetchData(`${BASE_URL}/overview/dexs`);
  if (data) {
    saveData(data, 'dex_volumes');
    return data;
  }
  return null;
}

// 3. Fetch yield information for liquidity pools
async function fetchYieldPools() {
  console.log('Fetching yield pool data...');
  const data = await fetchData(`${YIELDS_URL}/pools`);
  if (data) {
    saveData(data, 'yield_pools');
    return data;
  }
  return null;
}

// 4. Fetch stablecoin market data
async function fetchStablecoinData() {
  console.log('Fetching stablecoin data...');
  const data = await fetchData(`${STABLECOINS_URL}/stablecoins`);
  if (data) {
    saveData(data, 'stablecoins');
    return data;
  }
  return null;
}

// 5. Fetch fee and revenue metrics
async function fetchFeeData() {
  console.log('Fetching protocol fee data...');
  const data = await fetchData(`${BASE_URL}/overview/fees`);
  if (data) {
    saveData(data, 'protocol_fees');
    return data;
  }
  return null;
}

// Main function to fetch all data
async function fetchAllData() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  
  // Fetch all data types
  const protocols = await fetchProtocolTVL();
  const dexVolumes = await fetchDEXVolumes();
  const yieldPools = await fetchYieldPools();
  const stablecoins = await fetchStablecoinData();
  const fees = await fetchFeeData();
  
  console.log('All data fetching completed!');
  
  // Return summary of fetched data
  return {
    protocolCount: protocols?.length || 0,
    dexCount: dexVolumes?.protocols?.length || 0,
    poolCount: yieldPools?.length || 0,
    stablecoinCount: stablecoins?.length || 0,
    feeProtocolCount: fees?.protocols?.length || 0
  };
}

// Example of fetching data for a specific protocol
async function fetchProtocolDetails(protocolSlug) {
  console.log(`Fetching detailed data for ${protocolSlug}...`);
  
  // Fetch TVL data
  const tvlData = await fetchData(`${BASE_URL}/protocol/${protocolSlug}`);
  
  // Fetch volume data
  const volumeData = await fetchData(`${BASE_URL}/summary/dexs/${protocolSlug}`);
  
  // Fetch fee data
  const feeData = await fetchData(`${BASE_URL}/summary/fees/${protocolSlug}`);
  
  // Combine and save
  const protocolData = {
    tvl: tvlData,
    volume: volumeData,
    fees: feeData
  };
  
  saveData(protocolData, `protocol_${protocolSlug}`);
  return protocolData;
}

// Execute the main function
fetchAllData().then(summary => {
  console.log('Data fetching summary:', summary);
}).catch(error => {
  console.error('Error in main execution:', error);
});

// Example usage:
// fetchProtocolDetails('uniswap'); 