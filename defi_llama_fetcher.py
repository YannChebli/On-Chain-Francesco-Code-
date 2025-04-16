import requests
import json
import os
from pathlib import Path
from datetime import datetime
import time

# Base URLs for different API categories
BASE_URL = 'https://api.llama.fi'
COINS_URL = 'https://coins.llama.fi'
STABLECOINS_URL = 'https://stablecoins.llama.fi'
YIELDS_URL = 'https://yields.llama.fi'

# List of verified working DEXs supported by DeFi Llama API
MAJOR_DEXS = [
    'uniswap',      # Ethereum mainnet DEX
    'sushiswap',    # Multi-chain DEX
    'pancakeswap',  # BNB Chain DEX
    'balancer',     # Multi-chain liquidity protocol
    'quickswap'     # Polygon DEX
]

# Data categories and their descriptions
DATA_CATEGORIES = {
    'protocols': {
        'description': 'Protocol TVL and general information',
        'subcategories': {
            'tvl': 'Total Value Locked data for all protocols',
            'fees': 'Protocol fee and revenue data for all protocols',
            'details': 'Detailed protocol information'
        },
        'data_types': {
            'raw': 'Complete listing of all protocols with basic metrics (TVL, changes, chains)',
            'aggregated': 'Detailed metrics for specific protocols including historical data'
        }
    },
    'dex': {
        'description': 'Decentralized Exchange data and metrics',
        'subcategories': {
            'volumes': 'Trading volume data across all DEXs',
            'liquidity': 'Liquidity pool information and depth',
            'details': 'Detailed DEX-specific metrics and performance'
        },
        'data_types': {
            'raw': 'Complete listing of all DEXs with basic volume and TVL metrics',
            'aggregated': 'Detailed metrics for specific DEXs including TVL, volume trends, and fee data'
        }
    },
    'yields': {
        'description': 'Yield farming and staking opportunities data',
        'subcategories': {
            'pools': 'Yield pool information across protocols',
            'rates': 'Current and historical yield rates and APY data'
        },
        'data_types': {
            'raw': 'Complete listing of all yield pools with current rates and TVL'
        }
    },
    'stablecoins': {
        'description': 'Stablecoin market data and metrics',
        'subcategories': {
            'market': 'Market capitalization and supply data for stablecoins',
            'peg': 'Price stability and peg maintenance metrics'
        },
        'data_types': {
            'raw': 'Complete listing of all stablecoins with market caps, supplies, and chains'
        }
    }
}

# Helper function to make API requests with error handling
def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f"Error fetching data from {url}: {error}")
        return None

# Function to save data to JSON file with enhanced metadata
def save_data(data, category, subcategory=None, protocol_slug=None):
    # Create directory structure
    data_dir = Path('data')
    category_dir = data_dir / category
    if subcategory:
        subcategory_dir = category_dir / subcategory
        subcategory_dir.mkdir(parents=True, exist_ok=True)
    else:
        category_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate timestamp
    timestamp = datetime.now().isoformat()
    is_aggregated = bool(protocol_slug)
    data_type = 'aggregated' if is_aggregated else 'raw'
    
    # Prepare metadata
    metadata = {
        'collection_info': {
            'timestamp': timestamp,
            'collection_method': 'DeFi Llama API request',
            'collection_status': 'success',
            'data_freshness': 'Real-time market data'
        },
        'source_info': {
            'api_base': BASE_URL if category != 'stablecoins' and category != 'yields' else 
                       STABLECOINS_URL if category == 'stablecoins' else YIELDS_URL,
            'endpoint': url.split('/')[-1] if 'url' in locals() else category,
            'data_type': data_type,
            'data_type_description': DATA_CATEGORIES[category]['data_types'].get(data_type, 'N/A'),
            'data_format': 'Structured JSON with standardized metrics'
        },
        'category_info': {
            'main_category': category,
            'subcategory': subcategory,
            'description': DATA_CATEGORIES[category]['description'],
            'subcategory_description': DATA_CATEGORIES[category]['subcategories'].get(subcategory, 'N/A'),
            'metrics_included': ['TVL', 'Volume', 'Fees'] if category == 'dex' else ['TVL', 'Market Metrics']
        }
    }
    
    if protocol_slug:
        metadata['protocol_info'] = {
            'slug': protocol_slug,
            'protocol_type': 'DEX',
            'data_types': ['tvl', 'volume', 'fees'],
            'metrics_description': 'Detailed protocol-specific metrics including TVL, trading volume, and fee data',
            'update_frequency': 'Real-time with slight delay'
        }
    
    data_with_metadata = {
        'metadata': metadata,
        'data': data
    }
    
    filename = f"{protocol_slug}_{timestamp}" if protocol_slug else f"{subcategory}_{timestamp}" if subcategory else f"{category}_{timestamp}"
    filename = filename.replace(':', '-')
    
    save_path = subcategory_dir / f"{filename}.json" if subcategory else category_dir / f"{filename}.json"
    
    with open(save_path, 'w') as f:
        json.dump(data_with_metadata, f, indent=2)
    print(f"Data saved to {save_path} (Type: {data_type})")
    return data_with_metadata

# 1. Fetch protocol TVL data
def fetch_protocol_tvl():
    print('Fetching protocol TVL data...')
    data = fetch_data(f"{BASE_URL}/protocols")
    if data:
        return save_data(data, 'protocols', 'tvl')
    return None

# 2. Fetch DEX trading volumes
def fetch_dex_volumes():
    print('Fetching DEX volume data...')
    data = fetch_data(f"{BASE_URL}/overview/dexs")
    if data:
        return save_data(data, 'dex', 'volumes')
    return None

# 3. Fetch yield information for liquidity pools
def fetch_yield_pools():
    print('Fetching yield pool data...')
    data = fetch_data(f"{YIELDS_URL}/pools")
    if data:
        return save_data(data, 'yields', 'pools')
    return None

# 4. Fetch stablecoin market data
def fetch_stablecoin_data():
    print('Fetching stablecoin data...')
    data = fetch_data(f"{STABLECOINS_URL}/stablecoins")
    if data:
        return save_data(data, 'stablecoins', 'market')
    return None

# 5. Fetch fee and revenue metrics
def fetch_fee_data():
    print('Fetching protocol fee data...')
    data = fetch_data(f"{BASE_URL}/overview/fees")
    if data:
        return save_data(data, 'protocols', 'fees')
    return None

# Fetch detailed data for a specific DEX
def fetch_dex_details(dex_slug):
    print(f"Fetching detailed data for DEX: {dex_slug}...")
    
    tvl_data = fetch_data(f"{BASE_URL}/protocol/{dex_slug}")
    volume_data = fetch_data(f"{BASE_URL}/summary/dexs/{dex_slug}")
    fee_data = fetch_data(f"{BASE_URL}/summary/fees/{dex_slug}")
    
    dex_data = {
        'tvl': tvl_data,
        'volume': volume_data,
        'fees': fee_data
    }
    
    return save_data(dex_data, 'dex', 'details', dex_slug)

# Fetch data for all major DEXs
def fetch_all_dex_data():
    print('Fetching data for all major DEXs...')
    dex_data = {}
    for dex in MAJOR_DEXS:
        dex_data[dex] = fetch_dex_details(dex)
    return dex_data

# Main function to fetch all data
def fetch_all_data():
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    
    protocols = fetch_protocol_tvl()
    dex_volumes = fetch_dex_volumes()
    yield_pools = fetch_yield_pools()
    stablecoins = fetch_stablecoin_data()
    fees = fetch_fee_data()
    all_dex_data = fetch_all_dex_data()
    
    print('All data fetching completed!')
    
    return {
        'collection_summary': {
            'timestamp': datetime.now().isoformat(),
            'total_categories': len(DATA_CATEGORIES),
            'status': 'completed',
            'dex_count': len(MAJOR_DEXS),
            'supported_dexs': MAJOR_DEXS
        },
        'data_summary': {
            'protocols': {
                'count': len(protocols['data']) if protocols else 0,
                'source': protocols['metadata']['source_info'] if protocols else None,
                'data_type': 'Raw protocol listing with basic metrics'
            },
            'dex': {
                'count': len(dex_volumes['data'].get('protocols', [])) if dex_volumes else 0,
                'source': dex_volumes['metadata']['source_info'] if dex_volumes else None,
                'major_dexs': {dex: data['metadata']['source_info'] for dex, data in all_dex_data.items() if data},
                'data_types': {
                    'raw': 'Complete DEX listing with volume data',
                    'aggregated': 'Detailed metrics for major DEXs'
                }
            },
            'yields': {
                'count': len(yield_pools['data']) if yield_pools else 0,
                'source': yield_pools['metadata']['source_info'] if yield_pools else None,
                'data_type': 'Raw yield pool listing'
            },
            'stablecoins': {
                'count': len(stablecoins['data']) if stablecoins else 0,
                'source': stablecoins['metadata']['source_info'] if stablecoins else None,
                'data_type': 'Raw stablecoin market data'
            },
            'fees': {
                'count': len(fees['data'].get('protocols', [])) if fees else 0,
                'source': fees['metadata']['source_info'] if fees else None,
                'data_type': 'Raw protocol fee data'
            }
        }
    }

if __name__ == "__main__":
    try:
        summary = fetch_all_data()
        print('Data fetching summary:', json.dumps(summary, indent=2))
    except Exception as error:
        print('Error in main execution:', error) 