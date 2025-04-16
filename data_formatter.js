const fs = require('fs');
const path = require('path');

// Function to read and parse JSON file
function readJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

// Function to format protocol TVL data
function formatProtocolTvlData(data) {
    if (!data || !data.data || !Array.isArray(data.data)) {
        return [];
    }

    return data.data.map(protocol => ({
        timestamp: data.metadata.collection_info.timestamp,
        protocol_name: protocol.name,
        protocol_id: protocol.id,
        protocol_symbol: protocol.symbol,
        protocol_url: protocol.url,
        description: protocol.description,
        chain: protocol.chain,
        category: protocol.category,
        tvl: protocol.tvl,
        tvl_change_1d: protocol.change_1d,
        tvl_change_7d: protocol.change_7d,
        tvl_change_1m: protocol.change_1m,
        audits: protocol.audits,
        audit_note: protocol.audit_note,
        mcap_tvl: protocol.mcap_tvl,
        forked: protocol.forked,
        module: protocol.module,
        listedAt: protocol.listedAt
    }));
}

// Function to format DEX volume data
function formatDexVolumeData(data) {
    if (!data || !data.data) {
        return [];
    }

    const formattedData = [];
    const timestamp = data.metadata.collection_info.timestamp;

    // Add historical total volume data if available
    if (data.data.totalDataChart) {
        data.data.totalDataChart.forEach(([ts, volume]) => {
            formattedData.push({
                timestamp: new Date(ts * 1000).toISOString(),
                total_volume: volume,
                type: 'historical_total'
            });
        });
    }

    // Add DEX-specific data
    if (data.data.protocols && data.data.protocols[0] && data.data.protocols[0].breakdown24h) {
        const breakdown = data.data.protocols[0].breakdown24h;
        Object.entries(breakdown).forEach(([chain, dexes]) => {
            Object.entries(dexes).forEach(([dexName, volume]) => {
                formattedData.push({
                    timestamp,
                    type: 'dex_specific',
                    dex_name: dexName,
                    chain,
                    volume_24h: volume,
                    volume_24h_change: data.data.protocols[0].change_1d,
                    volume_7d_change: data.data.protocols[0].change_7dover7d,
                    volume_30d_change: data.data.protocols[0].change_30dover30d
                });
            });
        });
    }

    // Add volume summary
    if (data.data.protocols && data.data.protocols[0]) {
        const summary = data.data.protocols[0];
        formattedData.push({
            timestamp,
            type: 'volume_summary',
            total_24h: summary.total24h,
            total_48h_to_24h: summary.total48hto24h,
            total_7d: summary.total7d,
            total_14d_to_7d: summary.total14dto7d,
            total_30d: summary.total30d,
            total_60d_to_30d: summary.total60dto30d,
            total_1y: summary.total1y,
            total_alltime: summary.totalAllTime,
            average_1y: summary.average1y,
            volume_24h_change: summary.change_1d,
            volume_7d_change: summary.change_7d,
            volume_1m_change: summary.change_1m,
            volume_7d_over_7d_change: summary.change_7dover7d,
            volume_30d_over_30d_change: summary.change_30dover30d
        });
    }

    return formattedData;
}

// Function to format yield pool data
function formatYieldPoolData(data) {
    if (!data || !data.data || !data.data.data || !Array.isArray(data.data.data)) {
        return [];
    }

    return data.data.data.map(pool => ({
        timestamp: data.metadata.collection_info.timestamp,
        chain: pool.chain,
        project: pool.project,
        symbol: pool.symbol,
        tvl_usd: pool.tvlUsd,
        apy_base: pool.apyBase,
        apy_reward: pool.apyReward,
        apy: pool.apy,
        reward_tokens: pool.rewardTokens,
        il_risk: pool.ilRisk,
        exposure: pool.exposure,
        predictions: {
            predictedClass: pool.predictions?.predictedClass,
            predictedProbability: pool.predictions?.predictedProbability,
            binnedConfidence: pool.predictions?.binnedConfidence
        }
    }));
}

// Function to format stablecoin data
function formatStablecoinData(data) {
    if (!data || !data.data || !data.data.peggedAssets || !Array.isArray(data.data.peggedAssets)) {
        return [];
    }

    return data.data.peggedAssets.map(coin => ({
        timestamp: data.metadata.collection_info.timestamp,
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.price,
        circulating_supply: coin.circulating,
        market_cap: coin.peggedUSD,
        chains: coin.chains,
        peg_type: coin.pegType,
        peg_mechanism: coin.pegMechanism,
        price_change_24h: coin.priceChange24h,
        market_cap_change_24h: coin.marketCapChange24h,
        circulating_change_24h: coin.circulatingChange24h,
        circulating_change_7d: coin.circulatingChange7d,
        circulating_change_1m: coin.circulatingChange1m
    }));
}

// Function to format fee data
function formatProtocolFeeData(data) {
    if (!data || !data.data || !Array.isArray(data.data.protocols)) {
        return [];
    }

    return data.data.protocols.map(protocol => ({
        timestamp: data.metadata.collection_info.timestamp,
        protocol_name: protocol.name,
        protocol_slug: protocol.slug,
        category: protocol.category,
        total_fees_24h: protocol.totalFees24h,
        total_revenue_24h: protocol.totalRevenue24h,
        fees_change_24h: protocol.feesChange24h,
        revenue_change_24h: protocol.revenueChange24h
    }));
}

// Main function to process all data
function processAllData() {
    const dataFiles = [
        { 
            input: 'data/protocols/tvl/tvl_2025-04-15T22-09-43.110634.json',
            output: 'raw_data/protocols_tvl_raw.json',
            processor: formatProtocolTvlData
        },
        { 
            input: 'data/dex/volumes/volumes_2025-04-15T22-09-43.495076.json',
            output: 'raw_data/dex_volumes_raw.json',
            processor: formatDexVolumeData
        },
        { 
            input: 'data/yields/pools/pools_2025-04-15T22-09-44.415408.json',
            output: 'raw_data/yield_pools_raw.json',
            processor: formatYieldPoolData
        },
        { 
            input: 'data/stablecoins/market/market_2025-04-15T22-09-44.879170.json',
            output: 'raw_data/stablecoins_raw.json',
            processor: formatStablecoinData
        },
        { 
            input: 'data/protocols/fees/fees_2025-04-15T22-09-45.145733.json',
            output: 'raw_data/protocol_fees_raw.json',
            processor: formatProtocolFeeData
        }
    ];

    // Create output directory if it doesn't exist
    const outputDir = './raw_data';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Process each file
    dataFiles.forEach(({ input, output, processor }) => {
        console.log(`Processing ${input}...`);
        const data = readJsonFile(input);
        if (data) {
            const formattedData = processor(data);
            if (formattedData.length > 0) {
                fs.writeFileSync(output, JSON.stringify(formattedData, null, 2));
                console.log(`Formatted data saved to ${output} (${formattedData.length} entries)`);
            } else {
                console.log(`Warning: No data found in ${input}`);
            }
        } else {
            console.log(`Error: Could not read ${input}`);
        }
    });

    console.log('All data formatting completed!');
}

// Run the formatter
processAllData(); 